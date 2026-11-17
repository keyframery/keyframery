"use client"

/* Animated questionnaire, on UI SDK's core. UI SDK ships no questionnaire, so the behaviour is
   defined in `@/components/core/questionnaire` with `definePrimitive` and rendered here. The answer
   controls are UI SDK's radio group, checkbox group and input (through Keyframery's animated
   primitives), controlled from the questionnaire's state. This file adds motion only. Colours,
   radii, shadows and spacing stay yours.

   - Direction: put the items in `QuestionnaireItems` and the next question comes in from the right
     out of a blur while the one before leaves to the left; going back reverses it.
   - Cascade: the new question's title, description, answers and error rise in one after another.
   - Glide: one ring follows the chosen answer from row to row (the radio group's ring, anchored to
     the row).
   - Roll: the question number rolls; the progress fill grows on a spring.
   - Height and rise: an error opens under the answers. */

import type { StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/react/primitive"
import * as React from "react"

import { Button } from "@/components/primitives/button"
import { Checkbox, CheckboxGroup, CheckboxIndicator } from "@/components/primitives/checkbox"
import { Input } from "@/components/primitives/input"
import { Radio, RadioGroup, RadioIndicator } from "@/components/primitives/radio"
import { questionnaire, type QuestionnaireOptions } from "@/components/core/questionnaire"
import { cn } from "@/lib/utils"

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The instance, for the parts that render one of UI SDK's own controls and hand its changes back:
   the radio group's `onValueChange` calls the questionnaire's `answer`. Behaviour stays in core. */
const HandleContext = React.createContext<PrimitiveHandle<typeof questionnaire> | null>(null)
function useQuestionnaire() {
  const handle = React.use(HandleContext)
  if (!handle) throw new Error("Questionnaire parts must be inside <Questionnaire>.")
  return handle
}

const keyframes = "@keyframes kf-questionnaire-error{from{opacity:0;translate:0 -4px;filter:blur(3px)}}"

type RootProps = QuestionnaireOptions &
  Omit<PartProps<"form", StateOf<typeof questionnaire, "root">>, "defaultValue" | "onSubmit"> & {
    /** The native submit, after every item validated. Prefer `onComplete`, which gets the answers. */
    onSubmit?: React.FormEventHandler<HTMLFormElement>
  }

function Questionnaire({
  items,
  item,
  defaultItem,
  onItemChange,
  value,
  defaultValue,
  onValueChange,
  shortcuts,
  onComplete,
  ...props
}: RootProps) {
  const handle = usePrimitive(questionnaire, { items, item, defaultItem, onItemChange, value, defaultValue, onValueChange, shortcuts, onComplete })
  /* The questionnaire validates on its own; the browser's bubbles would only get in the way. */
  const root = usePart(handle, "root", {}, { noValidate: true, ...props }, "form")
  return (
    <HandleContext value={handle}>
      <style href="kf-questionnaire" precedence="default">
        {keyframes}
      </style>
      {root}
    </HandleContext>
  )
}

/* Roll: each digit is a column of 0 to 9 that slides to its value. */
function Roll({ value }: { value: number }) {
  return (
    <span className="inline-flex h-[1lh] overflow-hidden align-top tabular-nums">
      <span className="sr-only">{value}</span>
      {String(value)
        .split("")
        .map((digit, index) => (
          <span
            key={index}
            aria-hidden
            style={{ "--d": Number(digit) } as React.CSSProperties}
            className="flex flex-col [translate:0_calc(var(--d)*-1lh)] transition-[translate] duration-[calc(520ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none"
          >
            {Array.from({ length: 10 }, (_, d) => (
              <span key={d} className="h-[1lh]">
                {d}
              </span>
            ))}
          </span>
        ))}
    </span>
  )
}

/* "Question 2 of 3", the number rolling. A fill drawn with `after:` grows to the share done on a
   spring: give it `after:content-['']` and a surface. */
function QuestionnaireProgress({ className, children, ...props }: PartProps<"div", StateOf<typeof questionnaire, "progress">>) {
  return usePart(
    questionnaire,
    "progress",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "after:origin-left after:[scale:var(--questionnaire-progress,0)_1] rtl:after:origin-right",
          "after:transition-[scale] after:duration-[calc(620ms*var(--kf-speed,1))] after:ease-spring motion-reduce:after:transition-none",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <span className="inline-flex">
            Question&nbsp;<Roll value={state.current} />&nbsp;of {state.total}
          </span>
        )),
    },
    "div",
  )
}

/* Holds the items in one cell, so the question leaving and the one arriving overlap. */
function QuestionnaireItems({ className, ...props }: PartProps<"div">) {
  return usePart(questionnaire, "items", {}, { ...props, className: withClass("grid min-w-0 [&>*]:[grid-area:1/1]", className) }, "div")
}

/* Direction and Cascade. Outside QuestionnaireItems an inactive item is simply hidden. */
const itemMotion = cn(
  "min-w-0 not-data-active:hidden in-data-[slot=questionnaire-items]:not-data-active:block",
  "transition-[opacity,translate,filter,visibility] duration-[calc(480ms*var(--kf-speed,1))] ease-spring",
  "data-[position=after]:invisible data-[position=after]:translate-x-8 data-[position=after]:opacity-0 data-[position=after]:blur-[6px]",
  "data-[position=before]:invisible data-[position=before]:-translate-x-8 data-[position=before]:opacity-0 data-[position=before]:blur-[6px]",
  "not-data-active:duration-[calc(220ms*var(--kf-speed,1))] not-data-active:ease-house",
  "rtl:data-[position=after]:-translate-x-8 rtl:data-[position=before]:translate-x-8",
  /* Children rise in one after another on arrival, and leave together. */
  "*:transition-[opacity,translate,filter] *:duration-[calc(460ms*var(--kf-speed,1))] *:ease-spring",
  "data-active:*:[transition-delay:calc((min(sibling-index(),8)-1)*calc(45ms*var(--kf-speed,1))+calc(70ms*var(--kf-speed,1)))]",
  "not-data-active:*:translate-y-2 not-data-active:*:opacity-0 not-data-active:*:blur-[4px] not-data-active:*:duration-[calc(160ms*var(--kf-speed,1))]",
  "motion-reduce:transition-none! motion-reduce:*:transition-none!",
)

/* The item's name, for the parts inside it. The core declares those props as inherited from the
   item (`from: "item"`), but in this adapter version the inheritance didn't reach parts rendered
   with `usePart`, so the name is passed down explicitly. */
const ItemContext = React.createContext<string | undefined>(undefined)
function useItemName(part: string) {
  const name = React.use(ItemContext)
  if (name === undefined) throw new Error(`${part} must be inside <QuestionnaireItem>.`)
  return name
}

function QuestionnaireItem({
  name,
  className,
  ...props
}: { name: string } & Omit<PartProps<"fieldset", StateOf<typeof questionnaire, "item">>, "name">) {
  const item = usePart(questionnaire, "item", { name }, { ...props, className: withClass(itemMotion, className) }, "fieldset")
  return <ItemContext value={name}>{item}</ItemContext>
}

function QuestionnaireTitle(props: PartProps<"legend">) {
  return usePart(questionnaire, "title", { name: useItemName("QuestionnaireTitle") }, props, "legend")
}

function QuestionnaireDescription(props: PartProps<"p">) {
  return usePart(questionnaire, "description", { name: useItemName("QuestionnaireDescription") }, props, "p")
}

/* The answers: a radio group, or a checkbox group for a `multiple` item, controlled by the
   questionnaire. `groupClassName` styles the group (and its gliding ring). */
function QuestionnaireChoices({
  className,
  children,
  groupClassName,
  ...props
}: PartProps<"div", StateOf<typeof questionnaire, "choices">> & {
  /** Classes for the radio or checkbox group inside. */
  groupClassName?: string
}) {
  const handle = useQuestionnaire()
  const name = useItemName("QuestionnaireChoices")
  return usePart(
    questionnaire,
    "choices",
    { name },
    {
      ...props,
      className,
      children: (state) => {
        const content = typeof children === "function" ? children(state) : children
        return state.multiple ? (
          <CheckboxGroup
            name={state.name}
            aria-labelledby={state.labelledBy}
            aria-invalid={state.invalid || undefined}
            value={Array.isArray(state.value) ? state.value : []}
            onValueChange={(next, details) => handle.api.answer(state.name, next as string[], details.event)}
            className={groupClassName}
          >
            {content}
          </CheckboxGroup>
        ) : (
          <RadioGroup
            name={state.name}
            aria-labelledby={state.labelledBy}
            aria-invalid={state.invalid || undefined}
            value={typeof state.value === "string" ? state.value : null}
            onValueChange={(next, details) => handle.api.answer(state.name, (next as string | null) ?? "", details.event)}
            className={cn(
              /* Glide: the ring anchors to the chosen row rather than the radio. */
              "[&_[data-slot=questionnaire-choice][data-checked]]:[anchor-name:--kf-radio] [&_[data-slot=radio]]:data-checked:[anchor-name:none]",
              groupClassName,
            )}
          >
            {content}
          </RadioGroup>
        )
      },
    },
    "div",
  )
}

/* The radio or checkbox for the choice around it, with the motion of Keyframery's radio and
   checkbox primitives. Pass your own styled one as the choice's `control` instead. */
function QuestionnaireChoiceControl({ value, type }: { value: string; type: "radio" | "checkbox" }) {
  return type === "checkbox" ? (
    <Checkbox value={value}>
      <CheckboxIndicator />
    </Checkbox>
  ) : (
    <Radio value={value}>
      <RadioIndicator />
    </Radio>
  )
}

function QuestionnaireChoiceLabel(props: PartProps<"span">) {
  return usePart(questionnaire, "choice-label", {}, props, "span")
}

/* The choice's key, from `shortcuts`. Renders nothing for a choice without one. */
function QuestionnaireChoiceShortcut({
  value,
  className,
  children,
  ...props
}: { value: string } & Omit<PartProps<"kbd", StateOf<typeof questionnaire, "choice-shortcut">>, "value">) {
  return usePart(
    questionnaire,
    "choice-shortcut",
    { value, name: useItemName("QuestionnaireChoiceShortcut") },
    { ...props, className, children: children ?? ((state) => state.shortcut) },
    "kbd",
  )
}

/* A fixed answer: a label holding its control, its text and its key. Press: the row gives a little. */
function QuestionnaireChoice({
  value,
  control,
  className,
  children,
  ...props
}: { value: string; control?: (state: StateOf<typeof questionnaire, "choice">) => React.ReactNode } & Omit<
  PartProps<"label", StateOf<typeof questionnaire, "choice">>,
  "value"
>) {
  return usePart(
    questionnaire,
    "choice",
    { value, name: useItemName("QuestionnaireChoice") },
    {
      ...props,
      className: withClass(
        "transition-[scale] duration-[calc(240ms*var(--kf-speed,1))] ease-pop active:scale-[0.985] motion-reduce:transition-none!",
        className,
      ),
      children: (state) => (
        <>
          {control ? control(state) : <QuestionnaireChoiceControl value={value} type={state.type} />}
          <QuestionnaireChoiceLabel>{typeof children === "function" ? children(state) : children}</QuestionnaireChoiceLabel>
          <QuestionnaireChoiceShortcut value={value} />
        </>
      ),
    },
    "label",
  )
}

/* A freeform answer: UI SDK's input, controlled by the questionnaire. Typing replaces a chosen
   radio answer; choosing a radio clears the text. For single-answer items. */
function QuestionnaireInput({
  className,
  inputClassName,
  control: Control = Input,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "onValueChange" | "name" | "className"> & {
  className?: string
  /** Classes for the input inside. */
  inputClassName?: string
  /** The input component to render, such as a styled one. Defaults to UI SDK's input. */
  control?: React.ComponentType<React.ComponentProps<typeof Input>>
}) {
  const handle = useQuestionnaire()
  return usePart(
    questionnaire,
    "input",
    { name: useItemName("QuestionnaireInput") },
    {
      className,
      children: (state) => (
        <Control
          {...props}
          value={state.value}
          aria-invalid={state.invalid || undefined}
          onValueChange={(next, details) => handle.api.answer(state.name, next, details.event, "input-change")}
          className={inputClassName}
        />
      ),
    },
    "div",
  )
}

/* Shown while the item failed validation; it drops in from under the answers. */
function QuestionnaireError({ className, children, ...props }: PartProps<"p", StateOf<typeof questionnaire, "error">>) {
  return usePart(
    questionnaire,
    "error",
    { name: useItemName("QuestionnaireError") },
    {
      ...props,
      className: withClass(
        "animate-[kf-questionnaire-error_calc(380ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
        className,
      ),
      children: children ?? "Choose an answer to continue.",
    },
    "p",
  )
}

/* The row for the actions: layout only. */
function QuestionnaireActions(props: PartProps<"div">) {
  return usePart(questionnaire, "actions", {}, props, "div")
}

type ActionProps = PartProps<"span", StateOf<typeof questionnaire, "next">> & {
  /** Props for the button inside. */
  buttonProps?: React.ComponentProps<typeof Button>
}

/* Each action is a wrapper the questionnaire shows and hides, around a UI SDK button. The button
   keeps its own press; its click reaches the questionnaire as it bubbles. */
function action(slot: "previous" | "skip" | "next" | "submit", label: string) {
  return function QuestionnaireAction({ className, children, buttonProps, ...props }: ActionProps) {
    return usePart(
      questionnaire,
      slot,
      {},
      {
        ...props,
        className: withClass("contents data-hidden:hidden", className),
        children:
          typeof children === "function"
            ? children
            : (children ?? (
                <Button type={slot === "submit" ? "submit" : "button"} {...buttonProps}>
                  {label}
                </Button>
              )),
      },
      "span",
    )
  }
}

const QuestionnairePrevious = action("previous", "Previous")
const QuestionnaireSkip = action("skip", "Skip")
const QuestionnaireNext = action("next", "Next")
const QuestionnaireSubmit = action("submit", "Submit")

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceControl,
  QuestionnaireChoiceLabel,
  QuestionnaireChoiceShortcut,
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
}
export type {
  QuestionnaireAnswer,
  QuestionnaireItemDefinition,
  QuestionnaireItemStatus,
  QuestionnaireValue,
} from "@/components/core/questionnaire"
