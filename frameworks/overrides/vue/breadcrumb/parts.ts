/* The breadcrumb's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { breadcrumb } from "@/components/keyframery/core/breadcrumb-core"

export const parts = createParts(breadcrumb, {
  root: "nav",
  list: "ol",
  item: "li",
  link: "a",
  page: "span",
  separator: "li",
  ellipsis: "span",
})
