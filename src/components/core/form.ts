/* A form, as a UI SDK primitive. UI SDK ships Field (a label, a control, a description and its
   errors, with the browser's validation shown in the page) but no form around the fields. This is
   that form, defined with UI SDK's core: the same definition renders in React, Vue, Svelte, Solid
   and web components.

   It does what Field leaves to the page: it runs your `submit` once every field passes, keeps the
   status of that submission (submitting, done, refused), and puts the errors your server returns
   onto the fields they belong to. It puts them there through the browser's own validity
   (`setCustomValidity`), so UI SDK's Field shows them exactly as it shows its own: in its
   FieldError, with `aria-invalid` and focus on the first one. Editing a field clears its error. */

import { announce, type ChangeDetails, createChange, definePrimitive } from "@ui-sdk/core"

type FormStatus = "idle" | "submitting" | "success" | "error"

/** What `submit` may return: messages for named fields, and one line for the whole form. */
type FormResult = { errors?: Record<string, string>; message?: string } | void | undefined

// None of these reasons is in UI SDK's shared vocabulary.
type FormStatusReason = "submit" | "resolve" | "reject" | "edit" | "reset"

type FormOptions = {
  /** Runs when the form is submitted and every field is valid, with the form's data. Return or
      resolve to `{ errors: { email: "…" } }` to mark fields invalid with your messages, and
      `{ message: "…" }` for one line about the whole form. Throwing or rejecting refuses the
      submission with the error's message. Without it the form submits the browser's way. */
  submit?: (data: FormData, details: { event?: Event }) => FormResult | Promise<FormResult>
  /** Called as the submission moves between `idle`, `submitting`, `success` and `error`. */
  onStatusChange?: (status: FormStatus, details: ChangeDetails<FormStatusReason>) => void
  /** Clears the fields once a submission succeeds. The success status stays until the next edit. */
  resetOnSuccess?: boolean
}

type FormState = {
  status: FormStatus
  /** The line for the whole form from the last submission. */
  message: string
}

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const isControl = (el: unknown): el is Control =>
  el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement

const form = definePrimitive({
  name: "form",
  options: { submit: "action", onStatusChange: "callback", resetOnSuccess: "boolean" },
  state: (_options: FormOptions): FormState => ({ status: "idle", message: "" }),
  controlled: ["status", "message"],
  api: (context) => {
    const change = createChange(context)
    let root: HTMLFormElement | null = null
    /* A reset this form starts itself keeps the success it follows. */
    let resetting = false
    /* Only the latest submission may write its outcome. */
    let run = 0

    const controls = () => (root ? [...root.elements].filter(isControl) : [])
    const clearErrors = () => controls().forEach((control) => control.validity.customError && control.setCustomValidity(""))
    const setStatus = (status: FormStatus, reason: FormStatusReason, message: string, event?: Event) => {
      context.store.set({ message })
      change("status", status, { reason, event })
    }

    return {
      /** Connects the form element. The root part does this; it returns the cleanup. */
      attach(el: HTMLFormElement) {
        root = el
        /* Capture, so the error is cleared before the field reads the control's validity again. */
        const edit = (event: Event) => {
          const target = event.target
          if (isControl(target) && target.validity.customError) target.setCustomValidity("")
          const { status } = context.store.get()
          if (status === "success" || status === "error") setStatus("idle", "edit", "", event)
        }
        el.addEventListener("input", edit, true)
        el.addEventListener("change", edit, true)
        return () => {
          el.removeEventListener("input", edit, true)
          el.removeEventListener("change", edit, true)
          root = null
        }
      },
      /** Submits the form the way its submit button would: fields are checked first. */
      submit() {
        root?.requestSubmit()
      },
      /** Puts every field back to its default and the form back to idle. */
      reset() {
        root?.reset()
      },
      /** Handles the form's submit event. */
      async handle(event: SubmitEvent) {
        const { submit, resetOnSuccess } = context.options()
        if (!submit || !root) return
        event.preventDefault()
        if (context.store.get().status === "submitting") return
        const el = root
        const mine = ++run
        clearErrors()
        setStatus("submitting", "submit", "", event)
        let result: FormResult
        try {
          result = await submit(new FormData(el, event.submitter), { event })
        } catch (error) {
          if (mine !== run) return
          const message = error instanceof Error ? error.message : String(error ?? "")
          setStatus("error", "reject", message)
          if (message) announce(message, { priority: "assertive" })
          return
        }
        if (mine !== run) return
        const errors = Object.entries(result?.errors ?? {}).filter(([, text]) => text)
        if (errors.length) {
          for (const [name, text] of errors) {
            const named = el.elements.namedItem(name)
            const target = named instanceof RadioNodeList ? named[0] : named
            if (isControl(target)) target.setCustomValidity(text)
          }
          setStatus("error", "reject", result?.message ?? "")
          /* The browser reports the fields now invalid; UI SDK's Field shows each error in the page
             and the first invalid field takes focus. */
          el.reportValidity()
          return
        }
        setStatus("success", "resolve", result?.message ?? "")
        if (result?.message) announce(result.message)
        if (resetOnSuccess) {
          resetting = true
          el.reset()
          resetting = false
        }
      },
      /** Handles the form's reset event. */
      onReset(event: Event) {
        clearErrors()
        run++
        if (resetting) return
        if (context.store.get().status !== "idle") setStatus("idle", "reset", "", event)
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { status: FormStatus }>({
      state: (state) => ({ status: state.status }),
      attrs: (state) => ({
        "data-status": state.status,
        "aria-busy": state.status === "submitting" ? "true" : undefined,
      }),
      on: {
        submit: (event, { api }) => void api.handle(event as SubmitEvent),
        reset: (event, { api }) => api.onReset(event),
      },
      bind: (el, part) => (el instanceof HTMLFormElement ? part.api.attach(el) : undefined),
    }),
    /* The submit button. It stays focusable while the form submits, and ignores presses then. */
    submit: slot<{}, { status: FormStatus }>({
      role: "button",
      focus: "native",
      press: { none: "A submit button submits its form natively; the form's submit handler does the work." },
      state: (state) => ({ status: state.status }),
      attrs: (state) => ({
        type: "submit",
        "data-status": state.status,
        "aria-disabled": state.status === "submitting" ? "true" : undefined,
      }),
      on: {
        click: (event, { store }) => {
          if (store.get().status === "submitting") event.preventDefault()
        },
      },
    }),
    /* One line about the whole submission: what happened, or why it was refused. */
    status: slot<{}, { status: FormStatus; message: string }>({
      role: (state) => (state.status === "error" ? "alert" : "status"),
      roles: ["alert", "status"],
      present: (state) => state.message !== "",
      state: (state) => ({ status: state.status, message: state.message }),
      attrs: (state) => ({ "data-status": state.status }),
    }),
  }),
  agent: { actions: ["submit", "reset"] },
})

export { form, type FormOptions, type FormResult, type FormStatus }
