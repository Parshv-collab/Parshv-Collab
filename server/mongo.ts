import { Db, MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required for persistent portfolio data.");
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 12000 }).connect().catch(error => {
      clientPromise = null;
      throw error;
    });
  }
  return (await clientPromise).db();
}
