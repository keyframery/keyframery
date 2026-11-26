<script setup lang="ts">
/* The footer band: "Always allow" on the left, Deny and Approve on the right (Keyframery's checkbox and
   buttons). With `askReason` on the card, Deny first opens a field for the reason. Everything sits inside
   a `data-agent-hidden` wrapper (display: contents): agents never see or press it. */
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from "vue"

import { Button } from "@/components/keyframery/button"
import { Checkbox } from "@/components/keyframery/checkbox"
import { Textarea } from "@/components/keyframery/textarea"
import { cn } from "@/lib/utils"

import ApprovalReveal from "./ApprovalReveal.vue"
import { parts, useApproval } from "./primitive"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ allowAlways?: boolean; autoFocus?: boolean }>(), { allowAlways: false, autoFocus: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const handle = useApproval()
const api = handle.api
const id = useId()
const controls = ref<HTMLElement | null>(null)
const asking = computed(() => handle.state.stage === "reason")
const high = computed(() => handle.state.risk === "high")

/* The default button takes focus when the card arrives (if asked), and the reason field when it opens. */
onMounted(() => {
  if (props.autoFocus && handle.state.status === "pending")
    controls.value?.querySelector<HTMLElement>(high.value ? '[data-action="deny"]' : '[data-action="approve"]')?.focus({ preventScroll: true })
})
watch(asking, async (now) => {
  if (!now) return
  await nextTick()
  controls.value?.querySelector<HTMLElement>("textarea")?.focus({ preventScroll: true })
})
const onReasonKey = (e: KeyboardEvent) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) api.deny()
  if (e.key === "Escape") api.back()
}
const base = cn(
  "flex flex-col border-t border-border/70 bg-[color-mix(in_oklab,var(--muted)_45%,transparent)] px-[var(--approval-pad)] py-2.5",
  "dark:bg-[color-mix(in_oklab,var(--muted)_30%,transparent)]",
)
</script>

<template>
  <parts.Actions v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <div ref="controls" data-agent-hidden="" data-slot="approval-controls" class="contents">
        <ApprovalReveal :open="state.stage === 'reason'">
          <div class="pt-0.5 pb-2.5">
            <Textarea
              aria-label="Why not? (optional)"
              placeholder="Why not? (optional)"
              :value="state.reason"
              class="min-h-[60px]"
              @value-change="(value: string) => api.setReason(value)"
              @keydown="onReasonKey"
            />
          </div>
        </ApprovalReveal>
        <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <label
            v-if="props.allowAlways && state.stage !== 'reason'"
            :for="`${id}-always`"
            class="me-auto flex min-w-0 cursor-pointer items-center gap-2 text-[12.5px] leading-none text-muted-foreground select-none hover:text-foreground"
          >
            <Checkbox
              :id="`${id}-always`"
              :checked="state.always"
              class="[--checkbox-size:16px] [--checkbox-radius:4.5px]"
              @checked-change="(checked: boolean | 'indeterminate') => api.setAlways(checked === true)"
            />
            Always allow this action
          </label>
          <div class="ms-auto flex shrink-0 items-center gap-2">
            <template v-if="state.stage === 'reason'">
              <Button size="sm" variant="ghost" @click="api.back()">Back</Button>
              <Button size="sm" variant="destructive" @click="(e: MouseEvent) => api.deny(undefined, e)">Deny</Button>
            </template>
            <template v-else>
              <Button size="sm" data-action="deny" @click="(e: MouseEvent) => api.pressDeny(e)">Deny</Button>
              <Button size="sm" data-action="approve" :variant="state.risk === 'high' ? 'destructive' : 'primary'" @click="(e: MouseEvent) => api.approve(e)">Approve</Button>
            </template>
          </div>
        </div>
      </div>
    </template>
  </parts.Actions>
</template>
