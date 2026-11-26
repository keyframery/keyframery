<script lang="ts">
/* A fixed answer: a card holding its control, its text and its key. Press: the card gives a little.
   The `control` slot (it gets `state`) replaces the radio or checkbox. */
import { defineComponent, h, type SlotsType, type VNode } from "vue"
import type { StateOf } from "@ui-sdk/core"
import { usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import QuestionnaireChoiceControl from "./QuestionnaireChoiceControl.vue"
import QuestionnaireChoiceLabel from "./QuestionnaireChoiceLabel.vue"
import QuestionnaireChoiceShortcut from "./QuestionnaireChoiceShortcut.vue"
import { choiceClass, useItemName } from "./parts"

type ChoiceState = StateOf<typeof questionnaire, "choice">

export default defineComponent({
  name: "QuestionnaireChoice",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  slots: Object as SlotsType<{ default?: (scope: { state: ChoiceState }) => VNode[]; control?: (scope: { state: ChoiceState }) => VNode[] }>,
  setup(props, { attrs, slots }) {
    const name = useItemName("QuestionnaireChoice")
    return usePart(questionnaire, "choice", () => ({ value: props.value, name: name() }), () => ({ ...attrs, class: cn(choiceClass, attrs.class as string) }), {
      tag: "label",
      children: (state) => [
        slots.control ? slots.control({ state }) : h(QuestionnaireChoiceControl, { value: props.value, type: state.type, disabled: state.disabled }),
        h(QuestionnaireChoiceLabel, null, () => slots.default?.({ state })),
        h(QuestionnaireChoiceShortcut, { value: props.value }),
      ],
    })
  },
})
</script>
