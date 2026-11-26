<script setup lang="ts">
/* Styled approval (src/components/ui/approval.tsx): a person says yes or no to something an AI agent wants
   to do. A card on the card surface: a shield tile tinted by the risk, the title, what the agent would
   press, and a footer band with "Always allow", Deny and Approve (hidden from agents). High risk turns the
   accent destructive, styles Approve as destructive and gives Deny the default focus. Once answered the
   card closes to its header and the answer sits where the risk was.

   Motion: the card fades in with a small rise (the rise and blur beyond that are flourish); the body
   closes by grid row; the answer rises in and its mark pops and draws (flourish).

   `request` binds a request from createApprovals(); the default slot adds details above the buttons. */
import type { ChangeDetails } from "@ui-sdk/core"
import { computed, useAttrs, useSlots } from "vue"

import type { ApprovalRequest, ApprovalRisk, ApprovalStatus } from "@/components/keyframery/core/approval-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import ApprovalActions from "./ApprovalActions.vue"
import ApprovalBody from "./ApprovalBody.vue"
import ApprovalDescription from "./ApprovalDescription.vue"
import ApprovalDetails from "./ApprovalDetails.vue"
import ApprovalIcon from "./ApprovalIcon.vue"
import ApprovalRiskPart from "./ApprovalRisk.vue"
import ApprovalSummary from "./ApprovalSummary.vue"
import ApprovalTarget from "./ApprovalTarget.vue"
import ApprovalTitle from "./ApprovalTitle.vue"
import { ApprovalRoot } from "./primitive"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    speed?: SpeedValue
    /** What the agent wants to do, like "Issue a refund". */
    title?: string
    /** A sentence on what it changes. */
    description?: string
    /** The control it would use, like "Press “Refund order #1048”". */
    target?: string
    risk?: ApprovalRisk
    status?: ApprovalStatus
    defaultStatus?: ApprovalStatus
    askReason?: boolean
    resolvedAt?: number
    /** Show "Always allow this action". */
    allowAlways?: boolean
    /** Focus the default button when the card arrives: Approve, or Deny at high risk. */
    autoFocus?: boolean
    /** A request from createApprovals(): binds title, description, target, risk, status and the answer. */
    request?: ApprovalRequest
  }>(),
  {
    speed: undefined,
    title: undefined,
    description: undefined,
    target: undefined,
    risk: undefined,
    status: undefined,
    defaultStatus: undefined,
    askReason: undefined,
    resolvedAt: undefined,
    allowAlways: false,
    autoFocus: false,
    request: undefined,
  },
)
const emit = defineEmits<{
  approve: [details: { always: boolean }]
  deny: [reason: string | undefined]
  "status-change": [status: ApprovalStatus, details: ChangeDetails<string>]
  "update:status": [status: ApprovalStatus]
}>()
const attrs = useAttrs()
const slots = useSlots()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const bound = computed(() => {
  const request = props.request
  return request
    ? {
        title: props.title ?? request.title,
        description: props.description ?? request.description,
        target: props.target ?? request.target,
        risk: props.risk ?? request.risk,
        status: props.status ?? request.status,
        resolvedAt: props.resolvedAt ?? request.resolvedAt,
      }
    : { title: props.title, description: props.description, target: props.target, risk: props.risk, status: props.status, resolvedAt: props.resolvedAt }
})
const onApprove = (details: { always: boolean }) => {
  emit("approve", details)
  props.request?.approve({ always: details.always })
}
const onDeny = (reason: string | undefined) => {
  emit("deny", reason)
  props.request?.deny(reason)
}
const base = cn(
  "group/approval animate-[kf-approval-in_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
  "@container w-full min-w-0 overflow-hidden rounded-[var(--approval-radius,14px)] bg-[var(--approval-face,var(--card))] text-card-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.7)]",
  "[--approval-tone:var(--approval-accent,var(--foreground))] data-[risk=low]:[--approval-tone:var(--approval-accent,var(--muted-foreground))] data-[risk=high]:[--approval-tone:var(--approval-accent,var(--destructive))]",
  "[--approval-pad:var(--approval-inset,14px)]",
)
</script>

<template>
  <Speed :speed="props.speed">
    <ApprovalRoot
      :risk="bound.risk"
      :status="bound.status"
      :default-status="props.defaultStatus"
      :ask-reason="props.askReason"
      :resolved-at="bound.resolvedAt"
      v-bind="forwarded"
      :class="cn(base, attrs.class as any)"
      @approve="onApprove"
      @deny="onDeny"
      @status-change="(s: ApprovalStatus, d: ChangeDetails<string>) => emit('status-change', s, d)"
      @update:status="(s: ApprovalStatus) => emit('update:status', s)"
    >
      <div class="flex min-w-0 items-start gap-3 p-[var(--approval-pad)]">
        <ApprovalIcon />
        <div class="flex min-w-0 flex-1 items-center gap-3 self-center">
          <ApprovalTitle class="flex-1">{{ bound.title }}</ApprovalTitle>
          <span class="grid shrink-0 justify-items-end *:col-start-1 *:row-start-1">
            <ApprovalRiskPart />
            <ApprovalSummary />
          </span>
        </div>
      </div>
      <ApprovalBody>
        <div
          v-if="bound.description || bound.target || slots.default"
          class="-mt-1.5 flex min-w-0 flex-col gap-2.5 ps-[calc(var(--approval-pad)+2.75rem)] @max-[24rem]:ps-[var(--approval-pad)] @max-[24rem]:mt-0 pe-[var(--approval-pad)] pb-[var(--approval-pad)]"
        >
          <ApprovalDescription v-if="bound.description">{{ bound.description }}</ApprovalDescription>
          <ApprovalTarget v-if="bound.target">{{ bound.target }}</ApprovalTarget>
          <ApprovalDetails v-if="slots.default"><slot /></ApprovalDetails>
        </div>
        <ApprovalActions :allow-always="props.allowAlways" :auto-focus="props.autoFocus" />
      </ApprovalBody>
    </ApprovalRoot>
  </Speed>
</template>

<style>
@keyframes kf-approval-in { from { opacity: 0; translate: 0 calc(4px + 8px * var(--kf-flourish, 1)); scale: calc(0.985 - 0.015 * var(--kf-flourish, 1)); filter: blur(calc(4px * var(--kf-flourish, 1))) } }
@keyframes kf-approval-answer { from { opacity: 0; translate: 0 calc(6px * var(--kf-flourish, 1)); filter: blur(calc(3px * var(--kf-flourish, 1))) } }
@keyframes kf-approval-draw { from { stroke-dashoffset: 1 } }
@keyframes kf-approval-pop { from { scale: calc(1 - 0.6 * var(--kf-flourish, 1)); opacity: 0 } }
</style>
