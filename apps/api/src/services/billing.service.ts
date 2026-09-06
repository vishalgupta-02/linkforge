import type Stripe from "stripe";
import { prisma } from "../db/client.ts";
import { stripe } from "../lib/stripe.ts";
import { AppError } from "../utils/api-error.ts";
import { isProPlan } from "../utils/plan.ts";
import { enqueueProUpgradeEmail } from "../queues/email.queue.ts";

export const createProCheckoutSession = async (userId: string) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new AppError("Stripe configuration is missing on server", 500);
  }

  const proPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
  if (!proPriceId) {
    throw new AppError(
      "Stripe Pro price configuration is missing on server",
      500,
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      userName: true,
      plan: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (isProPlan(user.plan)) {
    throw new AppError("You already have an active Pro subscription.", 409);
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: proPriceId,
          quantity: 1,
        },
      ],
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        plan: "PRO",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: "PRO",
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${frontendUrl}/dashboard?checkout=success`,
      cancel_url: `${frontendUrl}/#pricing?checkout=cancelled`,
    });

    if (!session.url) {
      throw new AppError("Failed to generate Stripe checkout URL", 500);
    }

    return {
      url: session.url,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("❌ Stripe checkout session error:", error);
    throw new AppError(
      error?.message || "Failed to create Stripe checkout session",
      500,
    );
  }
};

export const createCustomerPortalSession = async (userId: string) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new AppError("Stripe configuration is missing on server", 500);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      userName: true,
      plan: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.stripeCustomerId) {
    throw new AppError(
      "No billing account is associated with this user. Please upgrade to Pro first.",
      400,
    );
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const returnUrl = `${frontendUrl}/dashboard/settings`;
  const portalConfigId = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
      configuration: portalConfigId || undefined,
    });

    if (!session.url) {
      throw new AppError(
        "Failed to generate Stripe Customer Portal URL",
        500,
      );
    }

    return {
      url: session.url,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("❌ Stripe Customer Portal session error:", error);
    throw new AppError(
      error?.message || "Failed to create Stripe Customer Portal session",
      500,
    );
  }
};

export const getBillingStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      userName: true,
      plan: true,
      planExpiry: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  let subscriptionStatus = user.plan === "FREE" ? "INACTIVE" : "ACTIVE";
  let nextBillingDate: string | null = null;
  let cancelAtPeriodEnd = false;

  if (user.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId,
      );
      subscriptionStatus = subscription.status.toUpperCase();
      cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
      if (subscription.items.data[0]?.price?.recurring?.interval) {
        // has recurring interval
      }
      if (subscription.current_period_end) {
        nextBillingDate = new Date(
          subscription.current_period_end * 1000,
        ).toISOString();
      }
    } catch (err) {
      console.warn(
        `⚠️ Could not fetch Stripe subscription ${user.stripeSubscriptionId}:`,
        err,
      );
      if (user.planExpiry && user.planExpiry.getTime() > 0) {
        nextBillingDate = user.planExpiry.toISOString();
      }
    }
  }

  return {
    plan: user.plan,
    subscriptionStatus,
    nextBillingDate,
    cancelAtPeriodEnd,
    hasBillingAccount: Boolean(user.stripeCustomerId),
  };
};

const handleCheckoutSessionCompleted = async (
  eventId: string,
  session: Stripe.Checkout.Session,
) => {
  // Only process subscription checkouts
  if (session.mode !== "subscription") {
    console.log(
      `ℹ️ Ignoring non-subscription checkout session: ${session.id} (mode: ${session.mode})`,
    );
    // Mark event processed so we do not re-evaluate
    await prisma.stripeWebhookEvent.create({
      data: {
        eventId,
        eventType: "checkout.session.completed",
      },
    });
    return;
  }

  const userId =
    session.metadata?.userId || session.client_reference_id || null;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        userName: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
  }

  if (!user && customerId) {
    user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: {
        id: true,
        email: true,
        name: true,
        userName: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
  }

  if (!user) {
    console.warn(
      `⚠️ Could not find Linkforge user for completed checkout session ${session.id} (userId: ${userId}, customerId: ${customerId})`,
    );
    // Persist event to avoid endless retries on unknown user
    await prisma.stripeWebhookEvent.create({
      data: {
        eventId,
        eventType: "checkout.session.completed",
      },
    });
    return;
  }

  // Atomic database transaction: persist webhook event ID + update user plan + write audit log
  await prisma.$transaction(async (tx) => {
    // 1. Enforces uniqueness on eventId against duplicate/concurrent deliveries
    await tx.stripeWebhookEvent.create({
      data: {
        eventId,
        eventType: "checkout.session.completed",
      },
    });

    // 2. Upgrade user to PRO and store stripe identifiers
    await tx.user.update({
      where: { id: user.id },
      data: {
        plan: "PRO",
        stripeCustomerId: customerId || user.stripeCustomerId,
        stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
      },
    });

    // 3. Write audit log
    await tx.auditlog.create({
      data: {
        userId: user.id,
        action: "PLAN_UPGRADED",
        metadata: {
          stripeEventId: eventId,
          stripeSessionId: session.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          plan: "PRO",
        },
        ipAddress: "stripe_webhook",
      },
    });
  });

  console.log(
    `✅ Successfully upgraded user ${user.id} (${user.userName || "unknown"}) to PRO (eventId=${eventId})`,
  );

  // 4. Asynchronously enqueue Pro upgrade congratulations email job in BullMQ
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const dashboardUrl = `${frontendUrl.replace(/\/$/, "")}/dashboard`;
    await enqueueProUpgradeEmail(
      {
        userId: user.id,
        userName: user.userName || user.name || "Creator",
        email: user.email,
        dashboardUrl,
      },
      eventId,
    );
    console.log(
      `📬 Enqueued Pro upgrade congratulations email for user ${user.id} (${user.email})`,
    );
  } catch (emailQueueError) {
    console.error(
      `❌ Failed to enqueue Pro upgrade email for user ${user.id}:`,
      emailQueueError,
    );
  }
};

const handleSubscriptionDeleted = async (
  eventId: string,
  subscription: Stripe.Subscription,
) => {
  const userId = subscription.metadata?.userId || null;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || null;
  const subscriptionId = subscription.id;

  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
  }

  if (!user && subscriptionId) {
    user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: {
        id: true,
        userName: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
  }

  if (!user && customerId) {
    user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
      select: {
        id: true,
        userName: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
  }

  if (!user) {
    console.warn(
      `⚠️ Could not find Linkforge user for deleted subscription ${subscription.id} (customerId: ${customerId})`,
    );
    // Persist event to avoid endless retries on unknown user
    await prisma.stripeWebhookEvent.create({
      data: {
        eventId,
        eventType: "customer.subscription.deleted",
      },
    });
    return;
  }

  // Atomic database transaction: persist webhook event ID + downgrade user + write audit log
  await prisma.$transaction(async (tx) => {
    // 1. Enforces uniqueness on eventId against duplicate/concurrent deliveries
    await tx.stripeWebhookEvent.create({
      data: {
        eventId,
        eventType: "customer.subscription.deleted",
      },
    });

    // 2. Downgrade user to FREE and clear active subscription ID
    await tx.user.update({
      where: { id: user.id },
      data: {
        plan: "FREE",
        stripeSubscriptionId: null,
      },
    });

    // 3. Write audit log
    await tx.auditlog.create({
      data: {
        userId: user.id,
        action: "PLAN_CANCELLED",
        metadata: {
          stripeEventId: eventId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          plan: "FREE",
        },
        ipAddress: "stripe_webhook",
      },
    });
  });

  console.log(
    `✅ Successfully downgraded user ${user.id} (${user.userName || "unknown"}) to FREE (eventId=${eventId})`,
  );
};

export const handleStripeWebhook = async (
  rawBody: Buffer | string,
  signature: string | undefined,
) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ Missing STRIPE_WEBHOOK_SECRET in environment variables");
    throw new AppError("Stripe webhook secret is not configured on server", 500);
  }

  if (!signature) {
    throw new AppError("Missing Stripe signature header", 400);
  }

  // 1. Verify Stripe signature BEFORE any database or deduplication operations
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(
      "❌ Stripe webhook signature verification failed:",
      err?.message,
    );
    throw new AppError(
      `Webhook signature verification failed: ${err?.message}`,
      400,
    );
  }

  // 2. Check if this exact Stripe event.id has already been processed in database
  const existingEvent = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent) {
    console.log(
      `ℹ️ Stripe webhook duplicate ignored: eventId=${event.id} (eventType=${event.type})`,
    );
    return { received: true, duplicate: true };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(event.id, session);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(event.id, subscription);
        break;
      }

      default: {
        console.log(`ℹ️ Unhandled Stripe event received: ${event.type} (${event.id})`);
        await prisma.stripeWebhookEvent.create({
          data: {
            eventId: event.id,
            eventType: event.type,
          },
        });
        break;
      }
    }

    return { received: true };
  } catch (error: any) {
    // Handle concurrent duplicate race condition where two identical webhook events arrive at the same time
    if (
      error?.code === "P2002" ||
      error?.message?.includes("Unique constraint") ||
      error?.message?.includes("unique constraint")
    ) {
      console.log(
        `ℹ️ Concurrent duplicate Stripe webhook event caught via UNIQUE constraint: eventId=${event.id}`,
      );
      return { received: true, duplicate: true };
    }

    console.error(
      `❌ Stripe webhook processing failed: eventId=${event.id} (${event.type}):`,
      error,
    );
    throw error;
  }
};
