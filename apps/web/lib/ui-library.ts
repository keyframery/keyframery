/* Keyframery UI: our own components. One entry per component; the /ui pages, the sidebar, the sitemap and each
   page's metadata read from here. Only components marked "new" get a page; "soon" ones are listed as coming next. */

export type UiSlug = "combination-otp" | "peek-pagination" | "wave-photo-upload" | "photocopy-button" | "blinds-password"

export type UiProp = { name: string; type: string; fallback?: string; description: string }

export type UiComponent = {
  slug: UiSlug
  name: string
  /** Where it sits in the sidebar. */
  group: "Inputs" | "Navigation" | "Media" | "Actions"
  /** "new" is built and playable; "soon" is still being made. */
  status: "new" | "soon"
  /** One line for cards and the sidebar: what it does, in plain words. */
  tagline: string
  /** The opening paragraph on its own page. */
  summary: string
  seoTitle: string
  description: string
  /** npm packages the shadcn CLI installs with it. */
  packages: string[]
  usage: string
  props: UiProp[]
  notes: string[]
}

export const UI_COMPONENTS: UiComponent[] = [
  {
    slug: "combination-otp",
    name: "Combination OTP",
    group: "Inputs",
    status: "new",
    tagline: "Digits roll into place like a combination lock, and a soft light follows you from slot to slot.",
    summary:
      "A one-time code field that works like a combination lock. Each digit rolls up into its slot on a little drum, and a soft blue light sits on the slot you're typing into, sliding along as you go. When the code checks out, the digits roll away and the slots slide together into one small Verified chip. Get it wrong and the drums jam, the field shakes, and the digits roll back out for another try.",
    seoTitle: "Combination OTP input for shadcn/ui",
    description: "An OTP input for shadcn/ui where each digit rolls into place on a drum, like a combination lock, and the right code folds the slots into a Verified chip.",
    packages: ["motion", "input-otp"],
    usage: `"use client"

import { CombinationOtp } from "@/components/keyframery/combination-otp"

export function VerifyEmail() {
  return (
    <CombinationOtp
      verify={async (code) => {
        const res = await fetch("/api/verify", { method: "POST", body: JSON.stringify({ code }) })
        return res.ok
      }}
      onVerified={() => window.location.assign("/welcome")}
    />
  )
}`,
    props: [
      { name: "verify", type: "(code: string) => boolean | Promise<boolean>", description: "Runs once every digit is in. Return true when the code is right." },
      { name: "onVerified", type: "(code: string) => void", description: "Runs once the Verified chip is showing." },
      { name: "length", type: "number", fallback: "6", description: "How many digits the code has." },
      { name: "size", type: '"sm" | "md" | "lg"', fallback: '"md"', description: "How big the slots are." },
      { name: "messages", type: "{ checking?, verified?, rejected? }", description: "Your own wording. Verified sits inside a small chip, so keep that one short." },
      { name: "autoFocus", type: "boolean", fallback: "false", description: "Focus the field when it mounts." },
      { name: "disabled", type: "boolean", fallback: "false", description: "Stops input." },
      { name: "aria-label", type: "string", fallback: '"One-time code"', description: "What screen readers call the field." },
    ],
    notes: [
      "Paste works, and so does autofill from a text message. Underneath sits input-otp, the same library shadcn's own OTP field uses.",
      "Screen readers get an ordinary code field and hear the result when it comes back.",
      "With reduced motion turned on, digits simply appear. Nothing spins, and the light jumps instead of sliding.",
      "The light takes its colour from --kf-accent and the check from --kf-success. Leave them unset and you get blue and green.",
    ],
  },
  {
    slug: "peek-pagination",
    name: "Peek Pagination",
    group: "Navigation",
    status: "new",
    tagline: "Point at any page and a card shows what's on it, fetched as you look, so clicking it is instant.",
    summary:
      "Pagination that shows you where you'll land. Point at a page number, an arrow or the dots and a small card rises above it with that page: its number, its rows, and anything else you choose to show. Drag across the dots to browse the pages hidden inside them, or type a page into Go to and see it before you press Enter. The row keeps the same nine slots whether there are 3 pages or 3,000, with first, previous, next and last, the range on screen and a rows-per-page switch.",
    seoTitle: "Peek pagination for shadcn/ui",
    description: "Pagination for shadcn/ui that previews a page before you click it. Point at a number, an arrow or a gap to see its rows, or drag across a gap to browse.",
    packages: ["motion"],
    usage: `"use client"

import * as React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { PaginationContent, PeekPagination } from "@/components/keyframery/peek-pagination"

// One query per page. The table and the peek card both go through it, so they share a cache.
const invoicesPage = (page: number, size: number) => ({
  queryKey: ["invoices", page, size],
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    fetch(\`/api/invoices?page=\${page}&size=\${size}\`, { signal }).then((res) => res.json() as Promise<Invoice[]>),
})

export function Invoices({ total }: { total: number }) {
  const [page, setPage] = React.useState(1)
  const size = 10
  const queryClient = useQueryClient()
  const { data: rows = [] } = useQuery(invoicesPage(page, size))

  return (
    <>
      <PaginationContent page={page}>
        <InvoiceTable rows={rows} />
      </PaginationContent>
      <PeekPagination
        page={page}
        onPageChange={setPage}
        total={total}
        pageSize={size}
        // Pointing at a page fetches it into the same cache, so clicking it is instant.
        peek={(p) => queryClient.fetchQuery(invoicesPage(p, size))}
        preview={(p, invoices) => <InvoicePeek rows={invoices.slice(0, 3)} />}
      />
    </>
  )
}`,
    props: [
      { name: "page", type: "number", description: "The current page, if you're controlling it." },
      { name: "defaultPage", type: "number", fallback: "1", description: "Where to start, if you're not." },
      { name: "onPageChange", type: "(page: number) => void", description: "Runs with the new page." },
      { name: "total", type: "number", description: "How many items there are. Turns on “Showing 21–30 of 240”." },
      { name: "pageSize", type: "number", fallback: "10", description: "Items per page." },
      { name: "pages", type: "number", description: "The page count, if you'd rather not pass total. Shows “Page 8 of 300”." },
      { name: "peek", type: "(page, signal) => Promise<T>", description: "Fetches a page for the card. It runs once the pointer has rested on that page for 150 ms, is cancelled through signal if the pointer moves on, and its result is kept. Fetch through your data cache and the page is already loaded when it's clicked." },
      { name: "preview", type: "(page, data: T) => ReactNode", description: "Draws the card for a page. With peek, data is what peek fetched, and a skeleton shows while it loads. Without peek, render from data you already have. Leave both out and the card shows the page and its range." },
      { name: "pageSizes", type: "number[]", description: "Page sizes to offer in the rows-per-page switch." },
      { name: "onPageSizeChange", type: "(size: number) => void", description: "Runs with the new page size." },
      { name: "aria-label", type: "string", fallback: '"Pagination"', description: "What screen readers call it." },
    ],
    notes: [
      "Peeking is prefetching. The card only fetches once the pointer rests on a page, so sweeping across the row sends nothing, and scrubbing across a gap fetches just the page you stop on. Moving on cancels the request, and every page it fetched is kept, so pointing back costs nothing.",
      "Your data cache does the rest. The example uses TanStack Query's fetchQuery, so the page you peeked at is already in the cache the table reads, and it opens without a spinner. SWR's preload, or a plain fetch with your own map, work the same way.",
      "Every page, arrow and gap is a real button with a clear label. The card is extra, so keyboards and screen readers get the full pagination without it, and tabbing to a page fetches that one too. On a touch screen, a tap simply goes to the page.",
    ],
  },
  {
    slug: "wave-photo-upload",
    name: "Wave Photo Upload",
    group: "Media",
    status: "new",
    tagline: "Drop a photo and a beam of light prints it line by line, the picture developing right behind it.",
    summary:
      "A photo upload that turns progress into the picture itself. Drop, paste or pick a photo and it falls into a small point of light on the bottom edge of the frame. The point fires the photo's pixels up one flowing, wavy beam: line one from left to right, then line two, and on down, only as fast as the upload goes. The newest lines are a band of the photo's own pixels, twinkling softly, and right behind them the sharp photo develops, so the real picture arrives the whole way down. When the last line is in, the band rolls off and the photo glows gently in its own colours. A file it can't take is spat back out of the point, with a plain reason why.",
    seoTitle: "Wave photo upload for shadcn/ui",
    description: "An image upload for shadcn/ui: a beam of light prints your photo line by line as it uploads, the picture developing behind it. Drop, paste, retry.",
    packages: ["motion"],
    usage: `"use client"

import { WavePhotoUpload } from "@/components/keyframery/wave-photo-upload"

export function CoverPhoto() {
  return (
    <WavePhotoUpload
      upload={(file, report, signal) =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("POST", "/api/photos")
          xhr.upload.onprogress = (e) => e.lengthComputable && report(e.loaded / e.total)
          xhr.onload = () => (xhr.status < 300 ? resolve(xhr.response) : reject(new Error(xhr.statusText)))
          xhr.onerror = () => reject(new Error("The upload failed"))
          signal.addEventListener("abort", () => xhr.abort())
          const body = new FormData()
          body.append("photo", file)
          xhr.send(body)
        })
      }
      onChange={(file) => console.log(file)}
    />
  )
}`,
    props: [
      { name: "upload", type: "(file, report, signal) => Promise", description: "Sends the photo. Call report with 0 to 1 as it goes and throw if it fails. Leave it out and the photo prints at its own pace." },
      { name: "onChange", type: "(file: File | null) => void", description: "Runs with the photo once it's in, and with null when it's removed." },
      { name: "accept", type: "string[]", fallback: '["image/png", "image/jpeg", "image/webp"]', description: "The file types it takes. The error message lists them by name." },
      { name: "maxSize", type: "number", fallback: "10 MB", description: "The largest file it takes, in bytes." },
      { name: "aspect", type: "number", description: "Keeps the frame one shape (width ÷ height), like 1 for an avatar. By default it takes each photo's shape." },
      { name: "disabled", type: "boolean", fallback: "false", description: "Stops it taking photos." },
      { name: "ref", type: "{ pick(file), clear() }", description: "Start with a file you already have, as if it had been dropped, or remove the photo." },
    ],
    notes: [
      "Underneath it's a real file field: the frame is a button that opens the file picker, and screen readers hear the progress and the result.",
      "fetch can't report upload progress yet, so the example uses XMLHttpRequest. Anything that calls report with 0 to 1 will do.",
      "With reduced motion on, nothing moves: the photo simply fades in as it uploads.",
    ],
  },
  {
    slug: "photocopy-button",
    name: "Photocopy Button",
    group: "Actions",
    status: "soon",
    tagline: "Press copy and a light sweeps across the code, then a copy of it slides into the button.",
    summary: "",
    seoTitle: "Photocopy button for shadcn/ui",
    description: "A copy button for shadcn/ui code blocks: a light sweeps the code and a copy slides into the button.",
    packages: ["motion"],
    usage: "",
    props: [],
    notes: [],
  },
  {
    slug: "blinds-password",
    name: "Blinds Password",
    group: "Inputs",
    status: "soon",
    tagline: "Each character hides behind a little vertical blind. Show turns them open one by one.",
    summary: "",
    seoTitle: "Blinds password input for shadcn/ui",
    description: "A password input for shadcn/ui where each character hides behind a vertical blind that turns open.",
    packages: ["motion"],
    usage: "",
    props: [],
    notes: [],
  },
]

export const UI_GROUPS: UiComponent["group"][] = ["Inputs", "Navigation", "Media", "Actions"]

/** Built components in sidebar order: by group, then as listed. Pagers follow this too. */
export const UI_ORDER = UI_GROUPS.flatMap((group) => UI_COMPONENTS.filter((c) => c.group === group && c.status === "new"))

/** Still being made: shown under "Coming next", with no page of their own yet. */
export const UI_SOON = UI_COMPONENTS.filter((c) => c.status === "soon")

export const uiComponent = (slug: string) => UI_ORDER.find((c) => c.slug === slug)
