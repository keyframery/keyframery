"use client"

/* Animated description list, on UI SDK's core. UI SDK ships none, so the behaviour is defined in
   `@/components/core/description-list` with `definePrimitive` and rendered here: a `dl` of items,
   each a `dt` and a `dd`. This file adds motion only. Colours, borders and spacing stay yours.

   - Cascade: items arrive one after another when the list first shows (40ms apart, up to twelve).
   - Press: the copy button sinks and springs back.
   - Draw: copied, the copy icon shrinks into a blur and a check pops in and draws itself; two seconds
     later they swap back.
   The cascade, the press, the icon's shrink and blur and the check's drawing scale with --kf-flourish;
   at 0 the items are simply there and the icons cross-fade. */

import type { StateOf } from "@ui-sdk/core"
import { createParts, type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { descriptionList, descriptionListCopy, type DescriptionListCopyOptions } from "@/components/core/description-list"
import { cn } from "@/lib/utils"

const {
  Root: DescriptionListRoot,
  Item: DescriptionListItemPart,
  Term: DescriptionListTerm,
  Details: DescriptionListDetails,
  Value: DescriptionListValue,
  Actions: DescriptionListActions,
} = createParts(descriptionList, { root: "dl", item: "div", term: "dt", details: "dd", value: "span", actions: "span" })

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Keyframes with a backwards fill, so an item is hidden on its first frame and the delay never slows
   a later change. */
const keyframes =
  "@keyframes kf-dl-in{from{opacity:0;translate:0 6px;filter:blur(4px)}}" +
  "@keyframes kf-dl-tick{from{stroke-dashoffset:1}}" +
  Array.from({ length: 12 }, (_, i) => `[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(${i + 1}){--kf-dl:${i}}`).join("") +
  "[data-slot=description-list]>[data-slot=description-list-item]:nth-of-type(n+13){--kf-dl:12}"

function DescriptionList({ className, ...props }: React.ComponentProps<typeof DescriptionListRoot>) {
  return (
    <>
      <style href="kf-description-list" precedence="default">
        {keyframes}
      </style>
      <DescriptionListRoot className={className} {...props} />
    </>
  )
}

/* Cascade: each item rises in after the one before it. */
function DescriptionListItem({ className, ...props }: React.ComponentProps<typeof DescriptionListItemPart>) {
  return (
    <DescriptionListItemPart
      className={withClass(
        "animate-[kf-dl-in_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] [animation-delay:calc((var(--kf-dl,0)*40ms+40ms)*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <rect x="5.25" y="5.25" width="8" height="8" rx="2" />
      <path d="M10.75 5.25V4.5a1.75 1.75 0 0 0-1.75-1.75H4.5A1.75 1.75 0 0 0 2.75 4.5V9c0 .97.78 1.75 1.75 1.75h.75" />
    </svg>
  )
}

const swapIn = "transition-[opacity,scale,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!"
const swapOut = "transition-[opacity,scale,filter] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"

/* Copies one value: the `value` you give it, or the value it sits beside. With no children it shows a
   copy icon that turns into a drawn check once copied. */
function DescriptionListCopy({
  value,
  label,
  onCopy,
  className,
  children,
  ...props
}: DescriptionListCopyOptions & PartProps<"button", StateOf<typeof descriptionListCopy, "root">>) {
  const handle = usePrimitive(descriptionListCopy, { value, label, onCopy })
  return usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: withClass(
        "relative transition-[scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] active:duration-[calc(90ms*var(--kf-speed,1))] motion-reduce:transition-none!",
        className,
      ),
      children:
        children ??
        ((state) => (
          <span className="grid place-items-center *:[grid-area:1/1]">
            <CopyIcon className={cn("size-3.5", state.copied ? cn(swapOut, "scale-[calc(1-0.5*var(--kf-flourish,1))] opacity-0 blur-[calc(3px*var(--kf-flourish,1))]") : swapIn)} />
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={cn("size-3.5", state.copied ? swapIn : cn(swapOut, "scale-[calc(1-0.4*var(--kf-flourish,1))] opacity-0"))}
            >
              {state.copied && (
                <path
                  d="M3.5 8.5 6.5 11.5 12.5 4.75"
                  pathLength={1}
                  className="[stroke-dasharray:1] animate-[kf-dl-tick_calc(300ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
                />
              )}
            </svg>
          </span>
        )),
    },
    "button",
  )
}

export {
  DescriptionList,
  DescriptionListActions,
  DescriptionListCopy,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListValue,
}
