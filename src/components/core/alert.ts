/* Alert, as a UI SDK primitive. UI SDK ships no alert, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   An alert is a callout with an icon, a title and a description (shadcn's parts). It is
   `role="alert"`, named by its title and described by its description when they are there.
   It arrives with an entrance (`data-starting-style` for its first frame, from `animateIn`), and
   when `open` turns false it plays its exit (`data-ending-style`, from `animateOut`) before it
   leaves the page. `AlertClose` dismisses it. */

import { animateIn, animateOut, createChange, definePrimitive } from "@ui-sdk/core"

type AlertVariant = "default" | "destructive"

type AlertOptions = {
  /** How it reads: `"default"` for information, `"destructive"` for a problem. @defaultValue "default" */
  variant?: AlertVariant
  /** Whether the alert is shown. Set it to control the alert yourself. */
  open?: boolean
  /** Whether the alert starts shown, when you don't control it. @defaultValue true */
  defaultOpen?: boolean
  /** Runs when the alert is dismissed, with `details.reason` `"close-press"`. */
  onOpenChange?: (open: boolean, details: import("@ui-sdk/core").ChangeDetails<"close-press">) => void
}

type AlertState = {
  variant: AlertVariant
  open: boolean
  /** True while the alert is in the page: from when it opens until its exit has played. */
  shown: boolean
  hasTitle: boolean
  hasDescription: boolean
}

const alert = definePrimitive({
  name: "alert",
  options: { variant: "string", open: "boolean", defaultOpen: "boolean", onOpenChange: "callback" },
  controlled: ["open"],
  state: (options: AlertOptions): AlertState => ({
    variant: options.variant ?? "default",
    open: options.open ?? options.defaultOpen ?? true,
    shown: options.open ?? options.defaultOpen ?? true,
    hasTitle: false,
    hasDescription: false,
  }),
  sync: (options) => ({
    variant: options.variant ?? "default",
    ...(options.open === undefined ? {} : { open: options.open }),
  }),
  api: (context) => {
    const change = createChange(context)
    return {
      /** Dismisses the alert: it plays its exit, then leaves the page. */
      dismiss(event?: MouseEvent | KeyboardEvent) {
        change("open", false, { reason: "close-press", event })
      },
      /** Shows the alert again after it was dismissed. */
      show() {
        context.store.set({ open: true })
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { variant: AlertVariant; open: boolean }>({
      role: "alert",
      /* `shown` only turns false once the exit has played, so closing never removes it early,
         whichever way `open` changes (a press, or the app's own state). */
      present: (state) => state.open || state.shown,
      state: (state) => ({ variant: state.variant, open: state.open }),
      attrs: (state, part) => ({
        "data-variant": state.variant,
        "aria-labelledby": state.hasTitle ? `${part.id}-title` : undefined,
        "aria-describedby": state.hasDescription ? `${part.id}-description` : undefined,
      }),
      /* Arrive now; leave when `open` turns false, staying present until the exit has played. */
      bind: (el, part) => {
        let stop = animateIn(el)
        if (!part.store.get().shown) part.store.set({ shown: true })
        let open = part.store.get().open
        const unsubscribe = part.store.subscribe(() => {
          const next = part.store.get().open
          if (next === open) return
          open = next
          stop()
          if (next) {
            stop = animateIn(el)
            return
          }
          stop = animateOut(el, () => part.store.set({ shown: false }))
        })
        return () => {
          stop()
          unsubscribe()
        }
      },
    }),
    title: slot({
      attrs: (_state, part) => ({ id: `${part.id}-title` }),
      bind: (_el, part) => {
        part.store.set({ hasTitle: true })
        return () => part.store.set({ hasTitle: false })
      },
    }),
    description: slot({
      attrs: (_state, part) => ({ id: `${part.id}-description` }),
      bind: (_el, part) => {
        part.store.set({ hasDescription: true })
        return () => part.store.set({ hasDescription: false })
      },
    }),
    close: slot({
      attrs: () => ({ type: "button" }),
      press: ({ api }, event) => api.dismiss(event as MouseEvent | KeyboardEvent | undefined),
    }),
  }),
  /* An agent reads the alert by its title, and may dismiss it. It drops out once dismissed. */
  agent: { actions: ["dismiss"], shown: (state) => state.open },
})

export { alert, type AlertOptions, type AlertVariant }
