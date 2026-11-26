<script lang="ts">
/* A choice's text. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"

export default defineComponent({
  name: "QuestionnaireChoiceLabel",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof questionnaire, "choice-label">,
  setup(_, { attrs }) {

    return usePart(questionnaire, "choice-label", undefined, () => ({ ...attrs, class: attrs.class as string }), "span")
  },
})
</script>
