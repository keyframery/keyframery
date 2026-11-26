/* The empty state's parts, made once from the core definition (the React primitive's createParts, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { empty } from "@/components/keyframery/core/empty-core"

export const parts = createParts(empty, { root: "div", header: "div", media: "div", title: "div", description: "p", content: "div" })
