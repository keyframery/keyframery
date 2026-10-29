"use client"

import * as React from "react"

import { InstallCommand } from "@/components/site/install-command"
import { cn } from "@/lib/utils"

import { Choice } from "./stage"

/** The preview and its code, one at a time, like the component pages people expect. */
export function PreviewTabs({ preview, code }: { preview: React.ReactNode; code: React.ReactNode }) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
      <Choice
        label="Show"
        value={tab}
        onChange={setTab}
        options={[
          { value: "preview", label: "Preview" },
          { value: "code", label: "Code" },
        ]}
      />
      {/* Both stay mounted, so a demo keeps its state while you read its code. */}
      <div hidden={tab !== "preview"}>{preview}</div>
      <div hidden={tab !== "code"}>{code}</div>
    </div>
  )
}

/** Install with the shadcn CLI, or by hand: the packages, then the source. */
export function InstallTabs({ slug, packages, source }: { slug: string; packages: string[]; source: React.ReactNode }) {
  const [tab, setTab] = React.useState<"cli" | "manual">("cli")
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <Choice
        label="Install with"
        value={tab}
        onChange={setTab}
        options={[
          { value: "cli", label: "CLI" },
          { value: "manual", label: "Manual" },
        ]}
      />
      {tab === "cli" ? (
        <InstallCommand command={`npx shadcn add @keyframery/${slug}`} className="sm:w-full" />
      ) : (
        <ol className="grid gap-5">
          <li className="grid gap-2">
            <p>Install the packages it uses.</p>
            <InstallCommand command={`npm install ${packages.join(" ")}`} className="sm:w-full" />
          </li>
          <li className="grid gap-2">
            <p>
              Copy the source into <code className="font-mono text-[0.9em]">components/keyframery/{slug}.tsx</code>.
            </p>
            {source}
          </li>
        </ol>
      )}
    </div>
  )
}

/** A highlighted code block with a copy button in its corner. */
export function CodeBlock({ code, children, tall }: { code: string; children: React.ReactNode; tall?: boolean }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card">
      <div className={cn(tall && "max-h-[420px] overflow-auto")}>{children}</div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          } catch {
            setCopied(false)
          }
        }}
        className="absolute top-2 right-2 rounded-md border bg-background/90 px-2 py-1 text-xs font-medium text-muted-foreground outline-none backdrop-blur hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Copied the code" : ""}
      </span>
    </div>
  )
}
