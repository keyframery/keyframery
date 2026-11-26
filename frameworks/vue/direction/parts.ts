/* The direction's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { direction } from "@/components/keyframery/core/direction-core"

export const parts = createParts(direction, { root: "div", toggle: "button" })
