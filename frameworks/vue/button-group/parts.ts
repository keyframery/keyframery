/* The button group's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { buttonGroup } from "@/components/keyframery/core/button-group-core"

export const parts = createParts(buttonGroup, { root: "div", text: "div" })
