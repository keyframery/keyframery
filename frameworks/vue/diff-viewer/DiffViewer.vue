<script setup lang="ts">
/* Animated diff viewer on UI SDK's core (src/components/primitives/diff-viewer.tsx) with the Keyframery look
   (src/components/ui/diff-viewer.tsx): a quiet sheet with the file and its counts on top, the code on a slightly
   sunk ground, added and removed lines tinted from two variables, changed words a stronger tint of the same,
   and slim rows above each hunk for its fold, its range and the review buttons.
   Feedback: the view switch's key slides and the new layout fades in from its side; an opened fold grows;
   a rejected hunk dims and the decision rises in. Flourish (× --kf-flourish): the hunk cascade, the count
   roll, press depth, the extra slide and blur of the view switch, the copy tick's draw. */
import { computed, useAttrs } from "vue"

import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import type { DiffView } from "@/components/keyframery/core/diff-viewer-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import DiffViewerActions from "./DiffViewerActions.vue"
import DiffViewerContent from "./DiffViewerContent.vue"
import DiffViewerCopyButton from "./DiffViewerCopyButton.vue"
import DiffViewerHeader from "./DiffViewerHeader.vue"
import DiffViewerStats from "./DiffViewerStats.vue"
import DiffViewerTitle from "./DiffViewerTitle.vue"
import DiffViewerViewSwitch from "./DiffViewerViewSwitch.vue"
import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    before?: string
    after?: string
    patch?: string
    filename?: string
    language?: CodeBlockLanguage
    view?: DiffView
    defaultView?: DiffView
    splitMinWidth?: number
    context?: number
    wordDiff?: boolean
    /** Shows Accept and Reject on every hunk. Defaults to on when you listen to `accept` or `reject`. */
    review?: boolean
    /** Shows the old and new line numbers. */
    lineNumbers?: boolean
    speed?: SpeedValue
  }>(),
  { wordDiff: undefined, review: undefined, lineNumbers: true, speed: undefined },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
/* Vue always hands the core its callbacks, so "on when onAccept or onReject is given" is decided here
   from the listeners actually bound. */
const review = computed(() => props.review ?? !!(attrs.onAccept || attrs.onReject))

/* The two diff colours, once: --diff-add and --diff-del. */
const colors = "[--diff-add:var(--diff-viewer-added,oklch(0.62_0.16_150))] [--diff-del:var(--diff-viewer-removed,var(--destructive))]"
const base = cn(
  "group/diff-viewer relative",
  colors,
  "@container/diff-viewer flex w-full min-w-0 flex-col overflow-hidden rounded-[var(--diff-viewer-radius,14px)] bg-[var(--diff-viewer-face,var(--card))] text-[13px] text-[color:var(--diff-viewer-ink,var(--card-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.7)]",
  "has-[>[data-slot=diff-viewer-content]:focus-visible]:ring-2 has-[>[data-slot=diff-viewer-content]:focus-visible]:ring-ring",
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root
      :data-numbers="props.lineNumbers ? undefined : 'off'"
      :before="props.before"
      :after="props.after"
      :patch="props.patch"
      :filename="props.filename"
      :language="props.language"
      :view="props.view"
      :default-view="props.defaultView"
      :split-min-width="props.splitMinWidth"
      :context="props.context"
      :word-diff="props.wordDiff"
      :review="review"
      v-bind="forwarded"
      :class="cn(base, attrs.class as any)"
    >
      <template #default="scope">
        <slot v-bind="scope ?? {}">
          <DiffViewerHeader>
            <DiffViewerTitle />
            <DiffViewerStats />
            <DiffViewerActions>
              <DiffViewerViewSwitch />
              <DiffViewerCopyButton />
            </DiffViewerActions>
          </DiffViewerHeader>
          <DiffViewerContent />
        </slot>
      </template>
    </parts.Root>
  </Speed>
</template>

<style>
@keyframes kf-diff-in { from { opacity: 0; translate: 0 calc(10px * var(--kf-flourish, 1)); filter: blur(calc(4px * var(--kf-flourish, 1))) } }
@keyframes kf-diff-view { from { opacity: 0; translate: var(--diff-from, 0) 0; filter: blur(calc(3px * var(--kf-flourish, 1))) } }
@keyframes kf-diff-tick { from { stroke-dashoffset: 1 } }
</style>
