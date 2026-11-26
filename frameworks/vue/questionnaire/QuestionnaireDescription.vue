<script lang="ts">
/* A line under the question. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { descriptionClass, useItemName } from "./parts"

export default defineComponent({
  name: "QuestionnaireDescription",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "description">,
  setup(_, { attrs }) {
    const name = useItemName("QuestionnaireDescription")
    return usePart(questionnaire, "description", () => ({ name: name() }), () => ({ ...attrs, class: cn(descriptionClass, attrs.class as string) }), "p")
  },
})
</script>
