/* A chat's scroller, as a UI SDK primitive. UI SDK ships no message scroller, but its scroll area
   already keeps the end in view as content grows (`stickToEnd`) and has a "jump to latest" button
   (`ScrollAreaScrollToEnd`). So this primitive does only what the scroll area does not:

   - It remembers which messages were there when it first showed (`data-history` on their items),
     so the history loaded with the page sits still and only new arrivals play their entrance.
     Bubble, message and attachment read that mark too: see `enter`.
   - It counts the messages that arrive while the reader has scrolled away (`unread`), clears the
     count when they come back to the end, and can bring the view down when the person sends one.

   It follows the scroll area through its controller, passed as `scroller`. */

import { animateIn, type ChangeDetails, createChange, css, definePrimitive, elements } from "@ui-sdk/core"

/** What the scroller reads from the scroll area it follows: UI SDK's scroll-area controller. */
type MessageScrollerScroller = {
  scrollToEnd(options?: { behavior?: "instant" | "smooth" }): void
  isAtEnd(): boolean
  isSticking(): boolean
}

/* None of these is in the shared vocabulary: a message arrived while the reader was away, the
   reader asked for the end, the reader scrolled back down by themselves. */
type MessageScrollerUnreadReason = "item-arrived" | "scroll-to-end" | "scroll"

type MessageScrollerOptions = {
  /** The scroll area's controller, from `createScrollAreaController()`. */
  scroller?: MessageScrollerScroller
  /** How many messages arrived while the reader was away from the end. */
  unread?: number
  defaultUnread?: number
  onUnreadChange?: (unread: number, details: ChangeDetails<MessageScrollerUnreadReason>) => void
}

type MessageScrollerState = {
  unread: number
  /** False until the first frame after the scroller binds: what is there by then is history. */
  ready: boolean
  /** The items that were there when the scroller first showed. */
  history: string[]
}

/* Elements that have played their entrance. A binding can run again for the same element (React's
   strict mode, a re-render with new part props), and the entrance must not replay. */
const entered = new WeakSet<HTMLElement>()

/** Plays a part's entrance (`data-starting-style` for its first frame) once per element, unless it
    sits in a message that was already there when its message scroller first showed. */
function enter(el: HTMLElement) {
  if (entered.has(el)) return
  entered.add(el)
  if (el.closest("[data-history]")) return
  animateIn(el)
}

const messageScroller = definePrimitive({
  name: "message-scroller",
  options: { scroller: "value", unread: "number", defaultUnread: "number", onUnreadChange: "callback" },
  controlled: ["unread"],
  state: (options: MessageScrollerOptions): MessageScrollerState => ({
    unread: options.unread ?? options.defaultUnread ?? 0,
    ready: false,
    history: [],
  }),
  sync: (options) => (options.unread === undefined ? {} : { unread: options.unread }),
  api: (context) => {
    const change = createChange(context)
    /* Items already counted or followed, so a binding that runs twice (React's strict mode, a
       remount) never counts a message twice. */
    const arrived = new Set<string>()
    const scroller = () => context.options().scroller
    /* With `stickToEnd` the view follows growth after it happens, so "at the end" right after a
       message is added reads as sticking, not as the scroll position. */
    const following = () => {
      const s = scroller()
      return s ? s.isSticking() || s.isAtEnd() : true
    }

    return {
      /** Brings the view down to the newest message and clears the unread count. */
      scrollToEnd(event?: Event) {
        scroller()?.scrollToEnd({ behavior: "smooth" })
        if (context.store.get().unread) change("unread", 0, { reason: "scroll-to-end", event })
      },
      /** The root's binding: marks the history once the first frame is out, and clears the count
          when the reader scrolls back to the end. Scroll events do not bubble, so it listens in
          the capture phase. */
      watch(el: HTMLElement) {
        const frame = requestAnimationFrame(() => {
          context.store.set({ ready: true, history: elements(context, "item").map((item) => item.key) })
        })
        const onScroll = (event: Event) => {
          if (context.store.get().unread && scroller()?.isAtEnd()) change("unread", 0, { reason: "scroll", event })
        }
        el.addEventListener("scroll", onScroll, { capture: true, passive: true })
        return () => {
          cancelAnimationFrame(frame)
          el.removeEventListener("scroll", onScroll, { capture: true })
        }
      },
      /** An item's binding: a message that arrives after the first frame plays its entrance, counts
          as unread while the reader is away, or brings the view down when it is the person's own. */
      arrive(el: HTMLElement, key: string, follow: boolean | undefined) {
        if (!context.store.get().ready) {
          /* History: remembered, so a later binding of the same item never counts it. */
          arrived.add(key)
          entered.add(el)
        } else if (!arrived.has(key)) {
          arrived.add(key)
          if (follow) scroller()?.scrollToEnd({ behavior: "smooth" })
          else if (!following()) change("unread", context.store.get().unread + 1, { reason: "item-arrived" })
        }
        enter(el)
        return () => {
          /* Forget it once it has really left, so the same message can arrive again later. */
          requestAnimationFrame(() => {
            if (!el.isConnected) arrived.delete(key)
          })
        }
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { unread: number }>({
      state: (state) => ({ unread: state.unread }),
      attrs: (state) => ({
        "data-unread": state.unread ? String(state.unread) : undefined,
        style: css({ "--message-scroller-unread": String(state.unread) }),
      }),
      bind: (el, part) => part.api.watch(el),
    }),
    item: slot<{ value: string; follow?: boolean }, { history: boolean }>({
      props: { value: "string", follow: "boolean" },
      state: (state, part) => ({ history: !state.ready || state.history.includes(part.key) }),
      attrs: (state, part) => ({
        "data-history": !state.ready || state.history.includes(part.key) ? "" : undefined,
      }),
      bind: (el, part) => part.api.arrive(el, part.key, part.props.follow),
    }),
    /* The words on the jump-to-latest button. */
    label: slot<{}, { unread: number }>({
      state: (state) => ({ unread: state.unread }),
      attrs: (state) => ({ "data-unread": state.unread ? String(state.unread) : undefined }),
    }),
  }),
  /* Keep the unread count readable even at zero; an agent can bring the view to the end. */
  agent: { actions: ["scrollToEnd"] },
})

export {
  enter,
  messageScroller,
  type MessageScrollerOptions,
  type MessageScrollerScroller,
  type MessageScrollerUnreadReason,
}
