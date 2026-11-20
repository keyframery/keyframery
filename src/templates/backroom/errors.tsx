"use client"

/* The error pages: 401, 403, 404, 500 and 503, inside the shell or on their own. Each has a very
   large number, one line that says what happened, one that says what to do, and ways out that
   work. `PageErrorBoundary` shows the 500 in place of a page that fails to render. */

import { ArrowLeft, LayoutGrid, LogIn, RotateCw } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"

import { useLink, useRouter } from "./router"
import { me, useStore } from "./store"

export const errorCodes = ["401", "403", "404", "500", "503"] as const
export type ErrorCode = (typeof errorCodes)[number]

const copy: Record<ErrorCode, { title: string; body: string }> = {
  "401": { title: "You're signed out", body: "Sign in again to get back to Tideline Prints. Anything you were doing is still where you left it." },
  "403": { title: "This page isn't open to your role", body: "Your account can't see this page. Ask Niamh Brennan, the store owner, to change your role in Team and roles." },
  "404": { title: "We couldn't find that page", body: "The address may be mistyped, or the page has moved. Check it, or start again from the dashboard." },
  "500": { title: "Something broke on our side", body: "The page hit an error while it was loading. We've logged it. Try again, and if it keeps happening, write to support." },
  "503": { title: "Backroom is down for a short update", body: "We're updating the admin and will be back by 15:30 Dublin time. Your shop stays open and orders keep coming in." },
}

const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

export function ErrorPage({ code, standalone = false, onRetry }: { code: ErrorCode; standalone?: boolean; onRetry?: () => void }) {
  const router = useRouter()
  const { state, actions } = useStore()
  const home = useLink("/")
  const signedIn = !!me(state)
  const { title, body } = copy[code]

  const goBack = () => {
    /* Back only when there is somewhere to go back to inside the admin; otherwise home. */
    if (router.visits > 0) router.back()
    else router.navigate("/")
  }

  const signIn = () => {
    if (router.exists("/sign-in")) router.navigate("/sign-in")
    else {
      actions.signIn(state.team[0].id)
      if (code === "401" && router.path === "/401") router.navigate("/")
    }
  }

  const actionsRow = (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {code === "401" && !signedIn ? (
        <Button variant="primary" size="lg" onClick={signIn}>
          <LogIn {...icon} />
          Sign in again
        </Button>
      ) : code === "500" || code === "503" ? (
        <Button variant="primary" size="lg" onClick={onRetry ?? (() => window.location.reload())}>
          <RotateCw {...icon} />
          {code === "503" ? "Check again" : "Try again"}
        </Button>
      ) : (
        <Button size="lg" onClick={goBack}>
          <ArrowLeft {...icon} className="rtl:-scale-x-100" />
          Go back
        </Button>
      )}
      {(signedIn || code !== "401") && (
        <Button size="lg" variant={code === "500" || code === "503" ? "default" : "primary"} render={<a {...home} />}>
          <LayoutGrid {...icon} />
          Back to the dashboard
        </Button>
      )}
    </div>
  )

  const content = (
    <section aria-labelledby="error-title" className="mx-auto flex max-w-[30rem] flex-col items-center text-center">
      <div aria-hidden className="text-[clamp(88px,18vw,148px)] leading-none font-semibold tracking-[-0.06em] text-foreground/[0.09] tabular-nums select-none dark:text-foreground/[0.12]">
        {code}
      </div>
      <h1 id="error-title" data-page-heading tabIndex={-1} className="-mt-3 text-[22px] leading-tight font-semibold tracking-tight outline-none text-balance">
        {title}
      </h1>
      <p className="mt-2.5 text-[14px] leading-relaxed text-pretty text-muted-foreground">{body}</p>
      {actionsRow}
      <p className="mt-10 text-[12px] text-muted-foreground tabular-nums">Error {code} · {router.basePath}{router.path === "/" ? "" : router.path}</p>
    </section>
  )

  if (!standalone) return <div className="grid min-h-[calc(100svh-10rem)] place-items-center px-4 py-16">{content}</div>

  return (
    <main className="relative grid min-h-svh place-items-center bg-background px-4 py-16 text-foreground">
      <div className="absolute inset-x-0 top-0 flex h-14 items-center px-5 text-[14px] font-semibold tracking-tight">{state.settings.name}</div>
      {content}
    </main>
  )
}

/** Shows the in-shell 500 in place of a page that throws while rendering, and lets the person try again. */
export class PageErrorBoundary extends React.Component<{ resetKey: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidUpdate(previous: { resetKey: string }) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false })
  }
  componentDidCatch(error: unknown) {
    console.error("Backroom page error:", error)
  }
  render() {
    if (this.state.failed) return <ErrorPage code="500" onRetry={() => this.setState({ failed: false })} />
    return this.props.children
  }
}
