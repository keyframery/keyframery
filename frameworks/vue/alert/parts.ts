/* The alert's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { alert } from "@/components/keyframery/core/alert-core"

export const parts = createParts(alert, { root: "div", title: "div", description: "div", close: "button" })
