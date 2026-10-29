/* Keyframery UI: our own components. One entry per component; the /ui pages, the sidebar, the sitemap and each
   page's metadata read from here. Only components marked "new" get a page; "soon" ones are listed as coming next. */

export type UiSlug = "combination-otp" | "peek-pagination" | "instant-photo-upload" | "photocopy-button" | "blinds-password"

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
    tagline: "Point at any page and a small card shows what's on it, before you click.",
    summary:
      "Pagination that shows you where you'll land. Point at a page number, an arrow or the dots and a small card rises above it with that page: its number, its rows, and anything else you choose to show. Drag across the dots to browse the pages hidden inside them, or type a page into Go to and see it before you press Enter. The row keeps the same nine slots whether there are 3 pages or 3,000, with first, previous, next and last, the range on screen and a rows-per-page switch.",
    seoTitle: "Peek pagination for shadcn/ui",
    description: "Pagination for shadcn/ui that previews a page before you click it. Point at a number, an arrow or a gap to see its rows, or drag across a gap to browse.",
    packages: ["motion"],
    usage: `"use client"

import * as React from "react"
import { PaginationContent, PeekPagination } from "@/components/keyframery/peek-pagination"

export function Invoices({ invoices }: { invoices: Invoice[] }) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const rows = invoices.slice((page - 1) * pageSize, page * pageSize)
  return (
    <>
      <PaginationContent page={page}>
        <InvoiceTable rows={rows} />
      </PaginationContent>
      <PeekPagination
        page={page}
        onPageChange={setPage}
        total={invoices.length}
        pageSize={pageSize}
        pageSizes={[10, 25, 50]}
        onPageSizeChange={setPageSize}
        preview={(p) => (
          <ul className="space-y-1 text-xs">
            {invoices.slice((p - 1) * pageSize, (p - 1) * pageSize + 3).map((invoice) => (
              <li key={invoice.id} className="flex justify-between gap-3">
                <span className="truncate">{invoice.client}</span>
                <span className="text-muted-foreground">{invoice.amount}</span>
              </li>
            ))}
          </ul>
        )}
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
      { name: "preview", type: "(page: number) => ReactNode", description: "What the card shows for a page you point at. Its first few rows work well. Leave it out and the card shows the page and its range." },
      { name: "pageSizes", type: "number[]", description: "Page sizes to offer in the rows-per-page switch." },
      { name: "onPageSizeChange", type: "(size: number) => void", description: "Runs with the new page size." },
      { name: "aria-label", type: "string", fallback: '"Pagination"', description: "What screen readers call it." },
    ],
    notes: [
      "Every page, arrow and gap is a real button with a clear label. The card is extra, so keyboards and screen readers get the full pagination without it. Tab to a page and the card shows that one too.",
      "A touch screen has nothing to point with, so a tap simply goes to the page. Go to works everywhere.",
      "The row always has nine slots, or seven when it's narrow, so it never changes width as you move. With reduced motion on, the card appears in place instead of gliding.",
    ],
  },
  {
    slug: "instant-photo-upload",
    name: "Instant Photo Upload",
    group: "Media",
    status: "soon",
    tagline: "Drop a photo and it comes out like an instant print, developing while it uploads.",
    summary: "",
    seoTitle: "Instant photo upload for shadcn/ui",
    description: "An image upload for shadcn/ui where the photo develops like an instant print while it uploads.",
    packages: ["motion"],
    usage: "",
    props: [],
    notes: [],
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
