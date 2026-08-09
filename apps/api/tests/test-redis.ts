import { redis } from "../src/lib/redis";

const testRedis = async () => {
  try {
    // Write
    await redis.set("message", "Hello from Redis");

    // Read
    const value = await redis.get("message");

    console.log(value);

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

testRedis();
