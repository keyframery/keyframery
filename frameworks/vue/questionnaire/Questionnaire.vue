<script lang="ts">
/* A questionnaire: one question at a time, as a form. Put the items in QuestionnaireItems and the
   next question slides in from the right out of a blur while the one before leaves to the left. */
import { defineComponent, provide, type PropType } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import {
  questionnaire,
  type QuestionnaireItemChangeReason,
  type QuestionnaireItemDefinition,
  type QuestionnaireValue,
  type QuestionnaireValueChangeReason,
} from "@/components/keyframery/core/questionnaire-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { handleKey, rootClass } from "./parts"

export default defineComponent({
  name: "Questionnaire",
  inheritAttrs: false,
  props: {
    /** The items, in order. Progress, navigation and shortcuts read them. */
    items: { type: Array as PropType<readonly QuestionnaireItemDefinition[]>, default: undefined },
    /** The active item's name, to control it (`v-model:item`). */
    item: { type: String, default: undefined },
    /** The item active at first. Defaults to the first enabled one. */
    defaultItem: { type: String, default: undefined },
    /** The answers by item name, to control them (`v-model:value`). */
    value: { type: Object as PropType<QuestionnaireValue>, default: undefined },
    /** The answers at first. */
    defaultValue: { type: Object as PropType<QuestionnaireValue>, default: undefined },
    /** Gives each fixed choice a key: "letters" (A, B, C) or "numbers" (1, 2, 3). */
    shortcuts: { type: String as PropType<"letters" | "numbers">, default: undefined },
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  emits: {
    itemChange: (_item: string, _details: ChangeDetails<QuestionnaireItemChangeReason>) => true,
    "update:item": (_item: string) => true,
    valueChange: (_value: QuestionnaireValue, _details: ChangeDetails<QuestionnaireValueChangeReason>) => true,
    "update:value": (_value: QuestionnaireValue) => true,
    /** The answers, when the form submits after every item is valid. */
    complete: (_value: QuestionnaireValue, _details: { reason: string; event?: Event }) => true,
  },
  slots: Object as PartSlots<typeof questionnaire, "root">,
  setup(props, { attrs, emit }) {
    const handle = usePrimitive(questionnaire, () => ({
      items: props.items,
      item: props.item,
      defaultItem: props.defaultItem,
      value: props.value,
      defaultValue: props.defaultValue,
      shortcuts: props.shortcuts,
      onItemChange: (item, details) => {
        emit("itemChange", item, details)
        if (!details.canceled) emit("update:item", item)
      },
      onValueChange: (value, details) => {
        emit("valueChange", value, details)
        if (!details.canceled) emit("update:value", value)
      },
      onComplete: (value, details) => emit("complete", value, details),
    }))
    provide(handleKey, handle)
    const speed = useSpeed(() => props.speed)
    /* The questionnaire validates on its own; the browser's bubbles would only get in the way. */
    return usePart(
      handle,
      "root",
      () => ({}),
      () => ({ noValidate: true, ...attrs, class: cn(rootClass, attrs.class as string), style: [speed.value, attrs.style as any] }),
      "form",
    )
  },
})
</script>

<style>
/* kf-questionnaire: the keyframes this part animates with (React's <style href="kf-questionnaire">), shipped with the component. */
@keyframes kf-questionnaire-error{from{opacity:0;translate:0 -4px;filter:blur(calc(3px*var(--kf-flourish,1)))}}
</style>
