import { MongoClient } from "mongodb";
import { env } from "./env.js";

const uri = env("MONGODB_URI");
let client;
let clientPromise;

if (!uri) {
  console.warn("MONGODB_URI is not defined. MongoDB persistence will be disabled.");
} else {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
}

export async function getDb() {
  if (!clientPromise) return null;
  const connection = await clientPromise;
  return connection.db("alpha-leak");
}

export async function recordDiscoveryMongo(item) {
  const db = await getDb();
  if (!db) return null;

  const collection = db.collection("discoveries");
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const existing = await collection.findOne({ id: item.id });
  if (!existing) {
    const entry = {
      id: item.id,
      symbol: item.symbol,
      first_seen: now.toISOString(),
      discovery_time: timeStr,
      initial_score: item.score,
      max_score: item.score,
      last_score: item.score,
      pumps: 0,
      updated_at: now.toISOString()
    };
    await collection.insertOne(entry);
    return entry;
  } else {
    const update = {
      $set: {
        last_score: item.score,
        updated_at: now.toISOString()
      }
    };
    if (item.score > existing.max_score) {
      update.$inc = { pumps: 1 };
      update.$set.max_score = item.score;
    }
    await collection.updateOne({ id: item.id }, update);
    return { ...existing, ...update.$set };
  }
}

export async function listDiscoveriesMongo(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.collection("discoveries").find().sort({ updated_at: -1 }).limit(limit).toArray();
}
