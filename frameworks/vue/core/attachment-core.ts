/* File attachments, as UI SDK primitives. UI SDK ships no attachment (its file input picks files;
   this shows one that is attached), so these are defined with its core: the same definitions render
   in React, Vue, Svelte, Solid and web components.

   `attachment` is one file: a named group with its media, title, description, an upload progress
   line and a row of actions. It plays its entrance when it mounts. `remove()` plays its exit, moves
   focus to a neighbour if it held focus, then calls `onRemove(value)` so the app can drop it; a
   listener that cancels keeps it, and it comes back. An action marked `data-action="remove"`
   inside the actions row calls `remove()`. `attachmentGroup` lines attachments up in a row. */

import { animateOut, css, definePrimitive, dispatch } from "@ui-sdk/core"

import { enter } from "@/components/keyframery/core/message-scroller-core"

type AttachmentStatus = "idle" | "uploading" | "processing" | "error" | "done"

/* Not in the shared vocabulary: the person pressed the attachment's remove action. */
type AttachmentRemoveReason = "remove-press" | "imperative"

type AttachmentOptions = {
  /** Where the file is: `"idle"` (not sent yet), `"uploading"`, `"processing"`, `"error"` or `"done"`. */
  status?: AttachmentStatus
  /** How much of the upload is done, from 0 to 100. Drawn while uploading. */
  progress?: number
  /** `"default"`, `"sm"` or `"xs"`. */
  size?: "default" | "sm" | "xs"
  /** `"horizontal"`: a chip with the media at the start. `"vertical"`: a tile with the media on top. */
  orientation?: "horizontal" | "vertical"
  /** What `onRemove` reports, like the file's id. */
  value?: string
  /** Called once the attachment has left, so the app can drop it. Cancel to keep it. */
  onRemove?: (value: string | undefined, details: { reason: AttachmentRemoveReason; event?: Event; cancel(): void }) => void
}

type AttachmentState = {
  status: AttachmentStatus
  progress: number
  size: "default" | "sm" | "xs"
  orientation: "horizontal" | "vertical"
  removing: boolean
}

const focusable = "button:not([disabled]), a[href], input, [tabindex]:not([tabindex='-1'])"

const attachment = definePrimitive({
  name: "attachment",
  options: {
    status: "string",
    progress: "number",
    size: "string",
    orientation: "string",
    value: "string",
    onRemove: "callback",
  },
  state: (options: AttachmentOptions): AttachmentState => ({
    status: options.status ?? "done",
    progress: options.progress ?? 0,
    size: options.size ?? "default",
    orientation: options.orientation ?? "horizontal",
    removing: false,
  }),
  sync: (options) => ({
    status: options.status ?? "done",
    progress: options.progress ?? 0,
    size: options.size ?? "default",
    orientation: options.orientation ?? "horizontal",
  }),
  controlled: ["status", "progress", "removing"],
  api: (context) => {
    let stop: (() => void) | undefined
    context.onDestroy(() => stop?.())

    /* When focus is inside the attachment that leaves, hand it to the next one in its group (or
       the one before), so a keyboard user can keep removing. */
    const recoverFocus = (el: HTMLElement) => {
      if (!el.contains(document.activeElement)) return
      const group = el.closest("[data-slot='attachment-group']")
      const all = group ? Array.from(group.querySelectorAll<HTMLElement>("[data-slot='attachment']:not([data-removing])")) : []
      const at = all.indexOf(el)
      const next = all.slice(at + 1).find((other) => other !== el) ?? all.slice(0, Math.max(at, 0)).reverse()[0]
      const target = next?.querySelector<HTMLElement>(focusable)
      if (target) target.focus()
      else (document.activeElement as HTMLElement | null)?.blur()
    }

    return {
      /** Plays the exit, then calls `onRemove`. */
      remove(event?: Event) {
        if (context.store.get().removing) return
        const finish = () => {
          const canceled = dispatch(context, "onRemove", context.options().value, {
            reason: event ? "remove-press" : "imperative",
            event,
          })
          if (canceled) context.store.set({ removing: false })
        }
        const el = context.element("root")
        context.store.set({ removing: true })
        if (!el) return finish()
        recoverFocus(el)
        stop?.()
        stop = animateOut(el, finish)
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, AttachmentState>({
      role: "group",
      state: (state) => ({ ...state }),
      attrs: (state, part) => ({
        "aria-labelledby": `${part.id}-title`,
        "aria-describedby": `${part.id}-description`,
        "aria-busy": state.status === "uploading" || state.status === "processing" ? "true" : undefined,
        "data-status": state.status,
        "data-size": state.size,
        "data-orientation": state.orientation,
        "data-removing": state.removing ? "" : undefined,
        style: css({ "--attachment-progress": String(Math.min(100, Math.max(0, state.progress)) / 100) }),
      }),
      /* Entrance, and the size the exit collapses from (so the ones after it slide over). */
      bind: (el) => {
        enter(el)
        const measure = () => {
          el.style.setProperty("--attachment-width", `${el.offsetWidth}px`)
          el.style.setProperty("--attachment-height", `${el.offsetHeight}px`)
        }
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => {
          observer.disconnect()
        }
      },
    }),
    media: slot<{ variant?: "icon" | "image" }>({
      props: { variant: "string" },
      attrs: (_state, part) => ({ "data-variant": part.props.variant ?? "icon" }),
    }),
    content: slot({}),
    title: slot({
      attrs: (_state, part) => ({ id: `${part.id}-title` }),
    }),
    description: slot({
      attrs: (_state, part) => ({ id: `${part.id}-description` }),
    }),
    /* The upload line. Screen readers hear `aria-busy` on the group instead. */
    progress: slot({
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    actions: slot({
      on: {
        click: (event, { api }) => {
          if ((event.target as HTMLElement | null)?.closest("[data-action='remove']")) api.remove(event)
        },
      },
    }),
    /* A button over the whole attachment, to open or preview it. */
    trigger: slot({
      attrs: () => ({ type: "button" }),
    }),
  }),
  agent: { actions: ["remove"] },
})

const attachmentGroup = definePrimitive({
  name: "attachment-group",
  state: () => ({}),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot({}),
  }),
  agent: { actions: [] },
})

export { attachment, attachmentGroup, type AttachmentOptions, type AttachmentStatus }
