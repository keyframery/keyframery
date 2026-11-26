<script setup lang="ts">
/* The card the props describe: header, then input and output (or the error). Internal to ToolCall. */
import { computed, onBeforeUnmount, ref, watch } from "vue"

import { formatDuration, type ToolCallStatus } from "@/components/keyframery/core/tool-call-core"
import { Badge } from "@/components/keyframery/badge"
import ToolCallContent from "./ToolCallContent.vue"
import ToolCallDuration from "./ToolCallDuration.vue"
import ToolCallError from "./ToolCallError.vue"
import ToolCallIcon from "./ToolCallIcon.vue"
import ToolCallLabel from "./ToolCallLabel.vue"
import ToolCallName from "./ToolCallName.vue"
import ToolCallSection from "./ToolCallSection.vue"
import ToolCallStatusText from "./ToolCallStatusText.vue"
import ToolCallTitle from "./ToolCallTitle.vue"
import ToolCallTrigger from "./ToolCallTrigger.vue"
import ToolCallValue from "./ToolCallValue.vue"

const props = withDefaults(
  defineProps<{
    name?: string
    title?: string
    status?: ToolCallStatus
    input?: unknown
    output?: unknown
    error?: string
    duration?: number
    startedAt?: number
  }>(),
  { status: "done" },
)

/* The time since `startedAt`, ticking while running. A clock, not an animation. */
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
watch(
  () => [props.startedAt, props.status === "running"] as const,
  ([from, live]) => {
    clearInterval(timer)
    if (!live || from === undefined) return
    now.value = Date.now()
    timer = setInterval(() => (now.value = Date.now()), 100)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearInterval(timer))
const elapsed = computed(() => (props.startedAt === undefined ? undefined : Math.max(0, now.value - props.startedAt)))
const time = computed(() => (props.status === "running" ? formatDuration(elapsed.value) : formatDuration(props.duration)))
const hasOutput = computed(() => props.output !== undefined && props.output !== null && props.output !== "")
</script>

<template>
  <ToolCallTrigger>
    <ToolCallIcon />
    <ToolCallTitle>{{ title || name }}</ToolCallTitle>
    <ToolCallName v-if="title && name">{{ name }}</ToolCallName>
    <span class="ms-auto flex shrink-0 items-center gap-2 ps-1">
      <Badge v-if="status === 'approval'" variant="outline"><ToolCallStatusText /></Badge>
      <ToolCallStatusText v-else-if="status !== 'done' && status !== 'running'" />
      <span v-if="status === 'running'" class="sr-only"><ToolCallStatusText /></span>
      <ToolCallDuration v-if="time && (status === 'done' || status === 'running')">{{ time }}</ToolCallDuration>
    </span>
  </ToolCallTrigger>
  <ToolCallContent>
    <ToolCallSection v-if="input !== undefined" kind="input">
      <ToolCallLabel>Input</ToolCallLabel>
      <ToolCallValue :value="input" />
    </ToolCallSection>
    <ToolCallSection v-if="status === 'error' && error" kind="error">
      <ToolCallLabel>Error</ToolCallLabel>
      <ToolCallError>{{ error }}</ToolCallError>
    </ToolCallSection>
    <ToolCallSection v-else-if="hasOutput" kind="output">
      <ToolCallLabel>Output</ToolCallLabel>
      <ToolCallValue :value="output" />
    </ToolCallSection>
    <ToolCallSection v-else-if="status === 'running' || status === 'pending' || status === 'approval'" kind="output">
      <ToolCallLabel>Output</ToolCallLabel>
      <p class="text-[12.5px] text-[color:var(--tool-call-muted,var(--muted-foreground))]">
        {{ status === "approval" ? "Waits for your approval." : status === "pending" ? "Not started yet." : "Waiting for the tool…" }}
      </p>
    </ToolCallSection>
  </ToolCallContent>
</template>
