/* Previous, Skip, Next and Submit: a wrapper the questionnaire shows and hides, around Keyframery's
   button. The button keeps its own press; its click reaches the questionnaire as it bubbles. */
import { defineComponent, h, type PropType } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { Button } from "@/components/keyframery/button"
import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { actionClass, buttonArrow } from "./parts"

type Variant = "default" | "primary" | "ghost" | "destructive"
type Size = "md" | "sm" | "lg" | "icon-sm" | "icon" | "icon-lg"

export function action(slot: "previous" | "skip" | "next" | "submit", name: string, label: string, variant: Variant) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: {
      variant: { type: String as PropType<Variant>, default: variant },
      size: { type: String as PropType<Size>, default: "lg" },
      /** Props for the button inside. */
      buttonProps: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    },
    slots: Object as PartSlots<typeof questionnaire, typeof slot>,
    setup(props, { attrs, slots }) {
      return usePart(questionnaire, slot, undefined, () => ({ ...attrs, class: cn(actionClass, attrs.class as string) }), {
        tag: "span",
        children: (state) =>
          h(
            Button as any,
            {
              type: slot === "submit" ? "submit" : "button",
              variant: props.variant,
              size: props.size,
              ...(slot === "skip" ? { class: "text-[color:var(--questionnaire-muted,var(--muted-foreground))]" } : null),
              ...props.buttonProps,
            },
            () => [slots.default ? slots.default({ state }) : label, slot === "next" ? buttonArrow() : null],
          ),
      })
    },
  })
}
