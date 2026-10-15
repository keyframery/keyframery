import { createMcpHandler } from "mcp-handler"
import { after } from "next/server"

import { INSTRUCTIONS, registerKeyframeryTools, SERVER_INFO } from "@/lib/mcp"
import { classifyClient, mcpHits, recordUsage } from "@/lib/usage"

/** The Keyframery MCP server: https://keyframery.com/mcp (stateless Streamable HTTP). */
const handler = createMcpHandler(registerKeyframeryTools, {
  serverInfo: SERVER_INFO,
  instructions: INSTRUCTIONS,
  // The tools never change, so a subscriptions/listen stream would only hold a function open on Vercel.
  maxSubscriptions: 0,
})

/** Counts which tools are called and which clients connect (lib/usage.ts), once the answer has gone out. */
async function counted(request: Request) {
  const copy = request.clone()
  const client = classifyClient(request.headers.get("user-agent"))
  after(async () => {
    const body = await copy.json().catch(() => null)
    await recordUsage(...mcpHits(body, client))
  })
  return handler(request)
}

// Every tool answers from memory in milliseconds; nothing here should run long.
export const maxDuration = 30

export { handler as DELETE, handler as GET, counted as POST }
