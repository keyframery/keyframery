/* Badges, as UI SDK primitives. UI SDK ships no badge, so these are defined with its core: the
   same definitions render in React, Vue, Svelte, Solid and web components.

   `badge` is a small label that can show a count (`count`, capped at `max`) and a status dot (`dot`).
   It counts how many times what it says has changed, so the dot can pulse once on each change.
   `roll` is a number drawn as one column of digits per place, for a count that rolls when it changes. */

import { css, definePrimitive } from "@ui-sdk/core"

/** What a count reads as: the number, or `max+` above `max`. */
function countText(count: number, max?: number) {
  return max !== undefined && count > max ? `${max}+` : String(count)
}

type BadgeOptions = {
  /** A number, drawn as rolling digits. */
  count?: number
  /** Above this, the count reads `max+`. */
  max?: number
  /** A leading status dot that pulses once each time what the badge says changes. */
  dot?: boolean
  /** What the badge says, for a badge without `count`: a change pulses the dot. React's `Badge` fills it from its text children. */
  text?: string
}

type BadgeState = {
  count: number | undefined
  max: number | undefined
  dot: boolean
  /** The count as it reads, like "12" or "99+". Empty without a count. */
  countText: string
  /** How many times what the badge says has changed since it mounted. */
  changes: number
}

const said = (options: BadgeOptions) =>
  options.count === undefined ? (options.text ?? "") : countText(options.count, options.max)

const fromOptions = (options: BadgeOptions) => ({
  count: options.count,
  max: options.max,
  dot: options.dot ?? false,
  countText: options.count === undefined ? "" : countText(options.count, options.max),
})

const badge = definePrimitive({
  name: "badge",
  options: { count: "number", max: "number", dot: "boolean", text: "string" },
  state: (options: BadgeOptions): BadgeState => ({ ...fromOptions(options), changes: 0 }),
  sync: (options) => fromOptions(options),
  controlled: [],
  api: (context) => {
    /* A change to what it says, from any option, counts once: the dot's pulse follows the count. */
    let last = said(context.options())
    context.onOptions((options) => {
      const now = said(options)
      if (now === last) return
      last = now
      context.store.set({ changes: context.store.get().changes + 1 })
    })
    return {}
  },
  slots: (slot) => ({
    root: slot<{}, { count: number | undefined; countText: string; dot: boolean; changes: number }>({
      state: (state) => ({ count: state.count, countText: state.countText, dot: state.dot, changes: state.changes }),
      attrs: (state) => ({
        "data-dot": state.dot ? "" : undefined,
        "data-count": state.count === undefined ? undefined : String(state.count),
        "data-overflow": state.count !== undefined && state.max !== undefined && state.count > state.max ? "" : undefined,
      }),
    }),
    /* The status dot. `data-pulse` flips between "odd" and "even" on each change, so a CSS
       animation keyed on it restarts every time; it is missing until the first change. */
    dot: slot<{}, { changes: number }>({
      present: (state) => state.dot,
      state: (state) => ({ changes: state.changes }),
      attrs: (state) => ({
        "aria-hidden": "true",
        "data-pulse": state.changes === 0 ? undefined : state.changes % 2 ? "odd" : "even",
      }),
    }),
  }),
  /* A badge is a label. It has nothing for an agent to read or do. */
  agent: { actions: [], shown: () => false },
})

type RollOptions = {
  /** The text to draw. Digits roll; anything else ("+", ",") sits still. */
  text?: string
}

/* The places of `text`, counted from the right, so a new leading digit joins on the left while the
   others keep their columns. */
const placesOf = (text: string) => text.split("").map((_, index, all) => String(all.length - index))

const roll = definePrimitive({
  name: "roll",
  options: { text: "string" },
  state: (options: RollOptions) => ({ text: options.text ?? "" }),
  sync: (options) => ({ text: options.text ?? "" }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { text: string; places: string[] }>({
      state: (state) => ({ text: state.text, places: placesOf(state.text) }),
      /* The digits are drawn; a reader gets the text from the component around it. */
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    /* One place, keyed by its position from the right ("1" is the units). A digit's column moves
       to `--d`; any other character has no `--d`. */
    digit: slot<{ value: string }, { char: string; digit: number | undefined }>({
      props: { value: "string" },
      state: (state, part) => {
        const char = state.text.charAt(state.text.length - Number(part.key)) || ""
        return { char, digit: /\d/.test(char) ? Number(char) : undefined }
      },
      attrs: (state, part) => {
        const char = state.text.charAt(state.text.length - Number(part.key)) || ""
        const digit = /\d/.test(char)
        return {
          "data-digit": digit ? "" : undefined,
          style: digit ? css({ "--d": Number(char) }) : undefined,
        }
      },
    }),
  }),
  agent: { actions: [], shown: () => false },
})

export { badge, countText, roll, type BadgeOptions, type RollOptions }
