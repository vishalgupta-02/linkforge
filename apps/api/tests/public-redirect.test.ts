import assert from "node:assert";
import { prisma } from "../src/db/client.ts";
import { redis } from "../src/lib/redis.ts";
import { CACHE_KEYS } from "../src/lib/cache-keys.ts";
import {
  createLink,
  getLinkByPublicId,
  getLinkById,
  updateLink,
  deleteLink,
  toggleLink,
  getPublicLinks,
} from "../src/services/link.service.ts";
import { getPublicProfile } from "../src/services/profile.service.ts";
import { backfillPublicIds } from "../src/scripts/backfill-public-ids.ts";
import { generatePublicId, isValidPublicId } from "../src/utils/public-id.ts";
import { isSafeDestinationUrl } from "../src/validators/link.validator.ts";
import { publicRedirectController } from "../src/controllers/redirect/public-redirect.controller.ts";

async function runPublicRedirectTestSuite() {
  console.log("🚀 Starting Public Redirect & Internal ID Decoupling Test Suite...\n");

  const timestamp = Date.now();
  const userId = `test-redirect-user-${timestamp}`;
  const username = `redirect_user_${timestamp}`;
  const createdLinkIds: string[] = [];

  try {
    // 1. Setup Test User
    console.log("1. Setting up test user in database...");
    await prisma.user.create({
      data: {
        id: userId,
        email: `redirect-${timestamp}@example.com`,
        name: "Redirect Test User",
        userName: username,
        userName_lower: username.toLowerCase(),
        plan: "PRO",
      },
    });
    console.log("✅ Test user created successfully");

    // 2. Test Public ID Generator & Validator
    console.log("2. Testing public ID generation and format validation...");
    const testId1 = generatePublicId();
    const testId2 = generatePublicId();
    assert.notStrictEqual(testId1, testId2, "Generated public IDs must be distinct");
    assert.strictEqual(isValidPublicId(testId1), true, "Generated ID must be valid Base64URL");
    assert.strictEqual(isValidPublicId(""), false, "Empty string must be invalid publicId");
    assert.strictEqual(isValidPublicId("invalid id with spaces"), false, "Spaces must be invalid");
    assert.strictEqual(isValidPublicId("<script>alert(1)</script>"), false, "Script injection must be invalid");
    assert.strictEqual(isValidPublicId("abc"), false, "Too short ID must be invalid (<8 chars)");
    console.log("✅ Public ID generator & format validator verified");

    // 3. Test Link Creation Generates Decoupled Public ID
    console.log("3. Testing link creation generates publicId decoupled from database ID...");
    const link1 = await createLink(userId, {
      title: "My Portfolio",
      url: "https://example.com/portfolio",
      public: true,
      position: 0,
    });
    createdLinkIds.push(link1.id);

    assert.ok(link1.id, "Link must have internal database ID");
    assert.ok(link1.publicId, "Link must have generated publicId");
    assert.notStrictEqual(link1.id, link1.publicId, "publicId must NOT equal internal database ID");
    assert.strictEqual(link1.publicId.includes(userId), false, "publicId must not contain userId");
    assert.strictEqual(isValidPublicId(link1.publicId), true, "publicId must match valid format");
    console.log(`✅ Link created with internal ID: ${link1.id} and publicId: ${link1.publicId}`);

    // 4. Test publicId Immutability (cannot be altered by client payload)
    console.log("4. Testing that publicId cannot be changed via update payload...");
    const originalPublicId = link1.publicId;
    await updateLink(userId, link1.id, {
      title: "My Updated Portfolio",
      publicId: "malicious-hacked-public-id",
    });
    const refreshedLink = await prisma.link.findUnique({ where: { id: link1.id } });
    assert.strictEqual(refreshedLink?.publicId, originalPublicId, "publicId must remain unchanged after update");
    assert.strictEqual(refreshedLink?.title, "My Updated Portfolio", "Title should update successfully");
    console.log("✅ publicId is protected against client manipulation");

    // 5. Test Redis Caching for Link Resolution
    console.log("5. Testing Redis caching for getLinkByPublicId (cache miss then hit)...");
    const cacheKey = CACHE_KEYS.redirect(originalPublicId!);
    await redis.del(cacheKey); // Ensure clean state

    // 5a. Cache miss -> reads from DB, populates Redis
    const resolvedFromDb = await getLinkByPublicId(originalPublicId!);
    assert.ok(resolvedFromDb, "Link must resolve from database");
    assert.strictEqual(resolvedFromDb?.id, link1.id);
    assert.strictEqual(resolvedFromDb?.url, "https://example.com/portfolio");

    const cachedRaw = await redis.get(cacheKey);
    assert.ok(cachedRaw, "Link must be cached in Redis with redirect: key");
    const parsedCache = JSON.parse(cachedRaw!);
    assert.strictEqual(parsedCache.id, link1.id);

    // 5b. Cache hit -> reads directly from Redis
    const resolvedFromCache = await getLinkByPublicId(originalPublicId!);
    assert.deepStrictEqual(resolvedFromCache, parsedCache, "Cache hit must return parsed link");
    console.log("✅ Redis caching & database fallback working accurately");

    // 6. Test Cache Invalidation on Link Mutation (Toggle, Update, Delete)
    console.log("6. Testing cache invalidation on link updates, toggle, and soft-delete...");
    // 6a. Toggle -> invalidates cache
    await toggleLink(userId, link1.id);
    const cacheAfterToggle = await redis.get(cacheKey);
    assert.strictEqual(cacheAfterToggle, null, "Cache must be invalidated after link toggle");

    // Inactive link must not resolve
    const inactiveResolved = await getLinkByPublicId(originalPublicId!);
    assert.strictEqual(inactiveResolved, null, "Inactive link must return null");

    // Toggle back active
    await toggleLink(userId, link1.id);

    // 6b. Soft-delete -> invalidates cache and stops resolving
    await deleteLink(userId, link1.id);
    const cacheAfterDelete = await redis.get(cacheKey);
    assert.strictEqual(cacheAfterDelete, null, "Cache must be invalidated after soft-delete");

    const deletedResolved = await getLinkByPublicId(originalPublicId!);
    assert.strictEqual(deletedResolved, null, "Deleted link must return null from getLinkByPublicId");
    console.log("✅ Cache invalidation and inactive/deleted link guard functioning correctly");

    // 7. Test Idempotent Backfill Script
    console.log("7. Testing idempotent backfill script on legacy links without publicId...");
    // Create an un-backfilled link directly in DB
    const rawLegacyLink = await prisma.link.create({
      data: {
        userId,
        title: "Legacy Link Without PublicId",
        url: "https://example.com/legacy",
        position: 1,
        public: true,
        isActive: true,
      },
    });
    createdLinkIds.push(rawLegacyLink.id);

    // Manually ensure publicId is null
    await prisma.link.update({
      where: { id: rawLegacyLink.id },
      data: { publicId: null },
    });

    const checkBefore = await prisma.link.findUnique({ where: { id: rawLegacyLink.id } });
    assert.strictEqual(checkBefore?.publicId, null, "Public ID should be null prior to backfill");

    // Run backfill
    const backfillResult1 = await backfillPublicIds();
    assert.ok(backfillResult1.updated >= 1, "Backfill must update at least 1 link");

    const checkAfter = await prisma.link.findUnique({ where: { id: rawLegacyLink.id } });
    assert.ok(checkAfter?.publicId, "Link must have valid publicId after backfill");
    assert.strictEqual(isValidPublicId(checkAfter.publicId), true);

    // Run backfill again to verify idempotency
    const backfillResult2 = await backfillPublicIds();
    assert.strictEqual(backfillResult2.total, 0, "Second backfill must find 0 unbackfilled links");
    assert.strictEqual(backfillResult2.updated, 0);
    console.log("✅ Backfill script successfully and idempotently populated public IDs");

    // 8. Test Public Profile & Public Links DTO (Internal DB IDs NOT Leaked)
    console.log("8. Testing public profile DTO does NOT expose internal link database IDs...");
    // Create fresh active link
    const activeLink = await createLink(userId, {
      title: "Public Blog",
      url: "https://example.com/blog",
      position: 0,
      public: true,
    });
    createdLinkIds.push(activeLink.id);

    // Invalidate profile cache to fetch freshly
    await redis.del(CACHE_KEYS.publicProfile(username));

    const publicProfile = await getPublicProfile(username);
    assert.ok(publicProfile, "Public profile must be found");
    assert.ok(publicProfile.links && publicProfile.links.length > 0, "Links must be returned");

    const firstPublicLink = publicProfile.links[0] as any;
    assert.ok(firstPublicLink.publicId, "Public link must expose publicId");
    assert.strictEqual(firstPublicLink.id, undefined, "Public link MUST NOT expose internal database id");
    assert.strictEqual(firstPublicLink.userId, undefined, "Public link MUST NOT expose internal userId");
    assert.strictEqual(firstPublicLink.title, "Public Blog");

    const directPublicLinks = await getPublicLinks(username);
    assert.ok(directPublicLinks.length > 0);
    const firstDirectLink = directPublicLinks[0] as any;
    assert.ok(firstDirectLink.publicId, "getPublicLinks must expose publicId");
    assert.strictEqual(firstDirectLink.id, undefined, "getPublicLinks MUST NOT expose internal database id");
    console.log("✅ Public DTO and public link endpoints strictly exclude internal database IDs");

    // 9. Test Destination URL Protocol Safety Validation
    console.log("9. Testing destination URL protocol safety (rejecting dangerous schemes)...");
    assert.strictEqual(isSafeDestinationUrl("https://google.com"), true);
    assert.strictEqual(isSafeDestinationUrl("http://localhost:3000/sub"), true);
    assert.strictEqual(isSafeDestinationUrl("javascript:alert(document.cookie)"), false);
    assert.strictEqual(isSafeDestinationUrl("data:text/html,<script>alert(1)</script>"), false);
    assert.strictEqual(isSafeDestinationUrl("vbscript:msgbox(1)"), false);
    assert.strictEqual(isSafeDestinationUrl("//malicious.com/phish"), false);
    console.log("✅ Destination URL protocol safety checks validated");

    // 10. Test Public Redirect Controller End-to-End Simulation
    console.log("10. Testing public redirect controller responses (302, 400, 404)...");
    // 10a. Valid publicId -> 302 Redirect
    let redirectedUrl: string | null = null;
    let redirectStatus: number | null = null;
    const mockReqValid = {
      params: { publicId: activeLink.publicId },
      headers: { "user-agent": "Mozilla/5.0 TestBrowser", referer: "https://twitter.com" },
      ip: "127.0.0.1",
    } as any;
    const mockResValid = {
      redirect: (status: number, url: string) => {
        redirectStatus = status;
        redirectedUrl = url;
      },
      status: (status: number) => ({
        json: (data: any) => ({ status, data }),
      }),
    } as any;

    await publicRedirectController(mockReqValid, mockResValid);
    assert.strictEqual(redirectStatus, 302, "Valid redirect must return HTTP 302");
    assert.strictEqual(redirectedUrl, "https://example.com/blog", "Redirect destination must match link URL");

    // 10b. Invalid format -> 400 Bad Request
    let errorStatus = 0;
    let errorMessage = "";
    const mockReqInvalidFormat = {
      params: { publicId: "bad id!" },
    } as any;
    const mockResInvalidFormat = {
      status: (status: number) => {
        errorStatus = status;
        return {
          json: (data: any) => {
            errorMessage = data.message;
          },
        };
      },
    } as any;

    await publicRedirectController(mockReqInvalidFormat, mockResInvalidFormat);
    assert.strictEqual(errorStatus, 400, "Malformed publicId must return 400");
    assert.strictEqual(errorMessage, "Invalid redirect identifier");

    // 10c. Nonexistent ID -> 404 Not Found
    const mockReqNotFound = {
      params: { publicId: "nonexistent_id_12345" },
    } as any;
    const mockResNotFound = {
      status: (status: number) => {
        errorStatus = status;
        return {
          json: (data: any) => {
            errorMessage = data.message;
          },
        };
      },
    } as any;

    await publicRedirectController(mockReqNotFound, mockResNotFound);
    assert.strictEqual(errorStatus, 404, "Nonexistent publicId must return 404");
    assert.strictEqual(errorMessage, "Link not found");
    console.log("✅ Public redirect controller behavior verified (302, 400, 404)");

    console.log("\n🎉 ALL PUBLIC REDIRECT & ID DECOUPLING TESTS PASSED SUCCESSFULLY! 🚀\n");
  } finally {
    // Cleanup test data
    try {
      if (createdLinkIds.length > 0) {
        await prisma.clickEvent.deleteMany({
          where: { linkId: { in: createdLinkIds } },
        });
        await prisma.link.deleteMany({
          where: { id: { in: createdLinkIds } },
        });
      }
      await prisma.user.deleteMany({
        where: { id: userId },
      });
      await prisma.$disconnect();
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr);
    }
  }
}

runPublicRedirectTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Public Redirect Test Suite Failed:", err);
    process.exit(1);
  });
