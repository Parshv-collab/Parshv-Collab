import type { Express } from "express";
import { getPortfolioContent } from "./portfolio";
import { defaultPortfolioContent, type PortfolioContent } from "../shared/portfolio";

let cachedContent: PortfolioContent = defaultPortfolioContent;
let refreshInFlight = false;
const SOCIAL_IMAGE_PATH = "/api/media/6a8d1bd3391f6915811f4985";

function refreshContentCache() {
  if (refreshInFlight) return;
  refreshInFlight = true;
  void getPortfolioContent()
    .then(content => { cachedContent = content; })
    .catch(() => undefined)
    .finally(() => { refreshInFlight = false; });
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character); }

export function getPageMeta(pathname: string) {
  refreshContentCache();
  const content = cachedContent;
  const base = { title: `${content.site.name} — ${content.site.role}`, description: content.site.pitch };
  return base;
}

export function injectPageMeta(html: string, pathname: string, origin = process.env.SITE_URL || "http://localhost:3000") {
  const meta = getPageMeta(pathname);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonicalUrl = new URL(pathname.split("?")[0] || "/", origin).toString();
  const socialImageUrl = new URL(SOCIAL_IMAGE_PATH, origin).toString();
  const content = cachedContent;
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.site.name,
    jobTitle: content.site.role,
    description: content.site.pitch,
    url: canonicalUrl,
    image: content.site.heroImage || socialImageUrl,
    sameAs: [content.site.githubUrl, content.site.linkedinUrl].filter(Boolean),
  }).replace(/</g, "\\u003c");
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${canonicalUrl}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${canonicalUrl}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(" \/>)/, `$1${socialImageUrl}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(" \/>)/, `$1${socialImageUrl}$2`)
    .replace(/(<script id="portfolio-jsonld" type="application\/ld\+json">)[\s\S]*?(<\/script>)/, `$1${structuredData}$2`);
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (_req, res) => res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n"));
  app.get("/sitemap.xml", (req, res) => {
    refreshContentCache();
    const origin = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
    const paths = ["/"];
    const urls = paths.map(path => `<url><loc>${origin}${path}</loc></url>`).join("");
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  });
}
