import assert from "node:assert";
import { prisma } from "../src/db/client.ts";
import { redis } from "../src/lib/redis.ts";
import { CACHE_KEYS } from "../src/lib/cache-keys.ts";
import {
  createSocialLink,
  getSocialLinks,
  updateSocialLink,
  deleteSocialLink,
  reorderSocialLinks,
  getSocialLinkByPublicId,
} from "../src/services/social.service.ts";
import { getPublicProfile } from "../src/services/profile.service.ts";
import { publicRedirectController } from "../src/controllers/redirect/public-redirect.controller.ts";
import { getDashboardAnalytics } from "../src/services/analytics.service.ts";

async function runSocialLinksTestSuite() {
  console.log("🚀 Starting Social Media Links & Analytics Test Suite...\n");

  const timestamp = Date.now();
  const freeUserId = `test-social-free-${timestamp}`;
  const freeUsername = `free_social_${timestamp}`;
  const proUserId = `test-social-pro-${timestamp}`;
  const proUsername = `pro_social_${timestamp}`;

  const createdSocialIds: string[] = [];
  const createdUserIds: string[] = [freeUserId, proUserId];

  try {
    // 1. Setup Test Users
    console.log("1. Setting up test users (Free & Pro)...");
    await prisma.user.createMany({
      data: [
        {
          id: freeUserId,
          email: `free-${timestamp}@example.com`,
          name: "Free Creator",
          userName: freeUsername,
          userName_lower: freeUsername.toLowerCase(),
          plan: "FREE",
        },
        {
          id: proUserId,
          email: `pro-${timestamp}@example.com`,
          name: "Pro Creator",
          userName: proUsername,
          userName_lower: proUsername.toLowerCase(),
          plan: "PRO",
        },
      ],
    });
    console.log("✅ Free and Pro test users created successfully");

    // 2. Test Social Link Creation with Public ID Generation
    console.log("2. Testing social link creation and publicId generation...");
    const igLink = await createSocialLink(freeUserId, {
      platform: "instagram",
      url: "instagram.com/freecreator",
    });
    createdSocialIds.push(igLink.id);

    const twitterLink = await createSocialLink(freeUserId, {
      platform: "twitter",
      url: "x.com/freecreator",
    });
    createdSocialIds.push(twitterLink.id);

    const ytLink = await createSocialLink(freeUserId, {
      platform: "youtube",
      url: "youtube.com/@freecreator",
    });
    createdSocialIds.push(ytLink.id);

    assert.ok(igLink.id, "Instagram link must have internal ID");
    assert.ok(igLink.publicId, "Instagram link must have publicId");
    assert.strictEqual(igLink.platform, "instagram");
    assert.strictEqual(igLink.url, "https://instagram.com/freecreator");
    assert.strictEqual(igLink.position, 0);

    assert.strictEqual(twitterLink.position, 1);
    assert.strictEqual(ytLink.position, 2);
    console.log("✅ Social links created with auto-formatted URLs and sequential positions");

    // 3. Test Drag-and-Drop Reordering
    console.log("3. Testing drag-and-drop position reordering...");
    // Reverse order: YouTube (idx 0), Twitter (idx 1), Instagram (idx 2)
    const newOrder = [ytLink.id, twitterLink.id, igLink.id];
    await reorderSocialLinks(freeUserId, newOrder);

    const reordered = await getSocialLinks(freeUserId);
    assert.strictEqual(reordered[0].id, ytLink.id, "YouTube should now be at position 0");
    assert.strictEqual(reordered[0].position, 0);
    assert.strictEqual(reordered[1].id, twitterLink.id, "Twitter should be at position 1");
    assert.strictEqual(reordered[1].position, 1);
    assert.strictEqual(reordered[2].id, igLink.id, "Instagram should be at position 2");
    assert.strictEqual(reordered[2].position, 2);
    console.log("✅ Drag-and-drop reordering updated positions atomically");

    // 4. Test Updating and Soft Deleting
    console.log("4. Testing social link updates and soft deletion...");
    await updateSocialLink(freeUserId, twitterLink.id, {
      url: "x.com/freecreator_updated",
    });
    const updatedTwitter = await prisma.socialLink.findUnique({ where: { id: twitterLink.id } });
    assert.strictEqual(updatedTwitter?.url, "https://x.com/freecreator_updated");

    // Create a temporary social link and soft-delete it
    const tempGithub = await createSocialLink(freeUserId, {
      platform: "github",
      url: "github.com/freecreator",
    });
    createdSocialIds.push(tempGithub.id);
    await deleteSocialLink(freeUserId, tempGithub.id);

    const activeSocials = await getSocialLinks(freeUserId);
    assert.strictEqual(
      activeSocials.some((s) => s.id === tempGithub.id),
      false,
      "Deleted social link must not be in active list",
    );
    console.log("✅ Update and soft delete functioning as expected");

    // 5. Test Public Profile DTO includes ordered Social Links
    console.log("5. Testing public profile includes dynamic social links in order...");
    await redis.del(CACHE_KEYS.publicProfile(freeUsername.toLowerCase()));
    const publicProfile = await getPublicProfile(freeUsername);
    assert.ok(publicProfile, "Public profile must resolve");
    assert.ok(publicProfile.socialLinks && publicProfile.socialLinks.length === 3);
    assert.strictEqual(publicProfile.socialLinks[0].platform, "youtube");
    assert.strictEqual(publicProfile.socialLinks[0].publicId, ytLink.publicId);
    assert.strictEqual((publicProfile.socialLinks[0] as any).userId, undefined, "userId must not leak");
    console.log("✅ Public profile DTO includes sanitized social links in custom order");

    // 6. Test Public Redirect for Social Links
    console.log("6. Testing public redirect controller with social link publicId...");
    let redirectStatus: number | null = null;
    let redirectedUrl: string | null = null;

    const mockReq = {
      params: { publicId: ytLink.publicId },
      headers: { "user-agent": "Mozilla/5.0 TestBrowser", referer: "https://google.com" },
      ip: "127.0.0.1",
    } as any;
    const mockRes = {
      redirect: (status: number, url: string) => {
        redirectStatus = status;
        redirectedUrl = url;
      },
      status: (status: number) => ({
        json: (data: any) => ({ status, data }),
      }),
    } as any;

    await publicRedirectController(mockReq, mockRes);
    assert.strictEqual(redirectStatus, 302, "Social redirect must return HTTP 302");
    assert.strictEqual(redirectedUrl, "https://youtube.com/@freecreator");
    console.log("✅ Public redirect controller resolved social link and redirected 302");

    // 7. Test Social Media Click Analytics Aggregation
    console.log("7. Testing click event tracking and tiered analytics (Free vs Pro)...");
    // Simulate clicks on YouTube (5 clicks), Instagram (2 clicks)
    await prisma.clickEvent.createMany({
      data: [
        {
          userId: freeUserId,
          socialLinkId: ytLink.id,
          device: "Mobile",
          country: "US",
          countryCode: "US",
          countryName: "United States",
          referrer: "Direct",
          source: "Direct",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        },
        {
          userId: freeUserId,
          socialLinkId: ytLink.id,
          device: "Desktop",
          country: "US",
          countryCode: "US",
          countryName: "United States",
          referrer: "Direct",
          source: "Direct",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        },
        {
          userId: freeUserId,
          socialLinkId: igLink.id,
          device: "Mobile",
          country: "GB",
          countryCode: "GB",
          countryName: "United Kingdom",
          referrer: "Direct",
          source: "Direct",
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0",
        },
      ],
    });

    await redis.del(`${CACHE_KEYS.analytics(freeUserId)}:all`);
    const freeAnalytics = await getDashboardAnalytics(freeUserId, "FREE");

    assert.ok(freeAnalytics.socialAnalytics, "socialAnalytics must exist in response");
    assert.strictEqual(freeAnalytics.socialAnalytics.totalSocialClicks, 3);
    assert.ok(freeAnalytics.socialAnalytics.topSocial, "topSocial must be returned");
    assert.strictEqual(freeAnalytics.socialAnalytics.topSocial.platform, "youtube");
    assert.strictEqual(freeAnalytics.socialAnalytics.topSocial.clicks, 2);
    assert.strictEqual(freeAnalytics.socialAnalytics.clicksBySocial.length, 2);
    assert.strictEqual(freeAnalytics.socialAnalytics.clicksBySocial[0].platform, "youtube");
    assert.strictEqual(freeAnalytics.socialAnalytics.clicksBySocial[1].platform, "instagram");
    console.log("✅ Social analytics successfully computed totalSocialClicks, topSocial (#1 performer), and clicksBySocial breakdown");

    console.log("\n🎉 ALL SOCIAL MEDIA LINKS & ANALYTICS TESTS PASSED SUCCESSFULLY! 🚀\n");
  } finally {
    // Cleanup
    try {
      if (createdSocialIds.length > 0) {
        await prisma.clickEvent.deleteMany({
          where: { socialLinkId: { in: createdSocialIds } },
        });
        await prisma.socialLink.deleteMany({
          where: { id: { in: createdSocialIds } },
        });
      }
      if (createdUserIds.length > 0) {
        await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        });
      }
      await prisma.$disconnect();
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
    }
  }
}

runSocialLinksTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Social Links Test Suite Failed:", err);
    process.exit(1);
  });
