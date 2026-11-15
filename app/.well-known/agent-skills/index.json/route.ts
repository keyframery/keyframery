import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

export const dynamic = "force-static"

/* /.well-known/agent-skills/index.json (Agent Skills Discovery v0.2.0): the one skill this site offers. */
export function GET() {
  const skill = fs.readFileSync(path.join(process.cwd(), "plugins/keyframery/skills/keyframery/SKILL.md"))
  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: "keyframery",
          type: "skill-md",
          description: "Install and use Keyframery's animated UI SDK components: add them with the shadcn CLI, swap UI SDK imports for animated primitives, and set a motion style.",
          url: "/.well-known/agent-skills/keyframery/SKILL.md",
          digest: `sha256:${createHash("sha256").update(skill).digest("hex")}`,
        },
      ],
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  )
}
