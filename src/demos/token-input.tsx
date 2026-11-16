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

export default function TokenInputDemo() {
  const [value, setValue] = React.useState<Value>(initial)
  const [invites] = React.useState(createTokenInputController)
  const people = value.filter((segment) => typeof segment !== "string")
  const left = suggested.filter((email) => !people.some((token) => token.value === email))
  const typo = people.some((token) => token.status === "unresolved")

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-2 flex items-baseline justify-between">
        <span id="invite-label" className="text-[13px] leading-none font-medium">
          Invite to “Ski week”
        </span>
        <span className="text-[12px] text-muted-foreground tabular-nums">{people.length} people</span>
      </div>
      <TokenInput
        value={value}
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
        <TokenInputEditor aria-labelledby="invite-label" placeholder="Add emails, separated by commas" />
      </TokenInput>
      <div className="mt-3 flex min-h-7 flex-wrap items-center gap-1.5">
        {left.length > 0 && <span className="mr-0.5 text-[12px] text-muted-foreground">Suggested</span>}
        {left.map((email) => (
            <button
              key={email}
              type="button"
              data-suggest={email}
              onClick={() => invites.insert(emailToken(email), { at: "end" })}
              className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[12px] leading-none font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] outline-none transition-[color,background-color,scale] duration-200 ease-pop hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none"
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
          className="h-8 cursor-pointer rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[scale,translate] duration-100 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px active:scale-[0.985] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
        >
          Copy invite link
        </button>
        <button
          type="button"
          disabled={people.length === 0}
          className="h-8 cursor-pointer rounded-[9px] bg-primary px-3 text-[13px] leading-none font-medium text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] transition-[scale,translate,opacity] duration-100 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-px active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
        >
          Send {people.length} {people.length === 1 ? "invite" : "invites"}
        </button>
      </div>
    </div>
  )
}
