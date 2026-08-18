// Preconfigured storage helpers for Manus WebDev templates
import { putMedia } from "./media";

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const fileData = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  return putMedia(relKey, fileData, contentType);
}
