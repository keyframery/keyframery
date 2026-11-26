/* An app sidebar, as a UI SDK primitive. UI SDK ships no sidebar, so this one is defined with its
   core: the same definition renders in React, Vue, Svelte, Solid and web components.

   One instance per app shell. The `provider` part is the shell; it measures itself and below
   `mobileBreakpoint` the sidebar stops being a column and becomes a sheet over the page.

   - `collapsed` narrows the sidebar to an icon rail (controlled or not).
   - `openMobile` opens the sheet on a narrow shell (controlled or not). While it is open the sheet
     is a layer in UI SDK's dismissal stack: Escape or a press outside it (the scrim) closes it,
     and so does choosing an item. Focus that was inside the closing sheet goes back to a trigger
     in the page.
   - `trigger` narrows and widens the sidebar, or on a narrow shell opens and closes the sheet.
   - `menu-button` is a page in the sidebar. `isActive` marks the current one (`aria-current`),
     `tooltip` names it while the sidebar is a rail, `href` makes it a link.

   Keyboard: every item is a native button or link, so Tab moves through them and Enter or Space
   presses them, as in shadcn's sidebar (it is a list of links, not a menu widget). Escape closes
   the sheet. */

import { bindLayer, type ChangeDetails, createChange, definePrimitive, type LayerDismissReason } from "@ui-sdk/core"

/* "breakpoint" isn't in the shared vocabulary: the shell grew past `mobileBreakpoint`, so the
   sheet it had open is gone. */
type SidebarCollapsedChangeReason = "trigger-press" | "imperative"
type SidebarOpenMobileChangeReason = "trigger-press" | "item-press" | LayerDismissReason | "breakpoint" | "imperative"

type SidebarOptions = {
  /** Whether the sidebar is narrowed to the icon rail. Pass it to control the sidebar. */
  collapsed?: boolean
  /** Whether the sidebar starts narrowed to the icon rail, when uncontrolled. */
  defaultCollapsed?: boolean
  /** Runs when the sidebar wants to narrow to the rail or widen again. */
  onCollapsedChange?: (collapsed: boolean, details: ChangeDetails<SidebarCollapsedChangeReason>) => void
  /** Whether the sheet is open on a narrow shell. Pass it to control the sheet. */
  openMobile?: boolean
  /** Whether the sheet starts open on a narrow shell, when uncontrolled. */
  defaultOpenMobile?: boolean
  /** Runs when the sheet wants to open or close. */
  onOpenMobileChange?: (open: boolean, details: ChangeDetails<SidebarOpenMobileChangeReason>) => void
  /** Below this width of the provider, in px, the sidebar is a sheet that slides in over the page. 640 by default. */
  mobileBreakpoint?: number
}

type SidebarState = {
  collapsed: boolean
  openMobile: boolean
  /** The provider is narrower than `mobileBreakpoint`: the sidebar is a sheet over the page. */
  isMobile: boolean
  /** False until the content has been on the page a moment, so the current page's key doesn't glide in from nowhere. */
  ready: boolean
}

type MenuButtonProps = {
  /** Marks the current page. */
  isActive?: boolean
  /** Names the item while the sidebar is a rail, as a native tooltip. */
  tooltip?: string
  /** Makes the item a link. */
  href?: string
}

const on = (value: boolean) => (value ? "" : undefined)

/* What the provider, the sidebar and its scrim all show. */
const shellAttrs = (state: SidebarState) => ({
  "data-collapsed": on(!state.isMobile && state.collapsed),
  "data-mobile": on(state.isMobile),
  "data-open": on(state.isMobile && state.openMobile),
})

const sidebar = definePrimitive({
  name: "sidebar",
  options: {
    collapsed: "boolean",
    defaultCollapsed: "boolean",
    onCollapsedChange: "callback",
    openMobile: "boolean",
    defaultOpenMobile: "boolean",
    onOpenMobileChange: "callback",
    mobileBreakpoint: "number",
  },
  controlled: ["collapsed", "openMobile"],
  state: (options: SidebarOptions): SidebarState => ({
    collapsed: options.collapsed ?? options.defaultCollapsed ?? false,
    openMobile: options.openMobile ?? options.defaultOpenMobile ?? false,
    isMobile: false,
    ready: false,
  }),
  sync: (options) => ({
    ...(options.collapsed === undefined ? {} : { collapsed: options.collapsed }),
    ...(options.openMobile === undefined ? {} : { openMobile: options.openMobile }),
  }),
  api: (context) => {
    const change = createChange(context)
    let remeasure: (() => void) | undefined
    let width = context.options().mobileBreakpoint
    context.onOptions((options) => {
      if (options.mobileBreakpoint === width) return
      width = options.mobileBreakpoint
      remeasure?.()
    })

    /* A trigger in the page, outside the sidebar, for focus to go back to as the sheet closes. */
    const pageTrigger = () => {
      const shell = context.element("provider")
      const aside = context.element("root")
      if (!shell) return undefined
      return [...shell.querySelectorAll<HTMLElement>('[data-slot="sidebar-trigger"]')].find((el) => !aside?.contains(el))
    }

    const setOpenMobile = (open: boolean, details: { reason?: SidebarOpenMobileChangeReason; event?: Event } = {}) => {
      const aside = context.element("root")
      const focusInside = !open && !!aside && typeof document !== "undefined" && aside.contains(document.activeElement)
      const changed = change("openMobile", open, { reason: details.reason ?? "imperative", event: details.event })
      /* The sheet turns inert as it closes, which would drop focus to the page: hand it to the page's trigger. */
      if (changed && focusInside) pageTrigger()?.focus({ preventScroll: true })
      return changed
    }

    const setCollapsed = (collapsed: boolean, details: { reason?: SidebarCollapsedChangeReason; event?: Event } = {}) =>
      change("collapsed", collapsed, { reason: details.reason ?? "imperative", event: details.event })

    return {
      /** Narrows the sidebar to the rail, or widens it. */
      setCollapsed,
      /** Opens or closes the sheet on a narrow shell. */
      setOpenMobile,
      /** Narrows or widens the sidebar; on a narrow shell, opens or closes the sheet. */
      toggle(event?: Event) {
        const { isMobile, openMobile, collapsed } = context.store.get()
        const reason = event ? "trigger-press" : "imperative"
        return isMobile ? setOpenMobile(!openMobile, { reason, event }) : setCollapsed(!collapsed, { reason, event })
      },
      /** What choosing an item does: on a narrow shell it closes the sheet over the page. */
      choose(event?: Event) {
        if (context.store.get().isMobile) setOpenMobile(false, { reason: "item-press", event })
      },
      /** Follows the provider's width. Returns the function that stops. */
      watch(el: HTMLElement) {
        const measure = () => {
          const narrow = el.clientWidth < (context.options().mobileBreakpoint ?? 640)
          if (narrow === context.store.get().isMobile) return
          context.store.set({ isMobile: narrow })
          if (!narrow && context.store.get().openMobile) setOpenMobile(false, { reason: "breakpoint" })
        }
        remeasure = measure
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => {
          observer.disconnect()
          if (remeasure === measure) remeasure = undefined
        }
      },
      /** While the sheet is open, makes it a layer: Escape and a press outside close it. */
      sheet(el: HTMLElement) {
        let unbind: (() => void) | undefined
        const update = () => {
          const { isMobile, openMobile } = context.store.get()
          const open = isMobile && openMobile
          if (open && !unbind)
            unbind = bindLayer(el, {
              /* A trigger in the page toggles the sheet itself; a press on it isn't "outside". */
              contains: (target) =>
                target instanceof Element && !!target.closest('[data-slot="sidebar-trigger"]') && !!context.element("provider")?.contains(target),
              onDismiss: (reason, event) => setOpenMobile(false, { reason, event }),
            })
          else if (!open && unbind) {
            unbind()
            unbind = undefined
          }
        }
        update()
        const stop = context.store.subscribe(update)
        return () => {
          stop()
          unbind?.()
        }
      },
      /** Lets the current page's key glide once the content has settled on the page. */
      settle() {
        const timer = setTimeout(() => context.store.set({ ready: true }), 60)
        return () => clearTimeout(timer)
      },
    }
  },
  slots: (slot) => ({
    /* The app shell: the sidebar and the page beside it. */
    provider: slot<{}, { collapsed: boolean; isMobile: boolean; openMobile: boolean }>({
      state: (state) => ({ collapsed: state.collapsed, isMobile: state.isMobile, openMobile: state.openMobile }),
      attrs: shellAttrs,
      bind: (el, part) => part.api.watch(el),
    }),
    /* The sidebar itself. On a narrow shell, while the sheet is shut, nothing in it can be reached. */
    root: slot<{}, { collapsed: boolean; isMobile: boolean; open: boolean }>({
      state: (state) => ({ collapsed: !state.isMobile && state.collapsed, isMobile: state.isMobile, open: state.isMobile && state.openMobile }),
      attrs: (state, part) => ({
        id: `${part.id}-sidebar`,
        ...shellAttrs(state),
        inert: on(state.isMobile && !state.openMobile),
      }),
      bind: (el, part) => part.api.sheet(el),
    }),
    /* Behind the sheet. A press on it is a press outside the sheet, which closes it. */
    scrim: slot<{}, { open: boolean }>({
      present: (state) => state.isMobile,
      state: (state) => ({ open: state.openMobile }),
      attrs: (state) => ({ "aria-hidden": "true", "data-open": on(state.openMobile) }),
    }),
    trigger: slot<{}, { open: boolean; isMobile: boolean }>({
      state: (state) => ({ open: state.isMobile ? state.openMobile : !state.collapsed, isMobile: state.isMobile }),
      attrs: (state, part) => {
        const open = state.isMobile ? state.openMobile : !state.collapsed
        return {
          type: "button",
          "aria-controls": `${part.id}-sidebar`,
          "aria-expanded": String(open),
          "aria-label": state.isMobile ? (open ? "Close sidebar" : "Open sidebar") : open ? "Collapse sidebar" : "Expand sidebar",
          "data-open": on(open),
        }
      },
      press: ({ api }, event) => api.toggle(event),
    }),
    header: slot({}),
    footer: slot({}),
    /* Holds the groups. `data-ready` turns on the key's glide once the first layout has settled. */
    content: slot<{}, { ready: boolean }>({
      state: (state) => ({ ready: state.ready }),
      attrs: (state) => ({ "data-ready": on(state.ready) }),
      bind: (_el, part) => part.api.settle(),
    }),
    group: slot({}),
    "group-label": slot({}),
    "group-content": slot({}),
    menu: slot({}),
    "menu-item": slot({}),
    "menu-button": slot<MenuButtonProps & { id?: string }, { active: boolean; collapsed: boolean }>({
      props: { id: "id", isActive: "boolean", tooltip: "string", href: "string" },
      state: (state, part) => ({ active: !!part.props.isActive, collapsed: !state.isMobile && state.collapsed }),
      attrs: (state, part) => ({
        id: part.props.id,
        ...(part.props.href === undefined ? { type: "button" } : { href: part.props.href }),
        "data-active": on(!!part.props.isActive),
        "aria-current": part.props.isActive ? "page" : undefined,
        title: !state.isMobile && state.collapsed ? part.props.tooltip : undefined,
      }),
      press: ({ api }, event) => api.choose(event),
    }),
    /* The words of a menu button, which fold away on the rail. */
    label: slot({}),
    "menu-badge": slot({}),
    /* The page beside the sidebar. */
    inset: slot({}),
  }),
  agent: { actions: ["toggle", "setCollapsed", "setOpenMobile"] },
})

export {
  sidebar,
  type MenuButtonProps as SidebarMenuButtonOptions,
  type SidebarCollapsedChangeReason,
  type SidebarOpenMobileChangeReason,
  type SidebarOptions,
  type SidebarState,
}
