/* The description list's parts and its copy button, made once from the core definitions (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { descriptionList, descriptionListCopy } from "@/components/keyframery/core/description-list-core"

export const parts = createParts(descriptionList, { root: "dl", item: "div", term: "dt", details: "dd", value: "span", actions: "span" })
export const copyParts = createParts(descriptionListCopy, { root: "button" })
