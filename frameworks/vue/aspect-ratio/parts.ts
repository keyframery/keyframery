/* The aspect ratio's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { aspectRatio } from "@/components/keyframery/core/aspect-ratio-core"

export const parts = createParts(aspectRatio, { root: "div" })
