import mongoose from "mongoose";
import { logger } from "./logger.ts";

let isConnecting = false;
let isConnected = false;

export async function connectMongoose(): Promise<typeof mongoose | null> {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.mongodb_uri ||
    process.env.MONGO_URI ||
    process.env.mongo_uri;

  if (!mongoUri) {
    logger.warn("No MONGODB_URI found in environment variables. MongoDB logging is disabled.", {
      event: "mongo.missing_uri",
    });
    return null;
  }

  if (isConnected) {
    return mongoose;
  }

  if (isConnecting) {
    return mongoose;
  }

  try {
    isConnecting = true;

    // Disconnect old connection if in disconnected/error state
    if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 1) {
      await mongoose.disconnect().catch(() => {});
    }

    mongoose.connection.on("connected", () => {
      isConnected = true;
      isConnecting = false;
      logger.info("Mongoose connected to MongoDB for structured logging", {
        event: "mongo.connected",
      });
    });

    mongoose.connection.on("error", (err) => {
      isConnected = false;
      isConnecting = false;
      logger.warn("Mongoose connection error for logs database", {
        event: "mongo.connection_error",
        error: err?.message || String(err),
      });
    });

    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      isConnecting = false;
      logger.warn("Mongoose disconnected from MongoDB", {
        event: "mongo.disconnected",
      });
    });

    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        autoIndex: true,
        maxPoolSize: 10,
      });
    } catch (firstErr: any) {
      if (
        String(firstErr?.message || "").includes("querySrv") ||
        String(firstErr?.message || "").includes("ECONNREFUSED")
      ) {
        const dns = await import("node:dns");
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
          socketTimeoutMS: 45000,
          autoIndex: true,
          maxPoolSize: 10,
        });
      } else {
        throw firstErr;
      }
    }

    isConnected = true;
    isConnecting = false;
    return mongoose;
  } catch (error: any) {
    isConnected = false;
    isConnecting = false;
    logger.warn("Failed to establish initial Mongoose connection to MongoDB. Will retry in background.", {
      event: "mongo.initial_connect_failed",
      error: error?.message || String(error),
    });
    return null;
  }
}

export function isMongooseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectMongoose(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      isConnected = false;
      isConnecting = false;
    }
  } catch (err) {
    logger.debug("Error while disconnecting Mongoose:", { err });
  }
}
