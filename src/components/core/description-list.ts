/* Description lists, as UI SDK primitives. UI SDK ships none, so they are defined with its core: the
   same definitions render in React, Vue, Svelte, Solid and web components.

   `descriptionList` is the label and value rows of a detail page (a customer, an order), with real
   `dl` / `dt` / `dd` semantics. It lays them out as rows, stacked or a grid (`layout`), wraps or
   truncates long values (`truncate`, with the full text as a title), and keeps every label and value
   readable for agents as its `items`.

   `descriptionListCopy` is a button that copies one value: the text you give it, or the value it
   sits beside. It says "Copied" on itself for two seconds and tells screen readers. */

import { announce, css, definePrimitive } from "@ui-sdk/core"

type DescriptionListLayout = "rows" | "stacked" | "grid"

type DescriptionListOptions = {
  /** "rows" (a label column and hairlines, the default), "stacked" (label above value) or "grid". */
  layout?: DescriptionListLayout
  /** For the grid: how many columns, at full width. */
  columns?: number
  /** Long values stay on one line, ending in an ellipsis, with the full text as a title. */
  truncate?: boolean
}

type DescriptionListItem = { value: string; label: string }

type DescriptionListState = {
  layout: DescriptionListLayout
  columns: number
  truncate: boolean
  /** Every label with its value, read from the page. */
  items: DescriptionListItem[]
}

const fromOptions = (options: DescriptionListOptions) => ({
  layout: options.layout ?? "rows",
  columns: Math.max(1, Math.min(4, options.columns ?? 2)),
  truncate: options.truncate ?? false,
})

/* The text a value part shows, without its actions or anything hidden from readers. */
function readText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ""
  if (!(node instanceof Element)) return ""
  if (node.matches('[aria-hidden="true"], [hidden], [data-agent-hidden], [data-slot="description-list-actions"], .sr-only')) return ""
  if (node.hasAttribute("data-agent-secret")) return "[redacted]"
  return Array.from(node.childNodes, readText).join(" ")
}

const clean = (text: string) => text.replace(/\s+/g, " ").trim()

/** The value of one item element: its value part if it has one, else its details. */
function valueOf(item: Element) {
  const value = item.querySelector('[data-slot="description-list-value"]') ?? item.querySelector('[data-slot="description-list-details"]')
  return value ? clean(readText(value)) : ""
}

function labelOf(item: Element) {
  const term = item.querySelector('[data-slot="description-list-term"]')
  return term ? clean(readText(term)) : ""
}

const descriptionList = definePrimitive({
  name: "description-list",
  options: { layout: "string", columns: "number", truncate: "boolean" },
  state: (options: DescriptionListOptions): DescriptionListState => ({ ...fromOptions(options), items: [] }),
  sync: (options) => fromOptions(options),
  controlled: ["items", "layout"],
  api: (context) => ({
    /** @internal Reads every label and value from the page into `items`. */
    read(el: HTMLElement) {
      const items = Array.from(el.querySelectorAll('[data-slot="description-list-item"]'), (item) => ({
        label: labelOf(item),
        value: valueOf(item),
      })).filter((item) => item.label || item.value)
      const now = context.store.get().items
      if (items.length === now.length && items.every((item, index) => item.label === now[index].label && item.value === now[index].value)) return
      context.store.set({ items })
    },
  }),
  slots: (slot) => ({
    root: slot<{}, { layout: DescriptionListLayout; columns: number; truncate: boolean }>({
      state: (state) => ({ layout: state.layout, columns: state.columns, truncate: state.truncate }),
      attrs: (state) => ({
        "data-layout": state.layout,
        "data-truncate": state.truncate ? "" : undefined,
        style: css({ "--description-list-columns": state.columns }),
      }),
      bind: (el, part) => {
        part.api.read(el)
        const observer = new MutationObserver(() => part.api.read(el))
        observer.observe(el, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-hidden", "hidden"] })
        return () => observer.disconnect()
      },
    }),
    /* One label with its value. A `div` around a `dt` and its `dd`s is valid inside a `dl`. */
    item: slot<{ value?: string }, { layout: DescriptionListLayout }>({
      props: { value: "string" },
      state: (state) => ({ layout: state.layout }),
      attrs: (state) => ({ "data-layout": state.layout }),
    }),
    term: slot({}),
    details: slot<{}, { truncate: boolean }>({
      state: (state) => ({ truncate: state.truncate }),
      attrs: (state) => ({ "data-truncate": state.truncate ? "" : undefined }),
    }),
    /* The value itself, beside any actions. Truncated, it carries its full text as a title. */
    value: slot<{}, { truncate: boolean }>({
      state: (state) => ({ truncate: state.truncate }),
      attrs: (state) => ({ "data-truncate": state.truncate ? "" : undefined }),
      bind: (el, part) => {
        const title = () => {
          const text = clean(readText(el))
          if (part.store.get().truncate && text) el.setAttribute("title", text)
          else el.removeAttribute("title")
        }
        title()
        const observer = new MutationObserver(title)
        observer.observe(el, { subtree: true, childList: true, characterData: true })
        const stop = part.store.subscribe(title)
        return () => {
          observer.disconnect()
          stop()
        }
      },
    }),
    /* Buttons or links that act on the value: a copy button, an Edit link. */
    actions: slot({}),
  }),
  /* Agents read every label and value; the list itself has no actions. */
  agent: { actions: [] },
})

type DescriptionListCopyOptions = {
  /** The text to copy. Leave it out to copy the value the button sits beside. */
  value?: string
  /** What the value is called, for the button's name ("Copy Email"). Read from the item's label when left out. */
  label?: string
  /** Runs after the text was copied. */
  onCopy?: (text: string) => void
}

type DescriptionListCopyState = {
  copied: boolean
  /** What the button copies, read from the page when no `value` is given. */
  text: string
  /** What the value is called. */
  label: string
}

const descriptionListCopy = definePrimitive({
  name: "description-list-copy",
  options: { value: "string", label: "string", onCopy: "callback" },
  state: (options: DescriptionListCopyOptions): DescriptionListCopyState => ({
    copied: false,
    text: options.value ?? "",
    label: options.label ?? "",
  }),
  sync: (options) => ({
    ...(options.value === undefined ? {} : { text: options.value }),
    ...(options.label === undefined ? {} : { label: options.label }),
  }),
  controlled: ["copied", "text"],
  api: (context) => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let button: HTMLElement | undefined
    context.onDestroy(() => clearTimeout(timer))

    const write = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        /* No clipboard permission (an insecure page, an embedded frame): the old way still works. */
        const area = document.createElement("textarea")
        area.value = text
        area.setAttribute("readonly", "")
        area.style.position = "fixed"
        area.style.opacity = "0"
        document.body.append(area)
        area.select()
        document.execCommand("copy")
        area.remove()
      }
    }

    return {
      /** @internal Reads the value and label beside the button, when they weren't given. */
      attach(el: HTMLElement) {
        button = el
        const item = el.closest('[data-slot="description-list-item"]')
        if (!item) return () => {}
        const read = () => {
          const options = context.options()
          const next: Partial<DescriptionListCopyState> = {}
          if (options.value === undefined) next.text = valueOf(item)
          if (options.label === undefined) next.label = labelOf(item)
          const now = context.store.get()
          if ((next.text ?? now.text) !== now.text || (next.label ?? now.label) !== now.label) context.store.set(next)
        }
        read()
        const observer = new MutationObserver(read)
        observer.observe(item, { subtree: true, childList: true, characterData: true })
        return () => {
          observer.disconnect()
          button = undefined
        }
      },
      /** Copies the value, says "Copied" on the button for two seconds and tells screen readers. */
      async copy() {
        const { text } = context.store.get()
        await write(text)
        clearTimeout(timer)
        context.store.set({ copied: true })
        announce("Copied")
        context.options().onCopy?.(text)
        const speed = (button && parseFloat(getComputedStyle(button).getPropertyValue("--kf-speed"))) || 1
        timer = setTimeout(() => context.store.set({ copied: false }), 2000 * speed)
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { copied: boolean }>({
      role: "button",
      focus: "native",
      state: (state) => ({ copied: state.copied }),
      attrs: (state) => ({
        type: "button",
        "aria-label": state.copied ? "Copied" : state.label ? `Copy ${state.label}` : "Copy",
        "data-copied": state.copied ? "" : undefined,
      }),
      press: ({ api }) => void api.copy(),
      bind: (el, part) => part.api.attach(el),
    }),
  }),
  agent: { actions: ["copy"] },
})

export {
  descriptionList,
  descriptionListCopy,
  type DescriptionListCopyOptions,
  type DescriptionListItem,
  type DescriptionListLayout,
  type DescriptionListOptions,
}
