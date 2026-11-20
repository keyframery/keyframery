"use client"

/* Backroom's router: real page addresses with the History API and nothing else, so the admin
   mounts on one catch-all route in Next.js, React Router or a plain Vite app.

   - Every address lives under `basePath` ("/admin" by default): `/admin/orders/1042`.
   - Pages are a route table (routes.tsx): a pattern like "/orders/:number", a title, a layout
     ("shell" pages sit in the sidebar shell, "bare" pages such as sign in stand alone) and a render
     function. An unknown address renders the in-shell "not found" page.
   - Links are real `<a href>` (middle-click and "open in new tab" work). `useLink(to)` gives the
     `href` and an `onClick` that takes over plain left clicks only. Pass it to a Keyframery part:
     `<Button render={<a {...useLink("/orders")} />}>Orders</Button>`.
   - After a navigation the page scrolls to the top, focus moves to the page's heading (the
     element with `data-page-heading`) and the document title follows the page. */

import * as React from "react"

export type Params = Record<string, string>

export type RouteContext = {
  params: Params
  query: URLSearchParams
}

export type Crumb = { label: string; to?: string }

export type RouteDef = {
  /** "/", "/orders", "/orders/:number". */
  pattern: string
  /** The page's name, for the document title, the breadcrumb and the command menu. */
  title: string | ((ctx: RouteContext) => string)
  /** "shell" (default) renders inside the sidebar and header; "bare" renders full screen (sign in, error pages). */
  layout?: "shell" | "bare"
  /** Needs a signed-in person (default: true for shell pages, false for bare ones). */
  auth?: boolean
  /** The trail above the title, not counting the store's name. Defaults to the title alone. */
  crumbs?: (ctx: RouteContext) => Crumb[]
  render: (ctx: RouteContext) => React.ReactNode
}

export type Match = { route: RouteDef; params: Params }

/* ------------------------------------------------------------------ matching */

const clean = (path: string) => {
  const trimmed = path.replace(/\/+$/, "")
  return trimmed === "" ? "/" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`
}

export function matchPattern(pattern: string, path: string): Params | null {
  const want = clean(pattern).split("/")
  const have = clean(path).split("/")
  if (want.length !== have.length) return null
  const params: Params = {}
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(":")) {
      if (!have[i]) return null
      params[want[i].slice(1)] = decodeURIComponent(have[i])
    } else if (want[i] !== have[i]) return null
  }
  return params
}

export function resolve(routes: RouteDef[], path: string): Match | null {
  for (const route of routes) {
    const params = matchPattern(route.pattern, path)
    if (params) return { route, params }
  }
  return null
}

export const titleOf = (route: RouteDef, ctx: RouteContext) => (typeof route.title === "function" ? route.title(ctx) : route.title)

/* ------------------------------------------------------------------ the address */

const NAVIGATE = "backroom:navigate"

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback)
  window.addEventListener(NAVIGATE, callback)
  return () => {
    window.removeEventListener("popstate", callback)
    window.removeEventListener(NAVIGATE, callback)
  }
}
const readLocation = () => window.location.pathname + window.location.search

type Router = {
  basePath: string
  /** The address inside the admin, without the base path or the query: "/orders/1042". */
  path: string
  query: URLSearchParams
  match: Match | null
  routes: RouteDef[]
  /** Goes to an address inside the admin: "/orders/1042", "/?tab=analytics". */
  navigate: (to: string, options?: { replace?: boolean }) => void
  /** Changes the query of the current address, keeping the page. `null` removes a key. */
  setQuery: (next: Record<string, string | null>, options?: { replace?: boolean }) => void
  /** The full address of a path inside the admin, for an `href`. */
  href: (to: string) => string
  /** Whether a path inside the admin is a page that exists. */
  exists: (to: string) => boolean
  back: () => void
  forward: () => void
  /** Bumps on every navigation, for the progress line. */
  visits: number
}

const RouterContext = React.createContext<Router | null>(null)

export function useRouter() {
  const router = React.useContext(RouterContext)
  if (!router) throw new Error("useRouter must be used inside <Backroom>.")
  return router
}

export function RouterProvider({
  basePath,
  routes,
  initialPath = "/",
  children,
}: {
  basePath: string
  routes: RouteDef[]
  /** The address to render on the server, inside the admin: "/orders/1042". */
  initialPath?: string
  children: React.ReactNode
}) {
  const base = basePath.replace(/\/+$/, "")
  const full = React.useSyncExternalStore(subscribe, readLocation, () => base + (initialPath === "/" ? "" : initialPath))
  const [visits, setVisits] = React.useState(0)

  const [pathname, search = ""] = full.split("?")
  const inside = pathname === base || pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : "/"
  const path = clean(inside)
  const query = React.useMemo(() => new URLSearchParams(search), [search])
  const match = React.useMemo(() => resolve(routes, path), [routes, path])

  const value = React.useMemo<Router>(() => {
    const href = (to: string) => {
      const [p, q] = to.split("?")
      const target = clean(p)
      return `${base}${target === "/" ? "" : target}${q ? `?${q}` : ""}` || "/"
    }
    const go = (url: string, replace?: boolean) => {
      if (url === readLocation()) return
      window.history[replace ? "replaceState" : "pushState"](null, "", url)
      window.dispatchEvent(new Event(NAVIGATE))
    }
    return {
      basePath: base,
      path,
      query,
      match,
      routes,
      visits,
      href,
      exists: (to) => !!resolve(routes, to.split("?")[0]),
      navigate: (to, options) => {
        const samePage = clean(to.split("?")[0]) === path
        go(href(to), options?.replace)
        if (!samePage) {
          setVisits((n) => n + 1)
          window.scrollTo({ top: 0 })
        }
      },
      setQuery: (next, options) => {
        const params = new URLSearchParams(query)
        for (const [key, v] of Object.entries(next)) {
          if (v === null || v === "") params.delete(key)
          else params.set(key, v)
        }
        const q = params.toString()
        go(href(`${path}${q ? `?${q}` : ""}`), options?.replace ?? true)
      },
      back: () => window.history.back(),
      forward: () => window.history.forward(),
    }
  }, [base, path, query, match, routes, visits])

  /* Back and forward count as navigations for the progress line too. */
  React.useEffect(() => {
    const onPop = () => setVisits((n) => n + 1)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  return <RouterContext value={value}>{children}</RouterContext>
}

/* ------------------------------------------------------------------ links */

/** A plain left click with no modifier on a link that stays in this tab. */
function isPlainClick(event: React.MouseEvent<HTMLElement>) {
  const target = (event.currentTarget as HTMLAnchorElement).getAttribute?.("target")
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && (!target || target === "_self")
}

/** `href` and `onClick` for a link to a page inside the admin. Spread them on the `<a>` you pass to a part's `render`. */
export function useLink(to: string, options?: { replace?: boolean; onNavigate?: () => void }) {
  const router = useRouter()
  return {
    href: router.href(to),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (!isPlainClick(event)) return
      event.preventDefault()
      router.navigate(to, options)
      options?.onNavigate?.()
    },
  }
}

/** The same as `useLink`, for lists where a hook per row isn't possible. */
export function linkProps(router: Router, to: string, onNavigate?: () => void) {
  return {
    href: router.href(to),
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (!isPlainClick(event)) return
      event.preventDefault()
      router.navigate(to)
      onNavigate?.()
    },
  }
}

/* ------------------------------------------------------------------ after a navigation */

/** Sets the document title, and on each new page moves focus to its heading, or to the field marked
    `data-page-autofocus` on a page whose point is typing (sign in, the two-step code). Render it once inside the page area. */
export function PageEffects({ title, storeName }: { title: string; storeName: string }) {
  const { path, visits } = useRouter()
  React.useEffect(() => {
    const before = document.title
    document.title = `${title} · ${storeName}`
    return () => {
      document.title = before
    }
  }, [title, storeName])
  React.useEffect(() => {
    if (visits === 0) return
    const marked = document.querySelector<HTMLElement>("[data-page-autofocus]")
    const field = marked?.matches("input, textarea") ? marked : marked?.querySelector<HTMLElement>("input, textarea")
    ;(field ?? document.querySelector<HTMLElement>("[data-page-heading]"))?.focus({ preventScroll: true })
  }, [path, visits])
  return null
}
