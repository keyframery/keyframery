"use client"

import * as React from "react"

import { CombinationOtp } from "@/components/keyframery/combination-otp"
import { PeekPagination } from "@/components/keyframery/peek-pagination"
import type { UiComponent } from "@/lib/ui-library"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A card's live preview: the real component, small, on the dotted stage. */
export function CardPreview({ component }: { component: UiComponent }) {
  const [run, setRun] = React.useState(0)
  const reset = () => setRun((r) => r + 1)
  if (component.slug === "combination-otp")
    return (
      <Frame onReset={reset} note="Try 482019">
        <CombinationOtp
          key={run}
          verify={async (code) => {
            await wait(400)
            return code === "482019"
          }}
        />
      </Frame>
    )
  if (component.slug === "peek-pagination")
    return (
      <Frame onReset={reset} note="Point at a page">
        <PeekPagination key={run} total={3000} pageSize={10} defaultPage={8} className="max-w-[440px]" />
      </Frame>
    )
  return null
}

function Frame({ children, note, onReset }: { children: React.ReactNode; note?: string; onReset?: () => void }) {
  return (
    <div style={{ "--kf-accent": "var(--cut)" } as React.CSSProperties} className="stage-grid relative flex h-60 items-center justify-center px-5 [&>*]:min-w-0">
      {children}
      {note && <span className="absolute bottom-3 left-4 text-xs text-muted-foreground">{note}</span>}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="absolute top-3 right-3 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Reset
        </button>
      )}
    </div>
  )
}
