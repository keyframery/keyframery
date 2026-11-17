/* A breadcrumb trail, as a UI SDK primitive. UI SDK ships no breadcrumb, so it is defined here with
   `definePrimitive`, with shadcn/ui's parts: a `nav` holding an ordered list of items, each a link or
   the current page, with separators between them and an ellipsis for pages left out.

   It follows the WAI-ARIA breadcrumb pattern: a navigation landmark with a name, links in an ordered
   list, and the current page marked `aria-current="page"`. Separators and the ellipsis are hidden
   from assistive technology; put the ellipsis inside a menu trigger to list the pages it stands for. */

import { definePrimitive } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/core/agent-content"

const breadcrumb = definePrimitive({
  name: "breadcrumb",
  state: () => ({ content: "" }),
  controlled: ["content"],
  api: () => ({}),
  slots: (slot) => ({
    /* The navigation landmark. Name it with `aria-label`; the React part defaults it to "Breadcrumb". */
    root: slot({
      role: "navigation",
      bind: (el, part) => bindAgentContent(el, (content) => part.store.set({ content })),
    }),
    list: slot({ role: "list" }),
    item: slot({ role: "listitem" }),
    /* A page above this one. Renders an <a>; pass `render` for your router's link. */
    link: slot({}),
    /* This page: not a link, so it can't be followed, but read as the last step of the trail. */
    page: slot({
      role: "link",
      focus: { none: "The current page is the end of the trail, not somewhere to go." },
      press: { none: "The current page does nothing when pressed." },
      attrs: () => ({ "aria-disabled": "true", "aria-current": "page" }),
    }),
    separator: slot({
      role: "presentation",
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    /* Stands for pages left out of a long trail. It's a picture: put it in a menu trigger with a name. */
    ellipsis: slot({
      role: "presentation",
      attrs: () => ({ "aria-hidden": "true" }),
    }),
  }),
  /* The trail is readable context; its links retain their native navigation. */
  agent: { actions: [] },
})

export { breadcrumb }
