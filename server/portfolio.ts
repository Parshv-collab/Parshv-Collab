import { defaultPortfolioContent, type PortfolioContent } from "../shared/portfolio";
import { getMongoDb } from "./mongo";

const CONTENT_KEY = "portfolio";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const db = await getMongoDb();
  const doc = await db.collection<{ key: string; value: PortfolioContent }>("site_content").findOne({ key: CONTENT_KEY });
  if (!doc?.value) return defaultPortfolioContent;
  const saved = doc.value;
  return {
    ...defaultPortfolioContent,
    ...saved,
    site: {
      ...defaultPortfolioContent.site,
      ...saved.site,
      githubUrl: saved.site.githubUrl || defaultPortfolioContent.site.githubUrl,
      githubUsername: saved.site.githubUsername || defaultPortfolioContent.site.githubUsername,
    },
    skills: saved.skills ?? defaultPortfolioContent.skills,
    projects: (saved.projects ?? defaultPortfolioContent.projects).map(project => ({ ...defaultPortfolioContent.projects[0], ...project, slug: project.slug || project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })),
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
