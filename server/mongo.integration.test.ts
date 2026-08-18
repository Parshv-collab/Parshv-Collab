import { describe, expect, it } from "vitest";
import { MongoClient } from "mongodb";

describe("MongoDB Atlas credential", () => {
  it.skipIf(process.env.RUN_MONGODB_INTEGRATION !== "true")("connects to the configured persistent portfolio database", async () => {
    const uri = process.env.MONGODB_URI;
    expect(uri).toBeTruthy();
    const client = new MongoClient(uri!);
    await client.connect();
    const result = await client.db().command({ ping: 1 });
    await client.close();
    expect(result.ok).toBe(1);
  }, 20000);
});
