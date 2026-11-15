import fs from "node:fs"
import path from "node:path"

export const dynamic = "force-static"

/* The same skill the Claude Code plugin installs, served for agents that discover skills by URL. */
export function GET() {
  const skill = fs.readFileSync(path.join(process.cwd(), "plugins/keyframery/skills/keyframery/SKILL.md"), "utf8")
  return new Response(skill, { headers: { "Content-Type": "text/markdown; charset=utf-8" } })
}
