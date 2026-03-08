import mongoose, { Connection } from "mongoose";

/**
 * Cached connection interface.
 * - `conn`: the active Mongoose connection, or null if not yet established.
 * - `promise`: the in-flight connection promise, or null if no attempt is pending.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

/**
 * Extend the Node.js global type to hold the Mongoose cache.
 * This prevents TypeScript errors when attaching to `globalThis`.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Use a global cache so the connection persists across hot reloads
 * in development. In production, the module scope is sufficient,
 * but `globalThis` is harmless there as well.
 */
const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};
globalThis.mongooseCache = cached;

/**
 * Returns a Mongoose connection, reusing the cached one when available.
 * Safe to call from any server-side context (API routes, server components, etc.).
 */
async function connectToDatabase(): Promise<Connection> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
  }

  // Return the existing connection if it's ready
  if (cached.conn) {
    return cached.conn;
  }

  // Start a new connection attempt only if one isn't already in progress
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false, // Fail fast instead of queuing when disconnected
      })
      .then((m) => m.connection)
      .catch((error) => {
        cached.promise = undefined;
        cached.conn = undefined;
        throw error;
      });
  }

  // Await the connection and cache it
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
