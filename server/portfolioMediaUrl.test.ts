import { describe, expect, it } from "vitest";
import { normalizeStoredMediaUrl } from "./portfolio";

describe("stored portfolio media URLs", () => {
  it("recovers the legacy malformed GridFS URL shape without changing valid media paths", () => {
    expect(normalizeStoredMediaUrl("https:///api/media/6a89116f45be2a99ff20bfd0")).toBe("/api/media/6a89116f45be2a99ff20bfd0");
    expect(normalizeStoredMediaUrl("/api/media/6a89116f45be2a99ff20bfd0")).toBe("/api/media/6a89116f45be2a99ff20bfd0");
    expect(normalizeStoredMediaUrl("https://images.example.com/project.jpg")).toBe("https://images.example.com/project.jpg");
  });
});
