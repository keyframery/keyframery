<script lang="ts">
/* The question. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { titleClass, useItemName } from "./parts"

export default defineComponent({
  name: "QuestionnaireTitle",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "title">,
  setup(_, { attrs }) {
    const name = useItemName("QuestionnaireTitle")
    return usePart(questionnaire, "title", () => ({ name: name() }), () => ({ ...attrs, class: cn(titleClass, attrs.class as string) }), "legend")
  },
})
</script>
