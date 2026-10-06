import fs from "node:fs/promises"
import path from "node:path"

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Stores one signup per email: in Neon when DATABASE_URL is set, otherwise in .data/waitlist.jsonl. */
export async function saveSignup({ email, source }: { email: string; source: string }): Promise<"added" | "exists"> {
  const url = process.env.DATABASE_URL
  if (url) {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(url)
    await sql`create table if not exists waitlist (email text primary key, source text not null, created_at timestamptz not null default now())`
    const added = await sql`insert into waitlist (email, source) values (${email}, ${source}) on conflict (email) do nothing returning email`
    return added.length ? "added" : "exists"
  }
  const file = path.join(process.cwd(), ".data/waitlist.jsonl")
  await fs.mkdir(path.dirname(file), { recursive: true })
  const existing = await fs.readFile(file, "utf8").catch(() => "")
  if (existing.split("\n").some((line) => line && JSON.parse(line).email === email)) return "exists"
  await fs.appendFile(file, JSON.stringify({ email, source, created_at: new Date().toISOString() }) + "\n")
  return "added"
}
