<script setup lang="ts">
/* Renders no element of its own. Without a #token slot of its own, each token is a small key with its
   label and an x (React's defaultRenderToken). */
import { computed, useAttrs, useSlots } from "vue"
import { TokenInput as Part } from "@ui-sdk/vue/token-input"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import TokenInputToken from "./TokenInputToken.vue"
import TokenInputTokenRemove from "./TokenInputTokenRemove.vue"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue }>()
const attrs = useAttrs()
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== "token"))
</script>

<template>
  <Speed :speed="props.speed">
    <Part v-bind="attrs">
      <template #token="s">
        <slot name="token" v-bind="s ?? {}">
          <TokenInputToken>{{ s.token.label }}<TokenInputTokenRemove /></TokenInputToken>
        </slot>
      </template>
      <template v-for="n in names" :key="n" #[n]="s">
        <slot :name="n" v-bind="s ?? {}" />
      </template>
    </Part>
  </Speed>
</template>
