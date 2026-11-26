<script lang="ts">
/* One question. Inside QuestionnaireItems it slides and blurs in and out; its children rise in one
   after another on arrival. */
import { defineComponent, provide } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { questionnaire } from "@/components/keyframery/core/questionnaire-core"
import { cn } from "@/lib/utils"
import { itemClass, itemKey } from "./parts"

export default defineComponent({
  name: "QuestionnaireItem",
  inheritAttrs: false,
  props: { name: { type: String, required: true } },
  slots: Object as PartSlots<typeof questionnaire, "item">,
  setup(props, { attrs }) {
    provide(itemKey, () => props.name)
    return usePart(questionnaire, "item", () => ({ name: props.name }), () => ({ ...attrs, class: cn(itemClass, attrs.class as string) }), "fieldset")
  },
})
</script>
