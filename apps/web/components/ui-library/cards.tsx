"use client"

import * as React from "react"

import { CombinationOtp } from "@/components/keyframery/combination-otp"
import { PeekPagination } from "@/components/keyframery/peek-pagination"
import { WavePhotoUpload, type WavePhotoUploadHandle } from "@/components/keyframery/wave-photo-upload"
import type { UiComponent } from "@/lib/ui-library"

import { pretendUpload, sampleFile } from "./demos"
import { RelayBentoDemo } from "./relay-bento-demo"

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
  if (component.slug === "wave-photo-upload") return <PhotoCard key={run} onReset={reset} />
  if (component.slug === "relay-bento")
    return (
      <Frame note="It plays by itself">
        <Scaled width={1000} height={800} scale={0.28}>
          <RelayBentoDemo className="w-[1000px]" />
        </Scaled>
      </Frame>
    )
  return null
}

function PhotoCard({ onReset }: { onReset: () => void }) {
  const photo = React.useRef<WavePhotoUploadHandle>(null)
  return (
    <Frame
      onReset={onReset}
      note={
        <button type="button" onClick={async () => photo.current?.pick(await sampleFile())} className="rounded-sm underline-offset-2 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
          Drop a photo, or try a sample
        </button>
      }
    >
      <WavePhotoUpload ref={photo} aspect={2.2} upload={pretendUpload(3)} className="max-w-[300px]" />
    </Frame>
  )
}

/** A big component, shrunk to fit a card while still running live. */
function Scaled({ width, height, scale, children }: { width: number; height: number; scale: number; children: React.ReactNode }) {
  return (
    <div aria-hidden="true" inert className="pointer-events-none shrink-0" style={{ width: width * scale, height: height * scale }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  )
}

function Frame({ children, note, onReset }: { children: React.ReactNode; note?: React.ReactNode; onReset?: () => void }) {
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
