import * as React from "react"

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
} from "@/components/ui/questionnaire"

export const meta = { name: "Questionnaire", group: "Forms" }

/* Book a service: pick the work, add a clean, try to go on without a day (the error drops in),
   pick one, book, then start over. */
export const play = [
  { click: '[data-slot="questionnaire-choice"][data-value="tuneup"]', wait: 1100 },
  { click: '[data-slot="questionnaire-choice"][data-value="brakes"]', wait: 1100 },
  { click: '[data-slot="questionnaire-next"] button', wait: 1300 },
  { click: '[data-slot="questionnaire-choice"][data-value="wash"]', wait: 900 },
  { click: '[data-slot="questionnaire-next"] button', wait: 1300 },
  { click: '[data-slot="questionnaire-submit"] button', wait: 1300 },
  { click: '[data-slot="questionnaire-choice"][data-value="wed"]', wait: 1000 },
  { click: '[data-slot="questionnaire-submit"] button', wait: 2200 },
  { click: '[data-action="again"]', wait: 1200 },
]

export const controls = {
  shortcuts: { type: "select", label: "Shortcuts", options: ["letters", "numbers", "none"], default: "letters" },
  extrasRequired: { type: "switch", label: "Extras required", default: false },
  defaultItem: { type: "select", label: "Start at", options: ["work", "extras", "dropoff"], default: "work" },
  themeFace: { type: "color", label: "Answer surface", default: "", group: "Colours" },
  themeAccent: { type: "color", label: "Progress and selection", default: "", group: "Colours" },
  themeMuted: { type: "color", label: "Hints and progress", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Answer corners", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Answer size", min: 10, max: 18, step: 1, default: 13, unit: "px", group: "Layout" },
  themeGap: { type: "slider", label: "Section spacing", min: 8, max: 32, step: 1, default: 20, unit: "px", group: "Layout" },
  themeInsetX: { type: "slider", label: "Answer padding", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
} as const

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

const label = (all: { value: string; label: string }[], value: QuestionnaireValue[string] | undefined) =>
  [value ?? []].flat().map((v) => all.find((a) => a.value === v)?.label ?? v)

export default function QuestionnaireDemo({
  shortcuts = "letters",
  extrasRequired = false,
  defaultItem = "work",
  themeFace = "",
  themeAccent = "",
  themeMuted = "",
  themeRadius = 12,
  themeFont = 13,
  themeGap = 20,
  themeInsetX = 12,
}: {
  shortcuts?: "letters" | "numbers" | "none"
  extrasRequired?: boolean
  defaultItem?: "work" | "extras" | "dropoff"
  themeFace?: string
  themeAccent?: string
  themeMuted?: string
  themeRadius?: number
  themeFont?: number
  themeGap?: number
  themeInsetX?: number
}) {
  const items = React.useMemo(
    () => [
      { name: "work", required: true, choices: work.map((c) => c.value) },
      { name: "extras", multiple: true, required: extrasRequired, choices: extras.map((c) => c.value) },
      { name: "dropoff", required: true, choices: days.map((c) => c.value) },
    ],
    [extrasRequired],
  )
  const [booked, setBooked] = React.useState<QuestionnaireValue | null>(null)
  const [run, setRun] = React.useState(0)

  /* Leave defaults unset so each part keeps its own theme and size fallback. */
  const theme = {
    ...(themeFace ? { "--questionnaire-face": themeFace } : null),
    ...(themeAccent ? { "--questionnaire-accent": themeAccent } : null),
    ...(themeMuted ? { "--questionnaire-muted": themeMuted } : null),
    ...(themeRadius !== 12 ? { "--questionnaire-radius": `${themeRadius}px` } : null),
    ...(themeFont !== 13 ? { "--questionnaire-font": `${themeFont}px` } : null),
    ...(themeGap !== 20 ? { "--questionnaire-gap": `${themeGap}px` } : null),
    ...(themeInsetX !== 12 ? { "--questionnaire-inset-x": `${themeInsetX}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="@container w-full max-w-[440px] rounded-[18px] bg-background p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.06),0_16px_40px_-16px_rgb(0_0_0/0.16)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)] @max-[24rem]:p-4">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="text-[13px] font-semibold tracking-tight">Book a service</div>
        <div className="text-[12px] text-muted-foreground">Spoke &amp; Chain, Hackney</div>
      </div>

      {booked ? (
        <div className="flex min-h-[318px] flex-col items-start justify-center gap-3 animate-[kf-questionnaire-error_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none">
          <span className="grid size-9 place-items-center rounded-full bg-[oklch(0.62_0.16_150/0.12)] text-[oklch(0.62_0.16_150)]">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
              <path d="M3.5 8.5 6.5 11.5 12.5 4.75" />
            </svg>
          </span>
          <div className="text-[15px] font-semibold tracking-tight">Booked for {label(days, booked.dropoff)[0]}</div>
          <p className="text-[13px] text-muted-foreground">
            {[...label(work, booked.work), ...label(extras, booked.extras)].join(", ")}. We'll text you when it's ready.
          </p>
          <button
            type="button"
            data-action="again"
            onClick={() => {
              setBooked(null)
              setRun((r) => r + 1)
            }}
            className="mt-1 inline-flex h-8 items-center rounded-[9px] px-3 text-[13px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            Book another bike
          </button>
        </div>
      ) : (
        <Questionnaire
          key={`${run}-${defaultItem}`}
          aria-label="Book a service"
          items={items}
          defaultItem={defaultItem}
          shortcuts={shortcuts === "none" ? undefined : shortcuts}
          onComplete={(value) => setBooked(value)}
          onSubmit={(e) => e.preventDefault()}
        >
          <QuestionnaireProgress />
          <QuestionnaireItems>
            <QuestionnaireItem name="work">
              <QuestionnaireTitle>What does the bike need?</QuestionnaireTitle>
              <QuestionnaireDescription>Pick one, or tell us what's wrong.</QuestionnaireDescription>
              <QuestionnaireChoices>
                {work.map((c) => (
                  <QuestionnaireChoice key={c.value} value={c.value}>
                    <span className="font-medium">{c.label}</span>
                    <QuestionnaireChoiceDescription>{c.hint}</QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
                <QuestionnaireInput aria-label="Something else" placeholder="Something else, like a wobbly back wheel" />
              </QuestionnaireChoices>
              <QuestionnaireError>Pick the work, or describe it.</QuestionnaireError>
            </QuestionnaireItem>

            <QuestionnaireItem name="extras">
              <QuestionnaireTitle>Anything else while it's in?</QuestionnaireTitle>
              <QuestionnaireDescription>{extrasRequired ? "Choose at least one." : "Choose any, or skip."}</QuestionnaireDescription>
              <QuestionnaireChoices>
                {extras.map((c) => (
                  <QuestionnaireChoice key={c.value} value={c.value}>
                    <span className="font-medium">{c.label}</span>
                    <QuestionnaireChoiceDescription>{c.hint}</QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>Choose at least one extra.</QuestionnaireError>
            </QuestionnaireItem>

            <QuestionnaireItem name="dropoff">
              <QuestionnaireTitle>When can you drop it off?</QuestionnaireTitle>
              <QuestionnaireDescription>We open at 8:00. Most jobs take two days.</QuestionnaireDescription>
              <QuestionnaireChoices>
                {days.map((c) => (
                  <QuestionnaireChoice key={c.value} value={c.value}>
                    <span className="font-medium">{c.label}</span>
                    <QuestionnaireChoiceDescription>{c.hint}</QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
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
      )}
    </div>
  )
}
