import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { injectPageMeta } from "./seo";

describe("publication metadata", () => {
  it("publishes canonical, social-image, favicon, crawler, and structured-data tags", () => {
    const template = readFileSync(resolve(import.meta.dirname, "../client/index.html"), "utf8");
    const page = injectPageMeta(template, "/", "https://portfolio.example");
    expect(page).toContain('rel="icon" type="image/svg+xml"');
    expect(page).toContain('name="robots" content="index, follow, max-image-preview:large"');
    expect(page).toContain('href="https://portfolio.example/"');
    expect(page).toContain('property="og:image" content="https://portfolio.example/api/media/6a8d1bd3391f6915811f4985"');
    expect(page).toContain('name="twitter:image" content="https://portfolio.example/api/media/6a8d1bd3391f6915811f4985"');
    expect(page).toContain('id="portfolio-jsonld"');
    expect(page).toContain("schema.org");
  });
});
