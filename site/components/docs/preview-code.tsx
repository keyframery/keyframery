"use client"

import { Check, Copy } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"

const HighlightedCode = React.lazy(() => import("fumadocs-ui/components/dynamic-codeblock").then(({ DynamicCodeBlock }) => ({ default: DynamicCodeBlock })))

/** The displayed and copied example are the same live string. Highlighting loads only for Code. */
export function PreviewCode({ code, changed }: { code: string; changed: boolean }) {
  const [copied, setCopied] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  React.useEffect(() => { setCopied(false); setFailed(false) }, [code])
  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])
  const plain = <pre className="m-0 overflow-auto p-5 text-[12px] leading-6"><code>{code}</code></pre>
  return (
    <section aria-label="Configured example code" data-preview-code className="min-w-0 bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <span className="text-[12px] text-muted-foreground">example.tsx <span className="ml-2 text-[11px]">{changed ? "Your configuration" : "Default example"}</span></span>
        <Button variant="ghost" size="sm" onClick={async () => {
          try { await navigator.clipboard.writeText(code); setCopied(true); setFailed(false) }
          catch { setFailed(true) }
        }} aria-label="Copy configured code" className="h-7 gap-1.5 px-2 text-[12px]">
          {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
          {copied ? "Copied" : failed ? "Select code to copy" : "Copy code"}
        </Button>
      </div>
      <div className="max-h-[480px] min-h-[320px] overflow-auto text-[12px] [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0 [&_pre]:text-[12px]">
        <React.Suspense fallback={plain}>
          <HighlightedCode code={code} lang="tsx" codeblock={{ allowCopy: false }} options={{ themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" } }} />
        </React.Suspense>
      </div>
      <span className="sr-only" role="status">{copied ? "Configured code copied" : failed ? "Clipboard unavailable. Select the code to copy it." : ""}</span>
    </section>
  )
}
