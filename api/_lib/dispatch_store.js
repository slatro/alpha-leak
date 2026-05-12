import fs from "fs/promises";
import path from "path";

const storePath = path.join("/tmp", "alpha-leak-telegram-dispatch.json");

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(storePath, "utf8"));
  } catch {
    return { sent: {} };
  }
}

async function writeStore(data) {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), "utf8");
}

export async function hasSent(key) {
  const db = await readStore();
  return Boolean(db.sent[key]);
}

export async function markSent(key, payload = {}) {
  const db = await readStore();
  db.sent[key] = { at: Date.now(), ...payload };
  await writeStore(db);
}

