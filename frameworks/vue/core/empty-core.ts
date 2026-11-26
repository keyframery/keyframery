/* Empty state, as a UI SDK primitive. UI SDK ships no empty state, so it is defined with its core:
   the same definition renders in React, Vue, Svelte, Solid and web components.

   An empty state stands in for content that isn't there yet: no results, an empty inbox, a
   project with no files. Its parts are shadcn's: a header holding the media, title and
   description, then content for the actions. It arrives with an entrance (`data-starting-style`
   for its first frame, from `animateIn`). With `announce`, a screen reader hears its title and
   description when it appears, as when a search finds nothing. */

import { animateIn, announce, definePrimitive, elements, prepareAnnouncements } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/keyframery/core/agent-content-core"

type EmptyOptions = {
  /** Reads the title and description to screen readers when the empty state appears. Use it when it replaces results someone was looking at. @defaultValue false */
  announce?: boolean
}

type EmptyMediaVariant = "default" | "icon"

const empty = definePrimitive({
  name: "empty",
  options: { announce: "boolean" },
  state: (_options: EmptyOptions) => ({ content: "" }),
  controlled: ["content"],
  api: (context) => ({
    /** Plays the entrance, and with `announce` reads the title and description once it is in. */
    arrive(el: HTMLElement) {
      const stop = animateIn(el)
      if (!context.options().announce) return stop
      prepareAnnouncements(el.ownerDocument)
      /* After the regions exist, so screen readers that only watch regions already there hear it. */
      const timer = setTimeout(() => {
        const text = [...elements(context, "title"), ...elements(context, "description")]
          .map((part) => part.el.textContent?.trim())
          .filter(Boolean)
          .join(". ")
        if (text) announce(text, { doc: el.ownerDocument })
      }, 150)
      return () => {
        stop()
        clearTimeout(timer)
      }
    },
  }),
  slots: (slot) => ({
    root: slot({
      state: () => ({}),
      bind: (el, part) => {
        const stopEntrance = part.api.arrive(el)
        const stopContent = bindAgentContent(el, (content) => part.store.set({ content }))
        return () => {
          stopEntrance()
          stopContent()
        }
      },
    }),
    header: slot({}),
    media: slot<{ variant?: EmptyMediaVariant }, { variant: EmptyMediaVariant }>({
      props: { variant: "string" },
      state: (_state, part) => ({ variant: part.props.variant ?? "default" }),
      attrs: (_state, part) => ({ "data-variant": part.props.variant ?? "default", "aria-hidden": "true" }),
    }),
    title: slot({}),
    description: slot({}),
    content: slot({}),
  }),
  /* Expose the empty state's title and description; its buttons own their actions. */
  agent: { actions: [] },
})

export { empty, type EmptyMediaVariant, type EmptyOptions }
