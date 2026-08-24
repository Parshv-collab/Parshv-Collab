import { defaultPortfolioContent, type PortfolioContent } from "../shared/portfolio";
import { getMongoDb } from "./mongo";

const CONTENT_KEY = "portfolio";

export function normalizeStoredMediaUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  const malformedGridFsPath = trimmed.match(/^https?:\/\/\/+((?:api\/media)\/[0-9a-f]{24})\/?$/i);
  return malformedGridFsPath ? `/${malformedGridFsPath[1]}` : trimmed;
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const db = await getMongoDb();
  const doc = await db.collection<{ key: string; value: PortfolioContent }>("site_content").findOne({ key: CONTENT_KEY });
  if (!doc?.value) return defaultPortfolioContent;
  const saved = doc.value;
  const legacyBio = "This portfolio is ready for your story. Use the owner dashboard to shape the narrative, introduce your experience, and turn each selected project into a considered case study.";
  const projects = (saved.projects ?? defaultPortfolioContent.projects).map(project => {
    const fallback = defaultPortfolioContent.projects[0];
    const normalized = {
      id: project.id || fallback.id,
      visible: project.visible !== false,
      title: project.title || fallback.title,
      category: project.category || fallback.category,
      summary: project.summary || fallback.summary,
      tech: project.tech?.length ? project.tech : fallback.tech,
      liveUrl: project.liveUrl || "",
      codeUrl: project.codeUrl || "",
      images: (project.images ?? []).map(normalizeStoredMediaUrl).filter(Boolean),
    };
    return {
      ...normalized,
      title: normalized.title === "Your first case study" ? "Featured project" : normalized.title,
      summary: normalized.summary === "A deliberately empty canvas for a project that deserves a considered story." ? "A deliberately open canvas for a project worth showing clearly." : normalized.summary,
    };
  });
  return {
    ...defaultPortfolioContent,
    ...saved,
    site: {
      ...defaultPortfolioContent.site,
      ...saved.site,
      resumeUrl: normalizeStoredMediaUrl(saved.site.resumeUrl),
      heroImage: normalizeStoredMediaUrl(saved.site.heroImage),
      profileImage: normalizeStoredMediaUrl(saved.site.profileImage),
      githubUrl: saved.site.githubUrl || defaultPortfolioContent.site.githubUrl,
      githubUsername: saved.site.githubUsername || defaultPortfolioContent.site.githubUsername,
      bio: saved.site.bio === legacyBio ? defaultPortfolioContent.site.bio : saved.site.bio,
    },
    skills: saved.skills ?? defaultPortfolioContent.skills,
    projects,
    services: saved.services ?? defaultPortfolioContent.services,
    testimonials: (saved.testimonials ?? []).map(item => ({ ...item, avatarUrl: item.avatarUrl ?? "" })),
    posts: saved.posts ?? [],
  };
}

export async function savePortfolioContent(content: PortfolioContent) {
  const db = await getMongoDb();
  await db.collection("site_content").updateOne({ key: CONTENT_KEY }, { $set: { value: content, updatedAt: new Date() } }, { upsert: true });
}

export async function saveInquiry(input: { name: string; email: string; message: string }) {
  const db = await getMongoDb();
  await db.collection("inquiries").insertOne({ ...input, read: false, createdAt: new Date() });
}

export async function getInquiries() {
  const db = await getMongoDb();
  const documents = await db.collection("inquiries").find().sort({ createdAt: -1 }).toArray();
  return documents.map(document => ({ id: document._id.toHexString(), name: String(document.name), email: String(document.email), message: String(document.message), read: Boolean(document.read), createdAt: document.createdAt as Date }));
}

export async function markInquiryRead(id: string, read: boolean) {
  const db = await getMongoDb();
  const { ObjectId } = await import("mongodb");
  if (!ObjectId.isValid(id)) throw new Error("Inquiry could not be found.");
  await db.collection("inquiries").updateOne({ _id: new ObjectId(id) }, { $set: { read } });
}
