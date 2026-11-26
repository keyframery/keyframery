/* The attachment's and attachment group's parts, made once from the core definitions (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { attachment, attachmentGroup } from "@/components/keyframery/core/attachment-core"

export const parts = createParts(attachment, {
  root: "div",
  media: "div",
  content: "div",
  title: "span",
  description: "span",
  progress: "span",
  actions: "div",
  trigger: "button",
})
export const groupParts = createParts(attachmentGroup, { root: "div" })
