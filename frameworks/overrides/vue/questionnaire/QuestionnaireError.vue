<script lang="ts">
/* Shown while the item failed validation; it drops in from under the answers. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { errorClass, useItemName } from "./parts"

export default defineComponent({
  name: "QuestionnaireError",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "error">,
  setup(_, { attrs, slots }) {
    const name = useItemName("QuestionnaireError")
    return usePart(questionnaire, "error", () => ({ name: name() }), () => ({ ...attrs, class: cn(errorClass, attrs.class as string) }), {
      tag: "p",
      children: (state) => (slots.default ? slots.default({ state }) : "Choose an answer to continue."),
    })
  },
})
</script>
