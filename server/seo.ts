import type { Express } from "express";
import { getPortfolioContent } from "./portfolio";
import { defaultPortfolioContent, type PortfolioContent } from "../shared/portfolio";

let cachedContent: PortfolioContent = defaultPortfolioContent;
let refreshInFlight = false;

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
  const projectSlug = pathname.match(/^\/work\/([^/?#]+)/)?.[1];
  const postSlug = pathname.match(/^\/writing\/([^/?#]+)/)?.[1];
  const project = projectSlug ? content.projects.find(item => item.slug === projectSlug) : null;
  const post = postSlug ? content.posts.find(item => item.slug === postSlug) : null;
  if (project) return { title: `${project.title} — ${content.site.name}`, description: project.summary };
  if (post) return { title: `${post.title} — ${content.site.name}`, description: post.excerpt };
  if (pathname === "/writing") return { title: `Writing — ${content.site.name}`, description: `Writing and notes from ${content.site.name}.` };
  return base;
}

export function injectPageMeta(html: string, pathname: string) {
  const meta = getPageMeta(pathname);
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${description}$2`);
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (_req, res) => res.type("text/plain").send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n"));
  app.get("/sitemap.xml", (req, res) => {
    refreshContentCache();
    const content = cachedContent;
    const origin = process.env.SITE_URL || `${req.protocol}://${req.get("host")}`;
    const paths = ["/", "/writing", ...content.projects.map(project => `/work/${project.slug}`), ...content.posts.map(post => `/writing/${post.slug}`)];
    const urls = paths.map(path => `<url><loc>${origin}${path}</loc></url>`).join("");
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  });
}
