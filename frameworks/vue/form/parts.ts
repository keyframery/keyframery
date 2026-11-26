/* The form's parts, made once from the core definition (the React primitive's createParts and usePart, for Vue). */
import { createParts } from "@ui-sdk/vue/primitive"

import { form } from "@/components/keyframery/core/form-core"

export const parts = createParts(form, { root: "form", submit: "button", status: "p" })
