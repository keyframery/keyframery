import { createMcpHandler } from "mcp-handler"

import { INSTRUCTIONS, registerKeyframeryTools, SERVER_INFO } from "@/lib/mcp"

/** The Keyframery MCP server: https://keyframery.com/mcp (stateless Streamable HTTP). */
const handler = createMcpHandler(registerKeyframeryTools, {
  serverInfo: SERVER_INFO,
  instructions: INSTRUCTIONS,
  // The tools never change, so a subscriptions/listen stream would only hold a function open on Vercel.
  maxSubscriptions: 0,
})

// Every tool answers from memory in milliseconds; nothing here should run long.
export const maxDuration = 30

export { handler as DELETE, handler as GET, handler as POST }
