import { createMcpHandler } from "mcp-handler"

import { INSTRUCTIONS, registerKeyframeryTools } from "@/lib/mcp"

/** The Keyframery MCP server: https://keyframery.com/mcp (stateless Streamable HTTP). */
const handler = createMcpHandler(registerKeyframeryTools, {
  serverInfo: { name: "keyframery", version: "0.1.0" },
  instructions: INSTRUCTIONS,
})

export { handler as DELETE, handler as GET, handler as POST }
