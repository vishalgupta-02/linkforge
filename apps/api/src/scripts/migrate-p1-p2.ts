import "dotenv/config";
import { pool } from "../db/client.ts";

async function main() {
  console.log("Applying schema additions...");

  await pool.query(`
    -- ClickEvent additions
    ALTER TABLE "ClickEvent" ADD COLUMN IF NOT EXISTS "city" TEXT;
    ALTER TABLE "ClickEvent" ADD COLUMN IF NOT EXISTS "region" TEXT;

    -- CustomDomain additions
    ALTER TABLE "CustomDomain" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "CustomDomain" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    CREATE UNIQUE INDEX IF NOT EXISTS "CustomDomain_domainName_key" ON "CustomDomain"("domainName");
    CREATE INDEX IF NOT EXISTS "CustomDomain_userId_idx" ON "CustomDomain"("userId");

    -- ApiKey table
    CREATE TABLE IF NOT EXISTS "api_key" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "keyPrefix" TEXT NOT NULL,
      "keyHash" TEXT NOT NULL UNIQUE,
      "fullKey" TEXT,
      "lastUsedAt" TIMESTAMP(3),
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "api_key_userId_idx" ON "api_key"("userId");

    -- WebhookSubscription table
    CREATE TABLE IF NOT EXISTS "webhook_subscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "url" TEXT NOT NULL,
      "events" TEXT[] NOT NULL,
      "secret" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "lastDeliveryStatus" INTEGER,
      "lastDeliveryAt" TIMESTAMP(3),
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS "webhook_subscription_userId_idx" ON "webhook_subscription"("userId");
  `);

  console.log("Schema additions successfully applied!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
