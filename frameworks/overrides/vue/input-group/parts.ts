/* The input group's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { inputGroup } from "@/components/keyframery/core/input-group-core"

export const parts = createParts(inputGroup, { root: "div", addon: "div", text: "span", count: "span" })
