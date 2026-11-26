<script lang="ts">
/* A freeform answer, Keyframery's input controlled by the questionnaire. Typing replaces a chosen
   radio answer; choosing a radio clears the text. For single-answer items. Give it an aria-label.
   `class` styles the wrapper; `inputClass` and every other attribute go to the input. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { Input } from "@/components/keyframery/input"
import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { useItemName, useQuestionnaire } from "./parts"

export default defineComponent({
  name: "QuestionnaireInput",
  inheritAttrs: false,
  props: {
    /** Classes for the input inside. */
    inputClass: { type: String, default: undefined },
  },
  slots: Object as PartSlots<typeof questionnaire, "input">,
  setup(props, { attrs }) {
    const handle = useQuestionnaire()
    const name = useItemName("QuestionnaireInput")
    return usePart(questionnaire, "input", () => ({ name: name() }), () => ({ class: cn("w-full min-w-0", attrs.class as string) }), {
      tag: "div",
      children: (state) => {
        const { class: _class, ...rest } = attrs
        return h(Input as any, {
          ...rest,
          value: state.value,
          "aria-invalid": state.invalid || undefined,
          onValueChange: (next: string, details: { event?: Event }) => handle.api.answer(state.name, next, details.event, "input-change"),
          class: cn("h-11", props.inputClass),
        })
      },
    })
  },
})
</script>
