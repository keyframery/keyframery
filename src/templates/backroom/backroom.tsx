"use client"

/* Backroom: a store admin built from Keyframery's UI SDK components.

     import { Backroom } from "@/components/backroom/backroom"
     // app/admin/[[...path]]/page.tsx in Next.js, or one catch-all route anywhere else:
     export default function Page() { return <Backroom basePath="/admin" /> }

   It owns every address under `basePath` (/admin, /admin/orders/1042, …) through the History
   API, so one catch-all route is all a project needs. On the server, pass `initialPath` (the
   address inside the admin, like "/orders/1042") so the first paint matches.

   Files: router.tsx (addresses), routes.tsx (the page table and the sidebar), data.ts (the sample
   store), store.tsx (state and actions), agent.ts (UI SDK's agent bridge), shell.tsx (sidebar,
   header and panels), and one file per page. */

import * as React from "react"

import { MotionStyle } from "@/components/ui/motion-style"
import { ToastRegion } from "@/components/ui/toast"

import { startAgent } from "./agent"
import { backroomMotion, useApplyAppearance } from "./appearance"
import { ErrorPage, PageErrorBoundary } from "./errors"
import { PageEffects, RouterProvider, titleOf, useRouter } from "./router"
import { routes } from "./routes"
import { Shell } from "./shell"
import { me, StoreProvider, toaster, useStore } from "./store"

/* The bridge hears components as they are made, so it starts before the first render. */
if (typeof window !== "undefined") startAgent()

export function Backroom({ basePath = "/admin", initialPath }: { basePath?: string; initialPath?: string }) {
  return (
    <StoreProvider>
      <RouterProvider basePath={basePath} routes={routes} initialPath={initialPath}>
        <App />
      </RouterProvider>
    </StoreProvider>
  )
}

/* The admin is set in the project's --font-sans. A project that has not given it a value yet (a new shadcn
   project can be in that state) would show everything in the browser's serif, so a system font stands behind
   it. The admin's menus, dialogs and toasts mount on <body>, outside the admin, and get the same font: in the
   base layer and without weight, so any font the project sets on <body> itself still wins. */
const fontRule = "@layer base { :where(body:has([data-backroom])) { font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif) } }"

function App() {
  const { state } = useStore()
  const router = useRouter()
  useApplyAppearance(state.appearance)

  const match = router.match
  const ctx = { params: match?.params ?? {}, query: router.query }
  const route = match?.route
  const bare = route?.layout === "bare"
  const needsAuth = route ? (route.auth ?? !bare) : true
  const signedOut = needsAuth && !me(state)
  const title = signedOut ? "Signed out" : route ? titleOf(route, ctx) : "Page not found"

  let page: React.ReactNode
  if (signedOut) page = <ErrorPage code="401" standalone />
  else if (route && bare) page = route.render(ctx)
  else
    page = (
      <Shell crumbs={route ? (route.crumbs?.(ctx) ?? [{ label: title }]) : [{ label: "Page not found" }]}>
        <PageErrorBoundary resetKey={router.path}>{route ? route.render(ctx) : <ErrorPage code="404" />}</PageErrorBoundary>
      </Shell>
    )

  return (
    <div data-backroom="" className="min-h-svh bg-background [font-family:var(--font-sans,ui-sans-serif,system-ui,sans-serif)] text-foreground antialiased">
      <style href="br-font" precedence="default">
        {fontRule}
      </style>
      <MotionStyle preference={backroomMotion} />
      <PageEffects title={title} storeName={state.settings.name} />
      {page}
      <ToastRegion toaster={toaster} />
    </div>
  )
}
