"use client"

// Live demos load only on the pages that use them. This has to be a client module: next/dynamic in the server-side
// MDX components still bundled every demo into every docs page (about 124 KB compressed), including pages like
// Quick start that show none. They still render on the server.

import dynamic from "next/dynamic"
import type { FC } from "react"

export const AlertDialogDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.AlertDialogDemo)) as FC
export const CommandDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.CommandDemo)) as FC
export const DialogDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.DialogDemo)) as FC
export const DrawerDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.DrawerDemo)) as FC
export const SheetDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.SheetDemo)) as FC
export const TabsDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.TabsDemo)) as FC
export const ToastDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.ToastDemo)) as FC
export const TunedDemo = dynamic(() => import("@/components/docs/demos/components").then((m) => m.TunedDemo)) as FC
export const IconMovesDemo = dynamic(() => import("@/components/docs/demos/helpers").then((m) => m.IconMovesDemo)) as FC
export const ListCutDemo = dynamic(() => import("@/components/docs/demos/helpers").then((m) => m.ListCutDemo)) as FC
export const LoadCutDemo = dynamic(() => import("@/components/docs/demos/helpers").then((m) => m.LoadCutDemo)) as FC
export const MatchCutDemo = dynamic(() => import("@/components/docs/demos/helpers").then((m) => m.MatchCutDemo)) as FC
export const StateCutDemo = dynamic(() => import("@/components/docs/demos/helpers").then((m) => m.StateCutDemo)) as FC
export const ValueCutDemo = dynamic(() => import("@/components/docs/demos/helpers").then((m) => m.ValueCutDemo)) as FC
export const ComponentDemo = dynamic(() => import("@/components/docs/demos/coverage").then((m) => m.ComponentDemo)) as FC<{ slug: string }>
export const Playground = dynamic(() => import("@/components/docs/playground").then((m) => m.Playground)) as FC<{ slug: string }>
