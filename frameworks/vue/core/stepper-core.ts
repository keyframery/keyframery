/* A stepper, as a UI SDK primitive. UI SDK ships none, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   It owns the steps (as data, so every step's place and state is known before anything mounts), the
   current one, how far someone has got, and which way they last moved. Each step is complete,
   current, upcoming or error. Two uses:

   - A read-only progress strip (`interactive: false`): an order that is Placed, Paid, Packed. The
     steps are plain text; the current one carries `aria-current="step"`.
   - An interactive multi-step form: the steps are buttons with one tab stop and arrow keys between
     them (`createRovingFocus`). `linear` (the default) lets people go back to any step they have
     reached but forward only through `next`; without it, any step can be chosen. A step that can't be
     chosen yet is `aria-disabled`, and stays focusable so the arrows don't skip it.

   Follows the pattern UI SDK's patterns page gives for a stepper: a list of buttons with one tab
   stop, the current step marked `aria-current="step"`, no tab or radio roles. */

import { type ChangeDetails, createChange, createRovingFocus, definePrimitive } from "@ui-sdk/core"

type StepperStepState = "complete" | "current" | "upcoming" | "error"

/** One step. */
type StepperStep = {
  /** Unique, and what `value` holds while this step is current. */
  value: string
  /** The step's name: "Shipping". */
  label: string
  /** A line under the name. */
  description?: string
  /** Something on this step needs fixing. Shown as the error state wherever the step is. */
  error?: boolean
  /** Can't be chosen. */
  disabled?: boolean
}

/* "previous-press", "next-press" and "imperative" aren't in the shared vocabulary. */
type StepperValueChangeReason = "item-press" | "previous-press" | "next-press" | "imperative"

type StepperOptions = {
  /** The steps, in order. */
  steps?: readonly StepperStep[]
  /** The current step's value, controlled. */
  value?: string
  /** The current step at first, when uncontrolled. Defaults to the first step. */
  defaultValue?: string
  /** Runs when the current step wants to change. `details.cancel()` stays put, like a step that doesn't validate. */
  onValueChange?: (value: string, details: ChangeDetails<StepperValueChangeReason>) => void
  /** The steps that are done. Defaults to every step before the furthest one reached. Pass every value for a finished flow. */
  completed?: string[]
  /** Steps are buttons people can choose (the default). Off, the stepper is a read-only progress strip. */
  interactive?: boolean
  /** Forward only through `next`; back to any step already reached (the default). Off, any step can be chosen. */
  linear?: boolean
  /** "horizontal" (the default) or "vertical". */
  orientation?: "horizontal" | "vertical"
}

type StepperSummary = { value: string; label: string; state: StepperStepState }

type StepperState = {
  steps: readonly StepperStep[]
  value: string
  /** The furthest step reached, by index. */
  reached: number
  completed: string[] | undefined
  interactive: boolean
  linear: boolean
  orientation: "horizontal" | "vertical"
  /** Which way the last move went, for panels that arrive from that side. */
  direction: "forward" | "backward"
  /** The step with the tab stop. */
  focused: string | null
  /** Every step with its state, for agents and for anyone reading the state. */
  progress: StepperSummary[]
}

const indexOf = (state: Pick<StepperState, "steps">, value: string | null | undefined) =>
  state.steps.findIndex((step) => step.value === value)

/** A step's state: error wins, then current, then complete, else upcoming. */
function stepState(state: StepperState, value: string): StepperStepState {
  const index = indexOf(state, value)
  const step = state.steps[index]
  if (!step) return "upcoming"
  if (step.error) return "error"
  if (value === state.value) return "current"
  if (state.completed) return state.completed.includes(value) ? "complete" : "upcoming"
  return index < state.reached ? "complete" : "upcoming"
}

/** Whether someone can go to this step now. */
function reachable(state: StepperState, value: string) {
  const index = indexOf(state, value)
  const step = state.steps[index]
  if (!state.interactive || !step || step.disabled) return false
  if (!state.linear) return true
  return index <= state.reached || (state.completed?.includes(value) ?? false)
}

const progressOf = (state: StepperState): StepperSummary[] =>
  state.steps.map((step) => ({ value: step.value, label: step.label, state: stepState(state, step.value) }))

const stepper = definePrimitive({
  name: "stepper",
  options: {
    steps: "value",
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    completed: "list",
    interactive: "boolean",
    linear: "boolean",
    orientation: "string",
  },
  state: (options: StepperOptions): StepperState => {
    const steps = options.steps ?? []
    const value = options.value ?? options.defaultValue ?? steps[0]?.value ?? ""
    const base: StepperState = {
      steps,
      value,
      reached: Math.max(0, steps.findIndex((step) => step.value === value)),
      completed: options.completed,
      interactive: options.interactive ?? true,
      linear: options.linear ?? true,
      orientation: options.orientation ?? "horizontal",
      direction: "forward",
      focused: null,
      progress: [],
    }
    return { ...base, progress: progressOf(base) }
  },
  sync: (options) => ({
    steps: options.steps ?? [],
    completed: options.completed,
    interactive: options.interactive ?? true,
    linear: options.linear ?? true,
    orientation: options.orientation ?? "horizontal",
    ...(options.value === undefined ? {} : { value: options.value }),
  }),
  controlled: ["value", "progress"],
  api: (context) => {
    const { store } = context
    const change = createChange(context)

    /* However the value or the steps change (a click, a controlled parent, new data), keep how far
       someone got, which way they went and every step's state current. */
    let from = { value: store.get().value, steps: store.get().steps, completed: store.get().completed }
    context.onDestroy(
      store.subscribe(() => {
        const state = store.get()
        if (state.value === from.value && state.steps === from.steps && state.completed === from.completed) return
        const before = indexOf({ steps: from.steps }, from.value)
        const now = indexOf(state, state.value)
        from = { value: state.value, steps: state.steps, completed: state.completed }
        const next = { ...state, reached: Math.max(state.reached, now), direction: now < before ? ("backward" as const) : ("forward" as const) }
        store.set({ reached: next.reached, direction: next.direction, progress: progressOf(next) })
      }),
    )

    const roving = createRovingFocus(context, {
      slot: "step",
      key: "focused",
      orientation: () => store.get().orientation,
      preferred: (step) => step.key === store.get().value,
      claims: (state, step) => step.key === state.value,
    })

    const go = (value: string, reason: StepperValueChangeReason, event?: Event) => {
      const state = store.get()
      if (value === state.value || indexOf(state, value) < 0) return false
      return change("value", value, { reason, event })
    }

    return {
      roving,
      /** Goes to a step, by value or label, if it can be reached now. */
      goTo(step: string, event?: Event) {
        const state = store.get()
        const lower = step.trim().toLowerCase()
        const value = state.steps.find((entry) => entry.value === step || entry.label.toLowerCase() === lower)?.value ?? step
        if (!reachable(state, value)) return false
        return go(value, "item-press", event)
      },
      /** Goes on to the next step (in a linear stepper, the only way forward). */
      next(event?: Event) {
        const state = store.get()
        if (!state.interactive) return false
        const following = state.steps.slice(indexOf(state, state.value) + 1).find((step) => !step.disabled)
        return following ? go(following.value, "next-press", event) : false
      },
      /** Goes back to the step before. */
      previous(event?: Event) {
        const state = store.get()
        if (!state.interactive) return false
        const before = state.steps.slice(0, Math.max(0, indexOf(state, state.value))).reverse().find((step) => !step.disabled)
        return before ? go(before.value, "previous-press", event) : false
      },
      /** The steps, for agents to choose from. */
      items() {
        return store.get().steps.map((step) => ({ value: step.value, label: step.label }))
      },
      /** @internal */
      stateOf: (state: StepperState, value: string) => stepState(state, value),
      /** @internal */
      reachable: (state: StepperState, value: string) => reachable(state, value),
    }
  },
  slots: (slot) => ({
    root: slot<{}, { value: string; orientation: "horizontal" | "vertical"; direction: "forward" | "backward"; interactive: boolean }>({
      role: "group",
      state: (state) => ({ value: state.value, orientation: state.orientation, direction: state.direction, interactive: state.interactive }),
      attrs: (state) => ({
        "data-orientation": state.orientation,
        "data-direction": state.direction,
        "data-interactive": state.interactive ? "" : undefined,
      }),
    }),
    list: slot<{}, { orientation: "horizontal" | "vertical"; steps: readonly StepperStep[] }>({
      state: (state) => ({ orientation: state.orientation, steps: state.steps }),
      attrs: (state) => ({ "data-orientation": state.orientation }),
    }),
    /* One step's place in the list: indicator, text and the connector to the next step. */
    item: slot<{ value: string }, { state: StepperStepState; index: number; last: boolean; orientation: "horizontal" | "vertical" }>({
      props: { value: "string" },
      state: (state, part) => ({
        state: part.api.stateOf(state, part.key),
        index: indexOf(state, part.key),
        last: indexOf(state, part.key) === state.steps.length - 1,
        orientation: state.orientation,
      }),
      attrs: (state, part) => ({
        "data-state": part.api.stateOf(state, part.key),
        "data-orientation": state.orientation,
        "data-last": indexOf(state, part.key) === state.steps.length - 1 ? "" : undefined,
        "aria-current": !state.interactive && state.value === part.key ? "step" : undefined,
      }),
    }),
    /* The step itself: a button in an interactive stepper, plain text in a progress strip. */
    step: slot<{ value: string }, { state: StepperStepState; index: number; reachable: boolean; interactive: boolean }>({
      props: { value: "string" },
      role: (state) => (state.interactive ? "button" : "none"),
      roles: ["button", "none"],
      focus: (state) => (state.interactive ? "roving" : { none: "A read-only progress strip takes no focus." }),
      keys: (state) => (state.orientation === "vertical" ? ["ArrowUp", "ArrowDown", "Home", "End"] : ["ArrowLeft", "ArrowRight", "Home", "End"]),
      state: (state, part) => ({
        state: part.api.stateOf(state, part.key),
        index: indexOf(state, part.key),
        reachable: part.api.reachable(state, part.key),
        interactive: state.interactive,
      }),
      attrs: (state, part) => ({
        type: state.interactive ? "button" : undefined,
        tabindex: state.interactive ? part.api.roving.tabIndex(state, part) : undefined,
        "aria-current": state.interactive && state.value === part.key ? "step" : undefined,
        "aria-disabled": state.interactive && !part.api.reachable(state, part.key) ? "true" : undefined,
        "data-state": part.api.stateOf(state, part.key),
        "data-reachable": part.api.reachable(state, part.key) ? "" : undefined,
      }),
      press: ({ api, key }, event) => void api.goTo(key, event),
      on: {
        keydown: (event, { el, api, store }) => {
          if (el && store.get().interactive) api.roving.keydown(event as KeyboardEvent, el)
        },
      },
      bind: (el, part) => part.api.roving.bind(el, part),
    }),
    indicator: slot<{ value: string }, { state: StepperStepState; index: number }>({
      props: { value: { kind: "string", from: "item" } },
      state: (state, part) => ({ state: part.api.stateOf(state, part.key), index: indexOf(state, part.key) }),
      attrs: (state, part) => ({ "aria-hidden": "true", "data-state": part.api.stateOf(state, part.key) }),
    }),
    title: slot({}),
    description: slot({}),
    /* The line to the next step. `data-filled` once the next step is reached, so it can draw itself. */
    connector: slot<{ value: string }, { filled: boolean }>({
      props: { value: { kind: "string", from: "item" } },
      present: (state, part) => indexOf(state, part.key) < state.steps.length - 1,
      state: (state, part) => {
        const next = state.steps[indexOf(state, part.key) + 1]
        return { filled: !!next && ["complete", "current"].includes(part.api.stateOf(state, next.value)) }
      },
      attrs: (state, part) => {
        const next = state.steps[indexOf(state, part.key) + 1]
        const filled = !!next && ["complete", "current"].includes(part.api.stateOf(state, next.value))
        return { "aria-hidden": "true", "data-filled": filled ? "" : undefined, "data-orientation": state.orientation }
      },
    }),
    /* A step's content, shown while it is current. `data-direction` says which way the move went. */
    panel: slot<{ value: string }, { direction: "forward" | "backward" }>({
      props: { value: "string" },
      present: (state, part) => state.value === part.key,
      state: (state) => ({ direction: state.direction }),
      attrs: (state) => ({ "data-direction": state.direction, "data-orientation": state.orientation }),
    }),
  }),
  agent: { actions: ["goTo", "next", "previous"], closed: true, items: (api) => api.items() },
})

export { stepper, type StepperOptions, type StepperStep, type StepperStepState, type StepperSummary }
