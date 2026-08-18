import { getMongoDb } from "./mongo";

type GithubRepository = { name: string; description: string | null; language: string | null; stargazers_count: number; html_url: string; pushed_at: string };
type GithubEvent = { type: string; repo: { name: string }; created_at: string };

export type GithubActivity = {
  username: string;
  repos: Array<{ name: string; description: string; language: string; stars: number; url: string; pushedAt: string }>;
  latestEvent: { type: string; repository: string; createdAt: string } | null;
};

const CACHE_MS = 5 * 60 * 1000;

export async function getGithubActivity(username: string): Promise<GithubActivity | null> {
  const normalized = username.trim().replace(/^@/, "");
  if (!normalized) return null;
  const db = await getMongoDb();
  const cache = db.collection<{ username: string; fetchedAt: Date; value: GithubActivity }>("github_cache");
  const existing = await cache.findOne({ username: normalized });
  if (existing && Date.now() - new Date(existing.fetchedAt).getTime() < CACHE_MS) return existing.value;

  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "signal-atelier-portfolio" };
  const [reposResponse, eventsResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(normalized)}/repos?sort=pushed&direction=desc&per_page=3`, { headers }),
    fetch(`https://api.github.com/users/${encodeURIComponent(normalized)}/events/public?per_page=1`, { headers }),
  ]);
  if (!reposResponse.ok) throw new Error("GitHub activity is currently unavailable.");
  const repos = (await reposResponse.json()) as GithubRepository[];
  const events = eventsResponse.ok ? ((await eventsResponse.json()) as GithubEvent[]) : [];
  const value: GithubActivity = {
    username: normalized,
    repos: repos.map(repo => ({ name: repo.name, description: repo.description || "No description provided.", language: repo.language || "Code", stars: repo.stargazers_count, url: repo.html_url, pushedAt: repo.pushed_at })),
    latestEvent: events[0] ? { type: events[0].type.replace("Event", ""), repository: events[0].repo.name, createdAt: events[0].created_at } : null,
  };
  await cache.updateOne({ username: normalized }, { $set: { username: normalized, fetchedAt: new Date(), value } }, { upsert: true });
  return value;
}
