<script setup lang="ts">
/* Mirrors src/demos/token-input.tsx at its defaults. */
import { computed, ref } from "vue"
import { createTokenInputController, TokenInput, TokenInputEditor, TokenInputToken, TokenInputTokenRemove, type TokenInputValue } from "@/components/keyframery/token-input"

type Value = TokenInputValue
type Segment = Value[number]
const suggested = ["leo@grantstudio.co", "fatima.noor@outlook.com"]
const typos = ["gmial.com", "gmal.com", "hotmial.com", "yaho.com"]
function emailToken(email: string): Segment {
  const domain = email.split("@")[1] ?? ""
  return { type: "email", value: email.toLowerCase(), label: email.toLowerCase(), status: typos.includes(domain.toLowerCase()) ? "unresolved" : undefined } as Segment
}
function tokenize(value: Value): Value {
  const out: any[] = []
  for (const segment of value) {
    if (typeof segment !== "string") { out.push(segment); continue }
    segment.split(/([^\s,;]+@[^\s,;]+\.[a-z]{2,})[\s,;]+/i).forEach((part, index) => {
      if (index % 2 === 1) out.push(emailToken(part))
      else if (part) out.push(part)
    })
  }
  return out
}
const value = ref<Value>([emailToken("dana@whitfield.uk"), emailToken("marcus@gmial.com"), emailToken("joanna.park@hey.com")])
const invites = createTokenInputController()
const people = computed(() => value.value.filter((s) => typeof s !== "string") as any[])
const left = computed(() => suggested.filter((email) => !people.value.some((t) => t.value === email)))
const typo = computed(() => people.value.some((t) => t.status === "unresolved"))
const theme = { "--token-input-radius": "10px", "--token-input-token-radius": "7px", "--token-input-height": "36px" }
</script>

<template>
  <div :style="{ ...theme, maxWidth: '420px' }" class="w-full">
    <div class="mb-2 flex items-baseline justify-between">
      <span id="invite-label" class="text-[13px] leading-none font-medium">Invite to “Ski week”</span>
      <span class="text-[12px] text-muted-foreground tabular-nums">{{ people.length }} people</span>
    </div>
    <TokenInput :value="value" :disabled="false" :read-only="false" :required="false" token-deletion="whole" copy="codec" :controller="invites"
      @value-change="(next: Value) => (value = tokenize(next))">
      <template #token="{ token }">
        <TokenInputToken><span class="-ml-1 grid size-4 place-items-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground in-data-selected:bg-primary-foreground/20 in-data-selected:text-primary-foreground in-data-unresolved:bg-destructive/15 in-data-unresolved:text-destructive">{{ token.label.slice(0, 1).toUpperCase() }}</span>{{ token.label }}<TokenInputTokenRemove /></TokenInputToken>
      </template>
      <TokenInputEditor aria-labelledby="invite-label" placeholder="Add emails, separated by commas" />
    </TokenInput>
    <div style="gap: 6px" class="mt-3 flex min-h-7 flex-wrap items-center">
      <span v-if="left.length > 0" class="mr-0.5 text-[12px] text-muted-foreground">Suggested</span>
      <button v-for="email in left" :key="email" type="button" :data-suggest="email" @click="invites.insert(emailToken(email) as any, { at: 'end' })"
        class="inline-flex h-7 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[12px] leading-none font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] outline-none transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true" class="size-3"><path d="M8 3.5v9M3.5 8h9" /></svg>
        {{ email }}
      </button>
    </div>
    <p :class="'mt-2 text-[12px] ' + (typo ? 'text-destructive' : 'text-muted-foreground')">{{ typo ? "One address looks mistyped. Did you mean gmail.com?" : "Type an email and press space or comma." }}</p>
  </div>
</template>
