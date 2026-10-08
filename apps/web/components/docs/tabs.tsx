"use client"

/* MDX tabs on shadcn's Tabs, so the docs' own tabs get the J-cut. Same API as Fumadocs' Tabs. */

import * as React from "react"

import { Tabs as Root, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Tabs({ items, children }: { items: string[]; children: React.ReactNode }) {
  return (
    <Root defaultValue={items[0]} className="not-prose my-4">
      <TabsList>
        {items.map((i) => (
          <TabsTrigger key={i} value={i}>{i}</TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Root>
  )
}

export function Tab({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    // keepMounted: every tab's content is in the HTML, so search engines and AI crawlers read all of it, not just the first tab.
    <TabsContent value={value} keepMounted className="prose mt-2 max-w-none dark:prose-invert [&>figure]:my-0">
      {children}
    </TabsContent>
  )
}
