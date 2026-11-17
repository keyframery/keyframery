"use client"

export * from "@/components/primitives/questionnaire"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --questionnaire-face: Answer surface; default: bg-background.
   --questionnaire-accent: Progress and selection; default: bg-primary.
   --questionnaire-muted: Hints and progress; default: text-muted-foreground.
   --questionnaire-radius: Answer corners; default: rounded-[12px].
   --questionnaire-font: Answer size; default: text-[13px].
   --questionnaire-gap: Section spacing; default: gap-5.
   --questionnaire-inset-x: Answer padding; default: px-3.
*/

/* Styled questionnaire: the animated primitive plus the Keyframery look. A thin progress track over
   one question at a time; answers are cards holding Keyframery's radio or checkbox, with one
   primary ring gliding to the chosen card; actions are Keyframery buttons. */

import * as React from "react"

import { Button, ButtonArrow } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Radio } from "@/components/ui/radio"
import {
  Questionnaire as QuestionnaireRoot,
  QuestionnaireActions as QuestionnaireActionsPrimitive,
  QuestionnaireChoice as QuestionnaireChoicePrimitive,
  QuestionnaireChoices as QuestionnaireChoicesPrimitive,
  QuestionnaireDescription as QuestionnaireDescriptionPrimitive,
  QuestionnaireError as QuestionnaireErrorPrimitive,
  QuestionnaireInput as QuestionnaireInputPrimitive,
  QuestionnaireItem as QuestionnaireItemPrimitive,
  QuestionnaireItems as QuestionnaireItemsPrimitive,
  QuestionnaireNext as QuestionnaireNextPrimitive,
  QuestionnairePrevious as QuestionnairePreviousPrimitive,
  QuestionnaireProgress as QuestionnaireProgressPrimitive,
  QuestionnaireSkip as QuestionnaireSkipPrimitive,
  QuestionnaireSubmit as QuestionnaireSubmitPrimitive,
  QuestionnaireTitle as QuestionnaireTitlePrimitive,
} from "@/components/primitives/questionnaire"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Questionnaire({ speed, className, ...props }: React.ComponentProps<typeof QuestionnaireRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <QuestionnaireRoot className={withClass("flex w-full min-w-0 flex-col gap-[var(--questionnaire-gap,1.25rem)]", className)} {...props} />
    </Speed>
  )
}

/* The count over a thin track; the fill grows on a spring as you go. */
function QuestionnaireProgress({ className, ...props }: React.ComponentProps<typeof QuestionnaireProgressPrimitive>) {
  return (
    <QuestionnaireProgressPrimitive
      className={withClass(
        cn(
          "relative pb-3 text-[12px] leading-[1.2] font-medium text-[color:var(--questionnaire-muted,var(--muted-foreground))] tabular-nums",
          "before:absolute before:inset-x-0 before:bottom-0 before:h-[3px] before:rounded-full before:bg-muted before:content-['']",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-[var(--questionnaire-accent,var(--primary))] after:content-['']",
        ),
        className,
      )}
      {...props}
    />
  )
}

function QuestionnaireItems(props: React.ComponentProps<typeof QuestionnaireItemsPrimitive>) {
  return <QuestionnaireItemsPrimitive {...props} />
}

function QuestionnaireItem({ className, ...props }: React.ComponentProps<typeof QuestionnaireItemPrimitive>) {
  return <QuestionnaireItemPrimitive className={withClass("m-0 min-w-0 border-0 p-0 outline-none", className)} {...props} />
}

function QuestionnaireTitle({ className, ...props }: React.ComponentProps<typeof QuestionnaireTitlePrimitive>) {
  return (
    <QuestionnaireTitlePrimitive
      className={withClass("float-left mb-1 w-full p-0 text-[15px] leading-snug font-semibold tracking-tight text-pretty", className)}
      {...props}
    />
  )
}

function QuestionnaireDescription({ className, ...props }: React.ComponentProps<typeof QuestionnaireDescriptionPrimitive>) {
  return (
    <QuestionnaireDescriptionPrimitive
      className={withClass("clear-left text-[length:var(--questionnaire-font,13px)] leading-snug text-pretty text-[color:var(--questionnaire-muted,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

/* The cards, with one primary ring that glides to the chosen card. */
function QuestionnaireChoices({ className, groupClassName, ...props }: React.ComponentProps<typeof QuestionnaireChoicesPrimitive>) {
  return (
    <QuestionnaireChoicesPrimitive
      className={withClass("clear-left mt-4 min-w-0", className)}
      groupClassName={cn(
        "grid gap-2 outline-none [--kf-radio-pad:0px]",
        "before:z-10 before:rounded-[var(--questionnaire-radius,12px)] before:bg-transparent before:shadow-[0_0_0_1.5px_var(--questionnaire-accent,var(--primary))]",
        groupClassName,
      )}
      {...props}
    />
  )
}

/* A card: control, text, and a key when shortcuts are on. */
function QuestionnaireChoice({ className, ...props }: React.ComponentProps<typeof QuestionnaireChoicePrimitive>) {
  return (
    <QuestionnaireChoicePrimitive
      control={(state) =>
        state.type === "checkbox" ? (
          <Checkbox value={props.value} disabled={state.disabled} />
        ) : (
          <Radio value={props.value} disabled={state.disabled} className="data-checked:[anchor-name:none]" />
        )
      }
      className={withClass(
        cn(
          "relative flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--questionnaire-radius,12px)] bg-[var(--questionnaire-face,var(--background))] px-[var(--questionnaire-inset-x,0.75rem)] py-2.5 text-[length:var(--questionnaire-font,13px)] select-none",
          "shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-[var(--questionnaire-face,var(--card))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]",
          "transition-[box-shadow,background-color,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
          "hover:shadow-[0_0_0_1px_rgb(0_0_0/0.15),0_1px_2px_rgb(0_0_0/0.05)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.15)]",
          "data-checked:bg-[color-mix(in_oklab,var(--background),var(--foreground)_2.5%)] dark:data-checked:bg-accent/60",
          "data-[type=checkbox]:data-checked:shadow-[0_0_0_1.5px_var(--questionnaire-accent,var(--primary))]",
          "data-invalid:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_55%,transparent)]",
          "*:data-[slot=questionnaire-choice-label]:flex *:data-[slot=questionnaire-choice-label]:min-w-0 *:data-[slot=questionnaire-choice-label]:flex-1 *:data-[slot=questionnaire-choice-label]:flex-col *:data-[slot=questionnaire-choice-label]:gap-1 *:data-[slot=questionnaire-choice-label]:leading-snug",
          "*:data-[slot=questionnaire-choice-shortcut]:ms-auto *:data-[slot=questionnaire-choice-shortcut]:grid *:data-[slot=questionnaire-choice-shortcut]:size-5 *:data-[slot=questionnaire-choice-shortcut]:shrink-0 *:data-[slot=questionnaire-choice-shortcut]:place-items-center *:data-[slot=questionnaire-choice-shortcut]:rounded-[5px]",
          "*:data-[slot=questionnaire-choice-shortcut]:font-sans *:data-[slot=questionnaire-choice-shortcut]:text-[10.5px] *:data-[slot=questionnaire-choice-shortcut]:font-medium *:data-[slot=questionnaire-choice-shortcut]:text-[color:var(--questionnaire-muted,var(--muted-foreground))]",
          "*:data-[slot=questionnaire-choice-shortcut]:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_0_rgb(0_0_0/0.08)] dark:*:data-[slot=questionnaire-choice-shortcut]:shadow-[0_0_0_1px_rgb(255_255_255/0.12)]",
          "data-checked:*:data-[slot=questionnaire-choice-shortcut]:text-foreground",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Secondary text under a choice's label. */
function QuestionnaireChoiceDescription({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-[12px] text-[color:var(--questionnaire-muted,var(--muted-foreground))]", className)} {...props} />
}

/* A freeform answer, styled as Keyframery's input. Give it an `aria-label`. */
function QuestionnaireInput({ className, inputClassName, ...props }: React.ComponentProps<typeof QuestionnaireInputPrimitive>) {
  return (
    <QuestionnaireInputPrimitive
      className={cn("w-full min-w-0", className)}
      inputClassName={cn("h-11", inputClassName)}
      control={Input}
      {...props}
    />
  )
}

function QuestionnaireError({ className, ...props }: React.ComponentProps<typeof QuestionnaireErrorPrimitive>) {
  return <QuestionnaireErrorPrimitive className={withClass("mt-2.5 text-[12.5px] text-destructive", className)} {...props} />
}

function QuestionnaireActions({ className, ...props }: React.ComponentProps<typeof QuestionnaireActionsPrimitive>) {
  return (
    <QuestionnaireActionsPrimitive
      className={withClass("flex min-h-9 items-center justify-end gap-2 *:data-[slot=questionnaire-previous]:*:me-auto", className)}
      {...props}
    />
  )
}

type ActionProps = Omit<React.ComponentProps<typeof QuestionnaireNextPrimitive>, "children"> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size"> & { children?: React.ReactNode }

function QuestionnairePrevious({ children, variant = "ghost", size = "lg", buttonProps, ...props }: ActionProps) {
  return (
    <QuestionnairePreviousPrimitive {...props}>
      <Button type="button" variant={variant} size={size} {...buttonProps}>
        {children ?? "Back"}
      </Button>
    </QuestionnairePreviousPrimitive>
  )
}

function QuestionnaireSkip({ children, variant = "ghost", size = "lg", buttonProps, ...props }: ActionProps) {
  return (
    <QuestionnaireSkipPrimitive {...props}>
      <Button type="button" variant={variant} size={size} className="text-[color:var(--questionnaire-muted,var(--muted-foreground))]" {...buttonProps}>
        {children ?? "Skip"}
      </Button>
    </QuestionnaireSkipPrimitive>
  )
}

function QuestionnaireNext({ children, variant = "primary", size = "lg", buttonProps, ...props }: ActionProps) {
  return (
    <QuestionnaireNextPrimitive {...props}>
      <Button type="button" variant={variant} size={size} {...buttonProps}>
        {children ?? "Next"}
        <ButtonArrow />
      </Button>
    </QuestionnaireNextPrimitive>
  )
}

function QuestionnaireSubmit({ children, variant = "primary", size = "lg", buttonProps, ...props }: ActionProps) {
  return (
    <QuestionnaireSubmitPrimitive {...props}>
      <Button type="submit" variant={variant} size={size} {...buttonProps}>
        {children ?? "Submit"}
      </Button>
    </QuestionnaireSubmitPrimitive>
  )
}

export {
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
}
export type { QuestionnaireAnswer, QuestionnaireItemDefinition, QuestionnaireItemStatus, QuestionnaireValue } from "@/components/primitives/questionnaire"
