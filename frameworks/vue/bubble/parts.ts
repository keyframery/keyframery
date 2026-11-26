/* The bubble's and bubble group's parts, made once from the core definitions (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { bubble, bubbleGroup } from "@/components/keyframery/core/bubble-core"

export const parts = createParts(bubble, { root: "div", content: "div", reactions: "div" })
export const groupParts = createParts(bubbleGroup, { root: "div" })
