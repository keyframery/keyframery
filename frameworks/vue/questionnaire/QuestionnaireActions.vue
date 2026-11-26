<script lang="ts">
/* The row for Previous, Skip, Next and Submit. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { actionsClass } from "./parts"

export default defineComponent({
  name: "QuestionnaireActions",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "actions">,
  setup(_, { attrs }) {

    return usePart(questionnaire, "actions", undefined, () => ({ ...attrs, class: cn(actionsClass, attrs.class as string) }), "div")
  },
})
</script>
