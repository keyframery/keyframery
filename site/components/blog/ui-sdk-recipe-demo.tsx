"use client"

/*
 * A live demo for the UI SDK post: plain @ui-sdk/react components with only the post's CSS recipes on them, so a
 * reader can see that the recipes work without Keyframery. The recipes are scoped to body[data-recipe-demo].
 */

import "./ui-sdk-recipe-demo.css"

import * as React from "react"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

const button = "rounded-md border bg-fd-background px-3 py-1.5 text-sm font-medium hover:bg-fd-accent"
const popup = "rounded-lg border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-lg"
const item = "cursor-default rounded px-3 py-1.5 outline-none data-highlighted:bg-fd-accent"

export function UiSdkRecipeDemo() {
  React.useEffect(() => {
    document.body.setAttribute("data-recipe-demo", "")
    return () => document.body.removeAttribute("data-recipe-demo")
  }, [])

  return (
    <figure className="not-prose my-8 rounded-xl border bg-fd-card p-5 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-wrap items-start gap-3">
          <Menu>
            <MenuTrigger className={button}>Actions</MenuTrigger>
            <MenuContent className={popup}>
              <MenuItem value="rename" className={item}>Rename</MenuItem>
              <MenuItem value="duplicate" className={item}>Duplicate</MenuItem>
              <MenuItem value="archive" className={item}>Archive</MenuItem>
            </MenuContent>
          </Menu>
          <Dialog>
            <DialogTrigger className={button}>Open dialog</DialogTrigger>
            <DialogBackdrop className="fixed inset-0 z-50 bg-black/50" />
            <DialogContent className="fixed top-1/3 left-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border bg-fd-popover p-5 text-fd-popover-foreground shadow-xl">
              <DialogTitle className="font-semibold">Rename project</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-fd-muted-foreground">Rises 12px and fades in; the page behind dims.</DialogDescription>
              <DialogClose className={`${button} mt-4`}>Done</DialogClose>
            </DialogContent>
          </Dialog>
          <Collapsible className="w-full">
            <CollapsibleTrigger className={button}>Show recovery codes</CollapsibleTrigger>
            <CollapsiblePanel>
              <p className="mt-3 rounded-md border bg-fd-background p-3 font-mono text-xs leading-relaxed">4F7K-29QX · 8PL2-MM3D · Z0RT-61BC · 7YUA-K4E9</p>
            </CollapsiblePanel>
          </Collapsible>
        </div>
        <Tabs defaultValue="overview">
          <TabsList aria-label="Project" className="flex w-fit gap-1 rounded-lg border bg-fd-background p-1 text-sm">
            <TabsTab value="overview" className="relative z-10 rounded-md px-3 py-1 font-medium">Overview</TabsTab>
            <TabsTab value="activity" className="relative z-10 rounded-md px-3 py-1 font-medium">Activity</TabsTab>
            <TabsTab value="settings" className="relative z-10 rounded-md px-3 py-1 font-medium">Settings</TabsTab>
            <TabsIndicator className="rounded-md bg-fd-accent" />
          </TabsList>
          <div className="tab-panels mt-3 text-sm text-fd-muted-foreground">
            <TabsPanel value="overview">The launch is on track for Friday, with 4 of 6 tasks done.</TabsPanel>
            <TabsPanel value="activity">Inès deployed to production and Kofi left a review.</TabsPanel>
            <TabsPanel value="settings">Rename the project, move it to another team or archive it.</TabsPanel>
          </div>
        </Tabs>
      </div>
      <figcaption className="mt-5 border-t pt-3 text-xs text-fd-muted-foreground">
        Live: plain <code>@ui-sdk/react</code> components with only the CSS from this section. Turn on reduced motion in your system settings and the same changes happen at once.
      </figcaption>
    </figure>
  )
}
