import * as React from "react"

import {
  createTokenInputController,
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
} from "@/components/ui/token-input"

export const meta = { name: "Token Input", group: "Forms" }

/* The demo plays itself: two suggested people are added and pop in as tokens, then removed. */
const lastRemove = '[data-slot="token-input-host"]:last-of-type [data-slot="token-input-token-remove"]'
export const play = [
  { click: '[data-suggest="leo@grantstudio.co"]', wait: 1000 },
  { click: '[data-suggest="fatima.noor@outlook.com"]', wait: 1300 },
  { click: lastRemove, wait: 700 },
  { click: lastRemove, wait: 1100 },
]

const suggested = ["leo@grantstudio.co", "fatima.noor@outlook.com"]

type Value = React.ComponentProps<typeof TokenInput>["defaultValue"] & {}
type Segment = Value[number]

const typos = ["gmial.com", "gmal.com", "hotmial.com", "yaho.com"]

function emailToken(email: string): Segment {
  const domain = email.split("@")[1] ?? ""
  return {
    type: "email",
    value: email.toLowerCase(),
    label: email.toLowerCase(),
    status: typos.includes(domain.toLowerCase()) ? "unresolved" : undefined,
  }
}

/* An address followed by a space, comma or semicolon becomes a token. */
function tokenize(value: Value): Value {
  const out: Value = []
  for (const segment of value) {
    if (typeof segment !== "string") {
      out.push(segment)
      continue
    }
    const parts = segment.split(/([^\s,;]+@[^\s,;]+\.[a-z]{2,})[\s,;]+/i)
    parts.forEach((part, index) => {
      if (index % 2 === 1) out.push(emailToken(part))
      else if (part) out.push(part)
    })
  }
  return out
}

const initial: Value = [
  emailToken("dana@whitfield.uk"),
  emailToken("marcus@gmial.com"),
  emailToken("joanna.park@hey.com"),
]

function initials(email: string) {
  return email.slice(0, 1).toUpperCase()
}

export const controls = {
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  tokenDeletion: { type: "select", label: "Token deletion", options: ["whole", "select", "revert"], default: "whole" },
  copy: { type: "select", label: "Copy", options: ["codec", "label"], default: "codec" },
  submitShortcut: { type: "select", label: "Submit shortcut", options: ["default", "enter", "mod+enter"], default: "default" },
  status: { type: "select", label: "Status", options: ["auto", "ready", "pending", "unresolved"], default: "auto" },
  items: { type: "slider", label: "Initial invitees", min: 0, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Invite to “Ski week”" },
  placeholder: { type: "text", label: "Placeholder", default: "Add emails, separated by commas" },
  width: { type: "slider", label: "Width", min: 300, max: 560, step: 1, default: 420, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Suggestion gap", min: 0, max: 16, step: 1, default: 6, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 24, step: 1, default: 10, unit: "px", group: "Layout" },
  tokenRadius: { type: "slider", label: "Token radius", min: 0, max: 16, step: 1, default: 7, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Line height", min: 32, max: 48, step: 1, default: 36, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  token: { type: "color", label: "Token", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
  error: { type: "color", label: "Error", default: "", group: "Colours" },
} as const

export default function TokenInputDemo({
  disabled = false,
  readOnly = false,
  required = false,
  tokenDeletion = "whole",
  copy = "codec",
  submitShortcut = "default",
  status = "auto",
  items = 3,
  title = "Invite to “Ski week”",
  placeholder = "Add emails, separated by commas",
  width = 420,
  gap = 6,
  radius = 10,
  tokenRadius = 7,
  height = 36,
  face = "",
  ink = "",
  token = "",
  accent = "",
  error = "",
}: {
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  tokenDeletion?: "whole" | "select" | "revert"
  copy?: "codec" | "label"
  submitShortcut?: "default" | "enter" | "mod+enter"
  status?: "auto" | "ready" | "pending" | "unresolved"
  items?: number
  title?: string
  placeholder?: string
  width?: number
  gap?: number
  radius?: number
  tokenRadius?: number
  height?: number
  face?: string
  ink?: string
  token?: string
  accent?: string
  error?: string
} = {}) {
  const theme = {
    "--token-input-radius": `${radius}px`,
    "--token-input-token-radius": `${tokenRadius}px`,
    "--token-input-height": `${height}px`,
    ...(face ? { "--token-input-face": face } : {}),
    ...(ink ? { "--token-input-ink": ink } : {}),
    ...(token ? { "--token-input-token": token } : {}),
    ...(accent ? { "--token-input-accent": accent } : {}),
    ...(error ? { "--token-input-error": error } : {}),
  } as React.CSSProperties
  const [value, setValue] = React.useState<Value>(initial.slice(0, items))
  React.useEffect(() => setValue(initial.slice(0, items).map(segment => typeof segment === "string" || status === "auto" ? segment : { ...segment, status: status === "ready" ? undefined : status })), [items, status])
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [invites] = React.useState(createTokenInputController)
  const people = value.filter((segment) => typeof segment !== "string")
  const left = suggested.filter((email) => !people.some((token) => token.value === email))
  const typo = people.some((token) => token.status === "unresolved")

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span id="invite-label" className="text-[13px] leading-none font-medium">
          {title}
        </span>
        <span className="text-[12px] text-muted-foreground tabular-nums">{people.length} people</span>
      </div>
      <TokenInput
        value={value} disabled={disabled} readOnly={readOnly} required={required} tokenDeletion={tokenDeletion} copy={copy} submitShortcut={submitShortcut === "default" ? undefined : submitShortcut} onSubmit={submitShortcut === "default" ? undefined : () => editorRef.current?.blur()}
        controller={invites}
        onValueChange={(next) => setValue(tokenize(next))}
        renderToken={(token) => (
          <TokenInputToken>
            <span className="-ml-1 grid size-4 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground in-data-selected:bg-primary-foreground/20 in-data-selected:text-primary-foreground in-data-unresolved:bg-destructive/15 in-data-unresolved:text-destructive">
              {initials(token.label)}
            </span>
            {token.label}
            <TokenInputTokenRemove />
          </TokenInputToken>
        )}
      >
        <TokenInputEditor ref={editorRef} aria-labelledby="invite-label" placeholder={placeholder} />
      </TokenInput>
      <div style={{ gap }} className="mt-3 flex min-h-7 flex-wrap items-center">
        {left.length > 0 && <span className="mr-0.5 text-[12px] text-muted-foreground">Suggested</span>}
        {left.map((email) => (
            <button
              key={email}
              type="button"
              data-suggest={email} disabled={disabled || readOnly}
              onClick={() => invites.insert(emailToken(email), { at: "end" })}
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[12px] leading-none font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] outline-none transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className="size-3">
                <path d="M8 3.5v9M3.5 8h9" />
              </svg>
              {email}
            </button>
          ))}
      </div>
      <p className={"mt-2 text-[12px] " + (typo ? "text-destructive" : "text-muted-foreground")}>
        {typo ? "One address looks mistyped. Did you mean gmail.com?" : "Type an email and press space or comma."}
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          className="h-8 cursor-pointer rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale,translate] duration-[calc(100ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px active:scale-[0.985] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
        >
          Copy invite link
        </button>
        <button
          type="button"
          disabled={people.length === 0}
          className="h-8 cursor-pointer rounded-[9px] bg-primary px-3 text-[13px] leading-none font-medium text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] transition-[scale,translate,opacity] duration-[calc(100ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          Send {people.length} {people.length === 1 ? "invite" : "invites"}
        </button>
      </div>
    </div>
  )
}
