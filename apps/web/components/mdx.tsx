import { Callout } from "fumadocs-ui/components/callout"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import { AlertDialogDemo, CommandDemo, DialogDemo, DrawerDemo, SheetDemo, TabsDemo, ToastDemo, TunedDemo } from "@/components/docs/demos/components"
import { IconMovesDemo, ListCutDemo, LoadCutDemo, MatchCutDemo, StateCutDemo, ValueCutDemo } from "@/components/docs/demos/helpers"
import { Preview } from "@/components/docs/preview"
import { Tab, Tabs } from "@/components/docs/tabs"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Step,
    Steps,
    TypeTable,
    Preview,
    Tabs,
    Tab,
    DialogDemo,
    AlertDialogDemo,
    SheetDemo,
    DrawerDemo,
    TabsDemo,
    ToastDemo,
    CommandDemo,
    TunedDemo,
    MatchCutDemo,
    ListCutDemo,
    ValueCutDemo,
    LoadCutDemo,
    StateCutDemo,
    IconMovesDemo,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
