/* The code block's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { codeBlock } from "@/components/keyframery/core/code-block-core"

export const parts = createParts(codeBlock, {
  root: "div",
  header: "div",
  title: "div",
  actions: "div",
  footer: "div",
  copy: "button",
  content: "pre",
  line: "span",
})
