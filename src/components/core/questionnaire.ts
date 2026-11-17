/* A questionnaire: one question at a time, as a UI SDK primitive. UI SDK ships none, so it is
   defined with its core: the same definition renders in React, Vue, Svelte, Solid and web components.

   It owns the ordered items, the active item, the answers, which items were skipped or failed
   validation, progress, and moving forward and back (buttons, arrow keys, Enter, Mod+Enter, and
   letter or number shortcuts for the answers). The answer controls themselves are UI SDK's radio
   group, checkbox group and input, composed by the renderer and controlled from this state: the
   group's `onValueChange` calls `answer` here. The root is a form; the last item submits it.

   Shape and keys follow shadcn's Questionnaire. Keys with no APG rule: Enter on a chosen answer
   goes on; ←/→ outside a radio or text field go back and on; Mod+Enter goes on from anywhere and
   submits on the last item. */

import { type ChangeDetails, createChange, css, definePrimitive, dispatch, idPart } from "@ui-sdk/core"

type QuestionnaireChoiceDefinition = string | { value: string; disabled?: boolean }

type QuestionnaireItemDefinition = {
  /** Unique; also the native form field name of its answers. */
  name: string
  /** Needs an answer to go on, and can't be skipped. */
  required?: boolean
  /** Answers with checkboxes instead of radios. */
  multiple?: boolean
  /** Left out of progress and navigation. */
  disabled?: boolean
  /** The choices' values in order, for shortcuts. */
  choices?: readonly QuestionnaireChoiceDefinition[]
}

/** A radio item's answer is a string (a choice's value or typed text); a multiple item's a list. */
type QuestionnaireAnswer = string | string[]
type QuestionnaireValue = Record<string, QuestionnaireAnswer>
type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped"

/* "next-press", "previous-press", "skip-press", "submit-press" and "validation" aren't in the shared vocabulary. */
type QuestionnaireItemChangeReason = "next-press" | "previous-press" | "skip-press" | "submit-press" | "keyboard" | "validation" | "imperative"
/* "shortcut-key" and "skip-press" aren't in the shared vocabulary. */
type QuestionnaireValueChangeReason = "item-press" | "input-change" | "shortcut-key" | "skip-press" | "imperative"

type QuestionnaireOptions = {
  /** The items, in order. Progress, navigation and shortcuts read them. */
  items?: readonly QuestionnaireItemDefinition[]
  /** The active item's name, to control it. */
  item?: string
  /** The item active at first. Defaults to the first enabled one. */
  defaultItem?: string
  onItemChange?: (item: string, details: ChangeDetails<QuestionnaireItemChangeReason>) => void
  /** The answers by item name, to control them. */
  value?: QuestionnaireValue
  /** The answers at first. */
  defaultValue?: QuestionnaireValue
  onValueChange?: (value: QuestionnaireValue, details: ChangeDetails<QuestionnaireValueChangeReason>) => void
  /** Gives each fixed choice a key: "letters" (A, B, C) or "numbers" (1, 2, 3). */
  shortcuts?: "letters" | "numbers"
  /** Called with the answers when the form submits after every item is valid. */
  onComplete?: (value: QuestionnaireValue, details: { reason: string; event?: Event }) => void
}

type QuestionnaireState = {
  items: readonly QuestionnaireItemDefinition[]
  item: string | null
  value: QuestionnaireValue
  skipped: string[]
  invalid: string[]
  shortcuts: "letters" | "numbers" | undefined
}

const enabledOf = (state: Pick<QuestionnaireState, "items">) => state.items.filter((item) => !item.disabled)
const definitionOf = (state: QuestionnaireState, name: string) => state.items.find((item) => item.name === name)
const activeOf = (state: QuestionnaireState) => state.item ?? enabledOf(state)[0]?.name ?? null
const filled = (answer: QuestionnaireAnswer | undefined) =>
  Array.isArray(answer) ? answer.length > 0 : typeof answer === "string" && answer.trim() !== ""
const statusOf = (state: QuestionnaireState, name: string): QuestionnaireItemStatus =>
  filled(state.value[name]) ? "answered" : state.skipped.includes(name) ? "skipped" : "unanswered"
const choiceValue = (choice: QuestionnaireChoiceDefinition) => (typeof choice === "string" ? choice : choice.value)
const choiceDisabled = (choice: QuestionnaireChoiceDefinition) => typeof choice !== "string" && !!choice.disabled

/* The key for a choice: its place among the item's enabled choices. */
function shortcutOf(state: QuestionnaireState, name: string, value: string) {
  if (!state.shortcuts) return undefined
  const choices = (definitionOf(state, name)?.choices ?? []).filter((choice) => !choiceDisabled(choice))
  const index = choices.findIndex((choice) => choiceValue(choice) === value)
  if (index < 0 || index > 25) return undefined
  return state.shortcuts === "numbers" ? (index < 9 ? String(index + 1) : undefined) : String.fromCharCode(65 + index)
}

const position = (state: QuestionnaireState, name: string) => {
  const enabled = enabledOf(state)
  const at = enabled.findIndex((item) => item.name === name)
  const active = enabled.findIndex((item) => item.name === activeOf(state))
  return at < active ? "before" : at === active ? "active" : "after"
}

const ids = (id: string, name: string) => ({
  title: `${id}-${idPart(name)}-title`,
  description: `${id}-${idPart(name)}-description`,
  error: `${id}-${idPart(name)}-error`,
})

type NameProps = { name: string }

const questionnaire = definePrimitive({
  name: "questionnaire",
  options: {
    items: "value",
    item: "string",
    defaultItem: "string",
    onItemChange: "callback",
    value: "value",
    defaultValue: "value",
    onValueChange: "callback",
    shortcuts: "string",
    onComplete: "callback",
  },
  controlled: ["item", "value"],
  state: (options: QuestionnaireOptions): QuestionnaireState => ({
    items: options.items ?? [],
    item: options.item ?? options.defaultItem ?? null,
    value: options.value ?? options.defaultValue ?? {},
    skipped: [],
    invalid: [],
    shortcuts: options.shortcuts,
  }),
  sync: (options) => ({
    items: options.items ?? [],
    shortcuts: options.shortcuts,
    ...(options.item === undefined ? {} : { item: options.item }),
    ...(options.value === undefined ? {} : { value: options.value }),
  }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)
    let focusTimer: ReturnType<typeof setTimeout> | undefined
    context.onDestroy(() => clearTimeout(focusTimer))

    const root = () => context.element("root") as HTMLFormElement | undefined
    const itemEl = (name: string) => context.element("item", name) as HTMLElement | undefined
    const focusInside = () => {
      const el = root()
      return !!el && (el.contains(document.activeElement) || document.activeElement === document.body)
    }
    /* After the attributes have moved (inert comes off the new item), so focus can land. */
    const later = (run: () => void) => {
      clearTimeout(focusTimer)
      focusTimer = setTimeout(run, 0)
    }
    const firstControl = (name: string) =>
      itemEl(name)?.querySelector<HTMLElement>(
        '[role=radio][tabindex="0"], [role=radio]:not([tabindex="-1"]), [role=checkbox], input:not([type=hidden]):not([aria-hidden=true]), textarea',
      )

    const setInvalid = (name: string, invalid: boolean) => {
      const list = store.get().invalid
      if (invalid === list.includes(name)) return
      store.set({ invalid: invalid ? [...list, name] : list.filter((n) => n !== name) })
    }
    const isValid = (name: string) => {
      const state = store.get()
      return !definitionOf(state, name)?.required || filled(state.value[name])
    }

    const goTo = (name: string, reason: QuestionnaireItemChangeReason, event?: Event) => {
      const had = focusInside()
      const moved = change("item", name, { reason, event })
      if (moved && had) later(() => itemEl(name)?.focus())
      return moved
    }
    const neighbour = (step: 1 | -1) => {
      const state = store.get()
      const enabled = enabledOf(state)
      const at = enabled.findIndex((item) => item.name === activeOf(state))
      return enabled[at + step]?.name
    }
    /* Shows the error on an item that can't go on and puts focus on its first answer. */
    const refuse = (name: string) => {
      setInvalid(name, true)
      later(() => firstControl(name)?.focus())
      return false
    }

    const api = {
      /** Moves to the next item, once the active one is answered or optional. */
      next(event?: Event, reason: QuestionnaireItemChangeReason = "next-press") {
        const name = activeOf(store.get())
        if (!name) return false
        if (!isValid(name)) return refuse(name)
        const to = neighbour(1)
        return to ? goTo(to, reason, event) : false
      },
      /** Moves back one item. */
      previous(event?: Event, reason: QuestionnaireItemChangeReason = "previous-press") {
        const to = neighbour(-1)
        return to ? goTo(to, reason, event) : false
      },
      /** Leaves an optional item unanswered on purpose, and moves on. */
      skip(event?: Event) {
        const state = store.get()
        const name = activeOf(state)
        if (!name || definitionOf(state, name)?.required) return false
        if (state.value[name] !== undefined) {
          const { [name]: _dropped, ...rest } = state.value
          change("value", rest, { reason: "skip-press", event })
        }
        if (!store.get().skipped.includes(name)) store.set({ skipped: [...store.get().skipped, name] })
        setInvalid(name, false)
        const to = neighbour(1)
        return to ? goTo(to, "skip-press", event) : true
      },
      /** Goes straight to an item. */
      goTo(name: string, event?: Event) {
        return goTo(name, "imperative", event)
      },
      /** Sets an item's answer. */
      answer(name: string, answer: QuestionnaireAnswer, event?: Event, reason: QuestionnaireValueChangeReason = "item-press") {
        const state = store.get()
        const next = { ...state.value, [name]: answer }
        const changed = change("value", next, { reason, event })
        if (filled(answer)) {
          setInvalid(name, false)
          if (store.get().skipped.includes(name)) store.set({ skipped: store.get().skipped.filter((n) => n !== name) })
        }
        return changed
      },
      /** Checks every item; the first that needs an answer becomes active and shows its error. */
      validate(event?: Event) {
        const state = store.get()
        const failing = enabledOf(state).filter((item) => !isValid(item.name)).map((item) => item.name)
        store.set({ invalid: failing })
        if (failing.length === 0) return true
        if (activeOf(store.get()) !== failing[0]) change("item", failing[0], { reason: "validation", event })
        later(() => firstControl(failing[0])?.focus())
        return false
      },
      /** Validates, then submits the form. */
      submit(event?: Event) {
        if (!api.validate(event)) return false
        root()?.requestSubmit()
        return true
      },
      /** The Submit button's press: stops the native submit while something needs an answer. */
      submitPress(event?: Event) {
        if (!api.validate(event)) event?.preventDefault()
      },
      /** The form's submit, after validation: reports the answers. */
      completed(event: Event) {
        if (!api.validate(event)) {
          event.preventDefault()
          return
        }
        dispatch(context, "onComplete", store.get().value, { reason: "submit", event })
      },
      /** The root's keys. A handler of the page's that prevents the event turns them off. */
      keydown(event: KeyboardEvent) {
        if (event.defaultPrevented || event.isComposing) return
        const state = store.get()
        const name = activeOf(state)
        if (!name) return
        const target = event.target as HTMLElement
        const role = target.getAttribute("role")
        const typing = target.matches('input:not([type=radio]):not([type=checkbox]):not([type=hidden]), textarea, [contenteditable="true"]')
        const last = !neighbour(1)
        const goOn = () => (last ? api.submit(event) : api.next(event, "keyboard"))

        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          goOn()
          return
        }
        if (typing) {
          if (event.key === "Enter") {
            event.preventDefault()
            if (filled((target as HTMLInputElement).value)) goOn()
          }
          return
        }
        if (event.key === "Enter" && (role === "radio" || role === "checkbox")) {
          event.preventDefault()
          if (statusOf(state, name) === "answered") goOn()
          else refuse(name)
          return
        }
        if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && role !== "radio") {
          const rtl = getComputedStyle(target).direction === "rtl"
          const back = (event.key === "ArrowLeft") !== rtl
          event.preventDefault()
          if (back) api.previous(event, "keyboard")
          else if (statusOf(state, name) !== "unanswered" || !definitionOf(state, name)?.required) api.next(event, "keyboard")
          return
        }
        if ((event.key === "ArrowDown" || event.key === "ArrowUp") && role === "checkbox") {
          const boxes = [...(itemEl(name)?.querySelectorAll<HTMLElement>("[role=checkbox]:not([data-disabled]), input:not([type=hidden])") ?? [])]
          const at = boxes.indexOf(target)
          const to = boxes[at + (event.key === "ArrowDown" ? 1 : -1)]
          if (to) {
            event.preventDefault()
            to.focus()
          }
          return
        }
        /* Answer shortcuts. */
        if (state.shortcuts && event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          const definition = definitionOf(state, name)
          const choices = (definition?.choices ?? []).filter((choice) => !choiceDisabled(choice))
          const key = event.key.toUpperCase()
          const index = state.shortcuts === "numbers" ? Number(key) - 1 : key.charCodeAt(0) - 65
          const choice = choices[index]
          if (!choice || Number.isNaN(index)) return
          event.preventDefault()
          const value = choiceValue(choice)
          if (definition?.multiple) {
            const current = (state.value[name] as string[] | undefined) ?? []
            api.answer(name, current.includes(value) ? current.filter((v) => v !== value) : [...current, value], event, "shortcut-key")
          } else api.answer(name, value, event, "shortcut-key")
          later(() => itemEl(name)?.querySelector<HTMLElement>(`[data-slot=questionnaire-choice][data-value="${CSS.escape(value)}"] [role=radio], [data-slot=questionnaire-choice][data-value="${CSS.escape(value)}"] [role=checkbox]`)?.focus())
        }
      },
      /** Each item's status: answered, skipped or unanswered. */
      statusOf: (state: QuestionnaireState, name: string) => statusOf(state, name),
      /** The active item's name. */
      active: (state: QuestionnaireState) => activeOf(state),
    }
    return api
  },
  slots: (slot) => {
    /* Shown only while it applies to the active item. */
    const action = (
      applies: (state: QuestionnaireState, last: boolean, first: boolean) => boolean,
      kind: "previous" | "skip" | "next" | "submit",
    ) =>
      slot<{}, { visible: boolean; status: QuestionnaireItemStatus }>({
        /* The part wraps a button: its click bubbles here, so keys and screen readers work too. */
        press: ({ api }, event) => {
          if (kind === "submit") api.submitPress(event)
          else void api[kind](event)
        },
        state: (state) => {
          const enabled = enabledOf(state)
          const name = activeOf(state)
          const at = enabled.findIndex((item) => item.name === name)
          return {
            visible: applies(state, at === enabled.length - 1, at <= 0),
            status: name ? statusOf(state, name) : "unanswered",
          }
        },
        attrs: (state) => {
          const enabled = enabledOf(state)
          const name = activeOf(state)
          const at = enabled.findIndex((item) => item.name === name)
          const visible = applies(state, at === enabled.length - 1, at <= 0)
          return {
            hidden: visible ? undefined : "",
            "data-visible": visible ? "" : undefined,
            "data-hidden": visible ? undefined : "",
            "data-status": name ? statusOf(state, name) : "unanswered",
          }
        },
      })

    return {
      root: slot<{}, { current: number; total: number; first: boolean; last: boolean }>({
        state: (state) => {
          const enabled = enabledOf(state)
          const at = enabled.findIndex((item) => item.name === activeOf(state))
          return { current: at + 1, total: enabled.length, first: at <= 0, last: at === enabled.length - 1 }
        },
        attrs: (state) => {
          const enabled = enabledOf(state)
          const at = enabled.findIndex((item) => item.name === activeOf(state))
          return {
            "data-current": String(at + 1),
            "data-total": String(enabled.length),
            "data-first": at <= 0 ? "" : undefined,
            "data-last": at === enabled.length - 1 ? "" : undefined,
            "data-shortcuts": state.shortcuts,
            "aria-keyshortcuts": "Control+Enter Meta+Enter",
          }
        },
        on: {
          keydown: (event, { api }) => api.keydown(event as KeyboardEvent),
          submit: (event, { api }) => api.completed(event),
        },
      }),
      progress: slot<{}, { current: number; total: number; answered: number; first: boolean; last: boolean }>({
        role: "progressbar",
        state: (state) => {
          const enabled = enabledOf(state)
          const at = enabled.findIndex((item) => item.name === activeOf(state))
          return {
            current: at + 1,
            total: enabled.length,
            answered: enabled.filter((item) => statusOf(state, item.name) !== "unanswered").length,
            first: at <= 0,
            last: at === enabled.length - 1,
          }
        },
        attrs: (state) => {
          const enabled = enabledOf(state)
          const at = enabled.findIndex((item) => item.name === activeOf(state))
          return {
            "aria-label": "Questionnaire progress",
            "aria-valuemin": "1",
            "aria-valuemax": String(enabled.length),
            "aria-valuenow": String(at + 1),
            "aria-valuetext": `Question ${at + 1} of ${enabled.length}`,
            "data-current": String(at + 1),
            "data-total": String(enabled.length),
            style: css({ "--questionnaire-progress": enabled.length ? (at + 1) / enabled.length : 0 }),
          }
        },
      }),
      item: slot<NameProps, { active: boolean; status: QuestionnaireItemStatus; invalid: boolean; position: "before" | "active" | "after" }>({
        props: { name: "string" },
        state: (state, part) => ({
          active: activeOf(state) === part.props.name,
          status: statusOf(state, part.props.name),
          invalid: state.invalid.includes(part.props.name),
          position: position(state, part.props.name),
        }),
        attrs: (state, part) => {
          const definition = definitionOf(state, part.props.name)
          const active = activeOf(state) === part.props.name
          const invalid = state.invalid.includes(part.props.name)
          const id = ids(part.id, part.props.name)
          return {
            tabindex: "-1",
            inert: active ? undefined : "true",
            "aria-hidden": active ? undefined : "true",
            "aria-describedby": [id.description, invalid ? id.error : ""].filter(Boolean).join(" "),
            "aria-invalid": invalid ? "true" : undefined,
            "data-active": active ? "" : undefined,
            "data-position": position(state, part.props.name),
            "data-status": statusOf(state, part.props.name),
            "data-required": definition?.required ? "" : undefined,
            "data-multiple": definition?.multiple ? "" : undefined,
            "data-disabled": definition?.disabled ? "" : undefined,
            "data-invalid": invalid ? "" : undefined,
          }
        },
      }),
      /* Optional: holds the items so the one leaving and the one arriving overlap. */
      items: slot({}),
      /* A row for Previous, Skip, Next and Submit. */
      actions: slot({}),
      title: slot<NameProps>({
        props: { name: { kind: "string", from: "item", required: true } },
        attrs: (_state, part) => ({ id: ids(part.id, part.props.name).title }),
      }),
      description: slot<NameProps>({
        props: { name: { kind: "string", from: "item", required: true } },
        attrs: (_state, part) => ({ id: ids(part.id, part.props.name).description }),
      }),
      choices: slot<NameProps, { name: string; value: QuestionnaireAnswer | undefined; multiple: boolean; invalid: boolean; required: boolean; labelledBy: string }>({
        props: { name: { kind: "string", from: "item", required: true } },
        state: (state, part) => ({
          name: part.props.name,
          value: state.value[part.props.name],
          multiple: !!definitionOf(state, part.props.name)?.multiple,
          invalid: state.invalid.includes(part.props.name),
          required: !!definitionOf(state, part.props.name)?.required,
          labelledBy: ids(part.id, part.props.name).title,
        }),
        attrs: (state) => ({ "data-shortcuts": state.shortcuts }),
      }),
      choice: slot<{ value: string; name: string }, { checked: boolean; type: "radio" | "checkbox"; shortcut: string | undefined; invalid: boolean; disabled: boolean }>({
        props: { value: "string", name: { kind: "string", from: "item", required: true } },
        state: (state, part) => {
          const answer = state.value[part.props.name]
          const definition = definitionOf(state, part.props.name)
          return {
            checked: Array.isArray(answer) ? answer.includes(part.key) : answer === part.key,
            type: definition?.multiple ? "checkbox" : "radio",
            shortcut: shortcutOf(state, part.props.name, part.key),
            invalid: state.invalid.includes(part.props.name),
            disabled: !!definition?.choices?.some((choice) => choiceValue(choice) === part.key && choiceDisabled(choice)),
          }
        },
        attrs: (state, part) => {
          const answer = state.value[part.props.name]
          const checked = Array.isArray(answer) ? answer.includes(part.key) : answer === part.key
          const shortcut = shortcutOf(state, part.props.name, part.key)
          return {
            "data-value": part.key,
            "data-type": definitionOf(state, part.props.name)?.multiple ? "checkbox" : "radio",
            "data-checked": checked ? "" : undefined,
            "data-unchecked": checked ? undefined : "",
            "data-invalid": state.invalid.includes(part.props.name) ? "" : undefined,
            "data-shortcut": shortcut,
            "aria-keyshortcuts": shortcut,
          }
        },
      }),
      "choice-label": slot({}),
      "choice-shortcut": slot<{ value: string; name: string }, { shortcut: string | undefined }>({
        props: { value: { kind: "string", from: "choice", required: true }, name: { kind: "string", from: "item", required: true } },
        present: (state, part) => !!shortcutOf(state, part.props.name, part.props.value),
        state: (state, part) => ({ shortcut: shortcutOf(state, part.props.name, part.props.value) }),
        attrs: () => ({ "aria-hidden": "true" }),
      }),
      input: slot<NameProps, { name: string; value: string; filled: boolean; invalid: boolean }>({
        props: { name: { kind: "string", from: "item", required: true } },
        state: (state, part) => {
          const answer = state.value[part.props.name]
          const text = typeof answer === "string" && !(definitionOf(state, part.props.name)?.choices ?? []).some((c) => choiceValue(c) === answer) ? answer : ""
          return { name: part.props.name, value: text, filled: text.trim() !== "", invalid: state.invalid.includes(part.props.name) }
        },
        attrs: (state, part) => {
          const answer = state.value[part.props.name]
          const text = typeof answer === "string" && !(definitionOf(state, part.props.name)?.choices ?? []).some((c) => choiceValue(c) === answer) ? answer : ""
          return {
            "data-filled": text.trim() ? "" : undefined,
            "data-empty": text.trim() ? undefined : "",
            "data-invalid": state.invalid.includes(part.props.name) ? "" : undefined,
          }
        },
      }),
      error: slot<NameProps, { invalid: boolean }>({
        props: { name: { kind: "string", from: "item", required: true } },
        present: (state, part) => state.invalid.includes(part.props.name),
        state: (state, part) => ({ invalid: state.invalid.includes(part.props.name) }),
        attrs: (_state, part) => ({ id: ids(part.id, part.props.name).error, "aria-live": "polite", "data-invalid": "" }),
      }),
      previous: action((_state, _last, first) => !first, "previous"),
      skip: action(
        (state) => {
          const name = activeOf(state)
          return !!name && !definitionOf(state, name)?.required
        },
        "skip",
      ),
      next: action((_state, last) => !last, "next"),
      submit: action((_state, last) => last, "submit"),
    }
  },
  agent: { actions: ["answer", "next", "previous", "skip", "goTo", "submit"] },
})

export {
  questionnaire,
  type QuestionnaireAnswer,
  type QuestionnaireChoiceDefinition,
  type QuestionnaireItemChangeReason,
  type QuestionnaireItemDefinition,
  type QuestionnaireItemStatus,
  type QuestionnaireOptions,
  type QuestionnaireValue,
  type QuestionnaireValueChangeReason,
}
