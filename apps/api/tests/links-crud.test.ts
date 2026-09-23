import assert from "node:assert";
import { prisma } from "../src/db/client.ts";
import {
  createLink,
  getLinks,
  updateLink,
  deleteLink,
  reorderLinks,
  toggleLink,
  getLinkStats,
  getPublicLinks,
} from "../src/services/link.service.ts";

async function runLinksCrudTestSuite() {
  console.log("Starting Links CRUD, Limits, Reordering & Soft-Delete Test Suite...\n");

  const timestamp = Date.now();
  const freeUserId = `test-free-user-${timestamp}`;
  const proUserId = `test-pro-user-${timestamp}`;
  const username = `test_user_${timestamp}`;

  try {
    // 1. Setup Test Users
    console.log("1. Setting up Free and Pro test users in database...");
    await prisma.user.create({
      data: {
        id: freeUserId,
        email: `free-${timestamp}@example.com`,
        name: "Free Test User",
        userName: username,
        userName_lower: username.toLowerCase(),
        plan: "FREE",
      },
    });

    await prisma.user.create({
      data: {
        id: proUserId,
        email: `pro-${timestamp}@example.com`,
        name: "Pro Test User",
        userName: `pro_${username}`,
        userName_lower: `pro_${username}`.toLowerCase(),
        plan: "PRO",
      },
    });
    console.log("Free and Pro test users created");

    // 2. Test Link Creation for Free User up to 8 links
    console.log("2. Testing link creation up to FREE limit (8 links)...");
    const createdLinkIds: string[] = [];
    for (let i = 1; i <= 8; i++) {
      const link = await createLink(freeUserId, {
        title: `Link #${i}`,
        url: `https://example.com/link-${i}`,
        position: i - 1,
        public: true,
      });
      assert.ok(link.id);
      assert.ok(link.publicId);
      assert.strictEqual(link.title, `Link #${i}`);
      createdLinkIds.push(link.id);
    }
    console.log("Successfully created 8 links for Free user");

    // 3. Test Free Link Limit Enforcement (9th link should fail with 403)
    console.log("3. Testing 9th link creation for Free user (expecting 403)...");
    let limitErrorCaught = false;
    try {
      await createLink(freeUserId, {
        title: "Link #9 (Excess)",
        url: "https://example.com/link-9",
        position: 8,
        public: true,
      });
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 403);
      assert.strictEqual(err.code, "LINK_LIMIT_REACHED");
      limitErrorCaught = true;
    }
    assert.strictEqual(limitErrorCaught, true, "Free link limit must be enforced server-side");
    console.log("Server rejected 9th link with 403 LINK_LIMIT_REACHED");

    // 4. Test Link Reordering
    console.log("4. Testing atomic link reordering...");
    const reversedIds = [...createdLinkIds].reverse();
    await reorderLinks(freeUserId, reversedIds);

    const reorderedLinks = await prisma.link.findMany({
      where: { userId: freeUserId, deletedAt: null },
      orderBy: { position: "asc" },
    });
    assert.strictEqual(reorderedLinks[0].id, reversedIds[0]);
    assert.strictEqual(reorderedLinks[7].id, reversedIds[7]);
    console.log("Link positions successfully updated atomically");

    // 5. Test Link Toggle
    console.log("5. Testing link visibility toggle...");
    const targetLinkId = createdLinkIds[0];
    const toggledOff = await toggleLink(freeUserId, targetLinkId);
    assert.strictEqual(toggledOff.isActive, false);

    const statsAfterToggle = await getLinkStats(freeUserId);
    assert.strictEqual(statsAfterToggle.active, 7);
    assert.strictEqual(statsAfterToggle.inactive, 1);

    const toggledOn = await toggleLink(freeUserId, targetLinkId);
    assert.strictEqual(toggledOn.isActive, true);
    console.log("Link visibility toggle functioning accurately");

    // 6. Test Public Link Retrieval (only active & non-deleted links returned)
    console.log("6. Testing public profile links query...");
    const publicLinks = await getPublicLinks(username);
    assert.strictEqual(publicLinks.length, 8);
    assert.ok((publicLinks[0] as any).publicId, "Public links must contain publicId");
    assert.strictEqual((publicLinks[0] as any).id, undefined, "Public links must NOT expose internal id");
    console.log("Public links retrieved correctly for username");

    // 7. Test Soft Deletion
    console.log("7. Testing soft deletion of a link...");
    const deleted = await deleteLink(freeUserId, targetLinkId);
    assert.ok(deleted.deletedAt !== null);
    assert.strictEqual(deleted.isActive, false);

    const activeList = await getLinks(freeUserId);
    assert.strictEqual(activeList.length, 7);
    assert.ok(!activeList.some((l) => l.id === targetLinkId));
    console.log("Soft deleted link excluded from active links list");

    console.log("\nALL LINK CRUD & LIMIT TESTS PASSED SUCCESSFULLY! \n");
  } finally {
    // Cleanup test data
    await prisma.clickEvent.deleteMany({
      where: { userId: { in: [freeUserId, proUserId] } },
    });
    await prisma.link.deleteMany({
      where: { userId: { in: [freeUserId, proUserId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [freeUserId, proUserId] } },
    });
    await prisma.$disconnect();
  }
}

runLinksCrudTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Links CRUD Test Suite Failed:", err);
    process.exit(1);
  });
