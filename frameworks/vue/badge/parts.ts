/* The badge's and the roll's parts, made once from the core definitions (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { badge, roll } from "@/components/keyframery/core/badge-core"

export const parts = createParts(badge, { root: "span", dot: "span" })
export const rollParts = createParts(roll, { root: "span", digit: "span" })
