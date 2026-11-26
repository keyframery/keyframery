/* The card's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { card } from "@/components/keyframery/core/card-core"

export const parts = createParts(card, {
  root: "div",
  header: "div",
  title: "div",
  description: "div",
  action: "div",
  content: "div",
  footer: "div",
})
