<script setup lang="ts">
/* Mirrors src/demos/questionnaire.tsx (default controls). */
import { ref } from "vue"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireItems,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
  type QuestionnaireValue,
} from "@/components/keyframery/questionnaire"

const work = [
  { value: "tuneup", label: "Full tune-up", hint: "Gears, brakes and bearings · £65" },
  { value: "brakes", label: "Brakes only", hint: "New pads and a bleed · £30" },
  { value: "puncture", label: "Puncture", hint: "New tube, fitted · £15" },
]
const extras = [
  { value: "chain", label: "New chain", hint: "£24" },
  { value: "tape", label: "Fresh bar tape", hint: "£18" },
  { value: "wash", label: "Drivetrain clean", hint: "£12" },
]
const days = [
  { value: "tue", label: "Tuesday 18 March", hint: "Ready Thursday" },
  { value: "wed", label: "Wednesday 19 March", hint: "Ready Friday" },
  { value: "thu", label: "Thursday 20 March", hint: "Ready Saturday morning" },
]
const extrasRequired = false
const items = [
  { name: "work", required: true, choices: work.map((c) => c.value) },
  { name: "extras", multiple: true, required: extrasRequired, choices: extras.map((c) => c.value) },
  { name: "dropoff", required: true, choices: days.map((c) => c.value) },
]
const label = (all: { value: string; label: string }[], value: QuestionnaireValue[string] | undefined) =>
  [value ?? []].flat().map((v) => all.find((a) => a.value === v)?.label ?? v)
const booked = ref<QuestionnaireValue | null>(null)
const run = ref(0)
</script>

<template>
  <div data-demo="questionnaire" class="@container w-full max-w-[440px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.06),0_16px_40px_-16px_rgb(0_0_0/0.16)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)] @max-[24rem]:p-4">
    <div class="mb-4 flex items-baseline justify-between gap-3">
      <div class="text-[13px] font-semibold tracking-tight">Book a service</div>
      <div class="text-[12px] text-muted-foreground">Spoke &amp; Chain, Hackney</div>
    </div>

    <div v-if="booked" class="flex min-h-[318px] flex-col items-start justify-center gap-3 animate-[kf-questionnaire-error_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none">
      <span class="grid size-9 place-items-center rounded-full bg-[oklch(0.62_0.16_150/0.12)] text-[oklch(0.62_0.16_150)]">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.75" /></svg>
      </span>
      <div class="text-[15px] font-semibold tracking-tight">Booked for {{ label(days, booked.dropoff)[0] }}</div>
      <p class="text-[13px] text-muted-foreground">{{ [...label(work, booked.work), ...label(extras, booked.extras)].join(", ") }}. We'll text you when it's ready.</p>
      <button
        type="button"
        data-action="again"
        class="mt-1 inline-flex h-8 items-center rounded-[9px] px-3 text-[13px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        @click="booked = null; run++"
      >
        Book another bike
      </button>
    </div>
    <Questionnaire
      v-else
      :key="`${run}-work`"
      aria-label="Book a service"
      :items="items"
      default-item="work"
      shortcuts="letters"
      @complete="(value) => (booked = value)"
      @submit="(e: Event) => e.preventDefault()"
    >
      <QuestionnaireProgress />
      <QuestionnaireItems>
        <QuestionnaireItem name="work">
          <QuestionnaireTitle>What does the bike need?</QuestionnaireTitle>
          <QuestionnaireDescription>Pick one, or tell us what's wrong.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice v-for="c in work" :key="c.value" :value="c.value">
              <span class="font-medium">{{ c.label }}</span>
              <QuestionnaireChoiceDescription>{{ c.hint }}</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireInput aria-label="Something else" placeholder="Something else, like a wobbly back wheel" />
          </QuestionnaireChoices>
          <QuestionnaireError>Pick the work, or describe it.</QuestionnaireError>
        </QuestionnaireItem>

        <QuestionnaireItem name="extras">
          <QuestionnaireTitle>Anything else while it's in?</QuestionnaireTitle>
          <QuestionnaireDescription>{{ extrasRequired ? "Choose at least one." : "Choose any, or skip." }}</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice v-for="c in extras" :key="c.value" :value="c.value">
              <span class="font-medium">{{ c.label }}</span>
              <QuestionnaireChoiceDescription>{{ c.hint }}</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>Choose at least one extra.</QuestionnaireError>
        </QuestionnaireItem>

        <QuestionnaireItem name="dropoff">
          <QuestionnaireTitle>When can you drop it off?</QuestionnaireTitle>
          <QuestionnaireDescription>We open at 8:00. Most jobs take two days.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice v-for="c in days" :key="c.value" :value="c.value">
              <span class="font-medium">{{ c.label }}</span>
              <QuestionnaireChoiceDescription>{{ c.hint }}</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>Pick a day to drop it off.</QuestionnaireError>
        </QuestionnaireItem>
      </QuestionnaireItems>

      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Book it</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  </div>
</template>
