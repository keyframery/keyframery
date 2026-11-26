<script lang="ts">
/* The choice's key, from `shortcuts`. Renders nothing for a choice without one. */
import { defineComponent } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { useItemName } from "./parts"

export default defineComponent({
  name: "QuestionnaireChoiceShortcut",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as PartSlots<typeof questionnaire, "choice-shortcut">,
  setup(props, { attrs, slots }) {
    const name = useItemName("QuestionnaireChoiceShortcut")
    return usePart(questionnaire, "choice-shortcut", () => ({ value: props.value, name: name() }), () => ({ ...attrs }), {
      tag: "kbd",
      children: (state) => (slots.default ? slots.default({ state }) : state.shortcut),
    })
  },
})
</script>
