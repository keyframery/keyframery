<script setup lang="ts">
/* Send, which becomes Stop while a reply is on its way. A UI SDK button; with no content it shows
   the arrow, the spinner ("submitted") or the stop square ("streaming"), from the root's status. */
import { computed, useAttrs } from "vue"
import { Button as ButtonPart } from "@ui-sdk/vue/button"

import { cn } from "@/lib/utils"
import { buttonLabel, buttonMotion, glyphSend, glyphStop, glyphWait } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ButtonPart data-slot="prompt-composer-send" v-bind="forwarded" :class="cn(buttonMotion, 'relative', attrs.class as any)">
    <template #default="scope">
      <span data-slot="button-label" :class="buttonLabel">
        <slot v-bind="scope ?? {}">
          <span data-slot="prompt-composer-send-icon" data-icon="send" :class="glyphSend">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 13V3.5M3.75 7.5 8 3.25l4.25 4.25" />
            </svg>
          </span>
          <span data-slot="prompt-composer-send-icon" data-icon="wait" :class="glyphWait">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              class="animate-spin [animation-duration:calc(800ms*var(--kf-speed,1))] motion-reduce:[animation-duration:calc(2400ms*var(--kf-speed,1))]"
            >
              <circle cx="8" cy="8" r="5.25" opacity="0.3" />
              <path d="M8 2.75A5.25 5.25 0 0 1 13.25 8" />
            </svg>
          </span>
          <span data-slot="prompt-composer-send-icon" data-icon="stop" :class="glyphStop">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <rect x="4.25" y="4.25" width="7.5" height="7.5" rx="1.75" />
            </svg>
          </span>
        </slot>
      </span>
    </template>
  </ButtonPart>
</template>
