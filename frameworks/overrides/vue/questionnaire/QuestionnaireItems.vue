<script lang="ts">
/* Holds the items in one cell, so the question leaving and the one arriving overlap. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { itemsClass } from "./parts"

export default defineComponent({
  name: "QuestionnaireItems",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "items">,
  setup(_, { attrs }) {

    return usePart(questionnaire, "items", undefined, () => ({ ...attrs, class: cn(itemsClass, attrs.class as string) }), "div")
  },
})
</script>
