"use client"

import * as React from "react"
import type { AgentStep } from "@ui-sdk/react/agent"

import { createAgentPreviewSession, emptyAgentPreview, type AgentPreviewSession } from "@/lib/agent-preview"

export function useAgentPreview(scope: React.RefObject<HTMLElement | null>) {
  const session = React.useRef<AgentPreviewSession | null>(null)
  const [state, setState] = React.useState(emptyAgentPreview)
  React.useEffect(() => {
    if (!scope.current) return
    const current = createAgentPreviewSession(scope.current)
    session.current = current
    const changed = () => setState(current.getSnapshot())
    const stop = current.subscribe(changed)
    changed()
    return () => { stop(); current.destroy(); session.current = null }
  }, [scope])

  const refresh = React.useCallback(() => { void session.current?.refresh() }, [])
  const query = React.useCallback((ref: string) => session.current?.query(ref) ?? Promise.resolve({ error: "This preview is not ready yet." }), [])
  const act = React.useCallback((step: AgentStep) => session.current?.act(step) ?? Promise.resolve({ ok: false, error: { message: "This preview is not ready yet." } }), [])
  return { ...state, refresh, query, act }
}
