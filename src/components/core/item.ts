/* Items, as UI SDK primitives. UI SDK ships no item, so these are defined with its core: the same
   definitions render in React, Vue, Svelte, Solid and web components.

   An `item` is one row of content: media, a title, a description and actions. It can stay a plain
   row or become a link or a button with `render`. `itemGroup` is a list of them. An item inside a
   group becomes a list item; outside one it has no role, so it never claims to be in a list.

   The item reports `data-hovered` while a pointer is over it, so a group can move one highlight
   from row to row (a script's pointer events count too, which CSS `:hover` cannot see). */

import { definePrimitive } from "@ui-sdk/core"

type ItemVariant = "default" | "outline" | "muted"
type ItemSize = "default" | "sm"
type ItemMediaVariant = "default" | "icon" | "image"

type ItemOptions = {
  /** The surface: `"default"` is bare, `"outline"` has a hairline, `"muted"` a soft fill. */
  variant?: ItemVariant
  /** `"sm"` tightens the padding and the gap. */
  size?: ItemSize
}

type ItemState = {
  variant: ItemVariant
  size: ItemSize
  /** A pointer is over the item. */
  hovered: boolean
  /** The item sits inside an item group, so it is one of its list items. */
  listed: boolean
}

const item = definePrimitive({
  name: "item",
  options: { variant: "string", size: "string" },
  state: (options: ItemOptions): ItemState => ({
    variant: options.variant ?? "default",
    size: options.size ?? "default",
    hovered: false,
    listed: false,
  }),
  sync: (options) => ({ variant: options.variant ?? "default", size: options.size ?? "default" }),
  controlled: [],
  api: (context) => ({
    /** Marks the item hovered or not. A pointer does this; a demo or a test can too. */
    hover(hovered: boolean) {
      if (context.store.get().hovered !== hovered) context.store.set({ hovered })
    },
  }),
  slots: (slot) => ({
    root: slot<{}, { variant: ItemVariant; size: ItemSize; hovered: boolean }>({
      role: (state) => (state.listed ? "listitem" : undefined),
      roles: ["listitem"],
      state: (state) => ({ variant: state.variant, size: state.size, hovered: state.hovered }),
      attrs: (state) => ({
        "data-variant": state.variant,
        "data-size": state.size,
        "data-hovered": state.hovered ? "" : undefined,
      }),
      on: {
        pointerenter: (_event, { api }) => api.hover(true),
        pointerleave: (_event, { api }) => api.hover(false),
      },
      /* Whether it is in a list is a fact of the page, so it is read once the element is there.
         A row rendered as a link or a button keeps its own role: a list item role would hide it. */
      bind: (el, part) => {
        const interactive = el.matches("a[href], button, [role=button], [role=link]")
        const listed = !interactive && !!el.parentElement?.closest('[data-slot="item-group"]')
        if (part.store.get().listed !== listed) part.store.set({ listed })
      },
    }),
    media: slot<{ variant?: ItemMediaVariant }, { variant: ItemMediaVariant }>({
      props: { variant: "string" },
      state: (_state, part) => ({ variant: part.props.variant ?? "default" }),
      attrs: (_state, part) => ({ "data-variant": part.props.variant ?? "default" }),
    }),
    content: slot({}),
    title: slot({}),
    description: slot({}),
    actions: slot({}),
    header: slot({}),
    footer: slot({}),
  }),
  /* An item is layout. What an agent uses is inside it: its links, buttons and controls. */
  agent: { actions: [], shown: () => false },
})

/* A list of items. Its separators are UI SDK's Separator, composed in the renderer. */
const itemGroup = definePrimitive({
  name: "item-group",
  state: () => ({}),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot({ role: "list" }),
  }),
  agent: { actions: [], shown: () => false },
})

export { item, itemGroup, type ItemMediaVariant, type ItemOptions, type ItemSize, type ItemVariant }
