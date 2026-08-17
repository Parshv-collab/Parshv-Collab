import { MongoClient, type Db } from "mongodb";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

export type Project = { id: string; title: string; description: string; tech: string[]; demoUrl: string; repoUrl: string; imageUrl?: string };
export type Skill = { id: string; name: string; level: number; category: string };
export type BlogPost = { id: string; title: string; excerpt: string; date: string; body: string; coverUrl?: string };
export type OpenSourceEntry = { id: string; name: string; description: string; url: string; stars?: string; language?: string };
export type PortfolioContent = { hero: { eyebrow: string; headline: string; bio: string; githubUrl: string; location: string; profilePhoto?: string; techStack: string[] }; projects: Project[]; skills: Skill[]; posts: BlogPost[]; openSource: OpenSourceEntry[] };

const defaultContent: PortfolioContent = {
  hero: { eyebrow: "FULL-STACK DEVELOPER / OPEN-SOURCE BUILDER", headline: "I build sharp digital products that make complex things feel simple.", bio: "Parshv Chandaria is a full-stack developer focused on thoughtful interfaces, reliable systems, and software that earns its place in the stack.", githubUrl: "https://github.com/", location: "India · Available worldwide", techStack: ["TypeScript", "React", "Node.js", "MongoDB", "Python"] },
  projects: [
    { id: "signal", title: "Signalboard", description: "A calm command center for teams that need to see what matters, faster.", tech: ["React", "Node.js", "MongoDB"], demoUrl: "#", repoUrl: "#" },
    { id: "atlas", title: "Atlas Notes", description: "A local-first knowledge workspace with instant search and durable sync.", tech: ["TypeScript", "Next.js", "SQLite"], demoUrl: "#", repoUrl: "#" },
    { id: "relay", title: "Relay API", description: "A focused toolkit for shipping secure integrations without the ceremony.", tech: ["Node.js", "Express", "Redis"], demoUrl: "#", repoUrl: "#" },
  ],
  skills: [{ id: "typescript", name: "TypeScript", level: 92, category: "Languages" }, { id: "react", name: "React", level: 94, category: "Frontend" }, { id: "node", name: "Node.js", level: 90, category: "Backend" }, { id: "mongo", name: "MongoDB", level: 86, category: "Data" }, { id: "python", name: "Python", level: 78, category: "Languages" }, { id: "docker", name: "Docker", level: 76, category: "Platform" }],
  posts: [{ id: "designing-for-change", title: "Designing software for change", excerpt: "The systems that age well are built around clear seams, not clever tricks.", date: "2025-02-18", body: "Good software is less about predicting the future and more about leaving the right doors open. In this note, I explore boundaries, ownership, and the small design decisions that keep teams moving." }, { id: "the-quiet-power-of-defaults", title: "The quiet power of good defaults", excerpt: "Defaults are product decisions. Treat them like a first-class part of the interface.", date: "2024-11-04", body: "A user should not need to understand your internal model to make progress. The best defaults reduce cognitive load while staying visible and reversible." }],
  openSource: [{ id: "contrib-1", name: "Open-source maintainer", description: "Building small, dependable utilities for the JavaScript ecosystem.", url: "https://github.com/", stars: "12k+", language: "TypeScript" }, { id: "contrib-2", name: "Community contributor", description: "Documentation, bug fixes, and release tooling across developer projects.", url: "https://github.com/", stars: "48", language: "Open Source" }],
};

let _db: ReturnType<typeof drizzle> | null = null;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }
export async function upsertUser(user: InsertUser): Promise<void> { if (!user.openId) throw new Error("User openId is required for upsert"); const db = await getDb(); if (!db) return; const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {}; (['name', 'email', 'loginMethod'] as const).forEach(field => { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }); if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; } if (user.role !== undefined || user.openId === ENV.ownerOpenId) { values.role = user.role ?? 'admin'; updateSet.role = values.role; } if (!values.lastSignedIn) values.lastSignedIn = new Date(); if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date(); await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet }); }
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }

export async function getMongoDb() { if (mongoDb) return mongoDb; const uri = process.env.MONGODB_URI; if (!uri) throw new Error("MONGODB_URI is not configured"); mongoClient = new MongoClient(uri); await mongoClient.connect(); mongoDb = mongoClient.db(); return mongoDb; }
export async function getPortfolioContent(): Promise<PortfolioContent> { const db = await getMongoDb(); const collection = db.collection<any>("portfolio_content"); const existing = await collection.findOne({ _id: "main" }); if (existing) { const { _id, ...content } = existing as PortfolioContent & { _id: string }; return content; } await collection.replaceOne({ _id: "main" }, { _id: "main", ...defaultContent }, { upsert: true }); return defaultContent; }
export async function savePortfolioContent(content: PortfolioContent) { const db = await getMongoDb(); await db.collection<any>("portfolio_content").replaceOne({ _id: "main" }, { _id: "main", ...content }, { upsert: true }); return content; }
export async function saveContactMessage(message: { name: string; email: string; message: string }) { const db = await getMongoDb(); const result = await db.collection("contact_messages").insertOne({ ...message, createdAt: new Date(), status: "new" }); return { id: result.insertedId.toString(), success: true as const }; }
