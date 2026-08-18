import type { Express } from "express";
import { GridFSBucket, ObjectId } from "mongodb";
import { getMongoDb } from "./mongo";

export async function putMedia(filename: string, data: Buffer, contentType: string) {
  const db = await getMongoDb();
  const bucket = new GridFSBucket(db, { bucketName: "portfolio_media" });
  const stream = bucket.openUploadStream(filename, { metadata: { contentType, uploadedAt: new Date() } });
  await new Promise<void>((resolve, reject) => {
    stream.on("error", reject);
    stream.on("finish", () => resolve());
    stream.end(data);
  });
  return { key: stream.id.toHexString(), url: `/api/media/${stream.id.toHexString()}` };
}

export function registerMediaRoutes(app: Express) {
  app.get("/api/media/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(404).end();
    const db = await getMongoDb();
    const bucket = new GridFSBucket(db, { bucketName: "portfolio_media" });
    const file = await db.collection("portfolio_media.files").findOne({ _id: new ObjectId(req.params.id) });
    if (!file) return res.status(404).end();
    res.setHeader("Content-Type", (file.metadata as { contentType?: string } | undefined)?.contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    bucket.openDownloadStream(new ObjectId(req.params.id)).on("error", () => res.status(404).end()).pipe(res);
  });
}
