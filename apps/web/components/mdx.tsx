import { Callout } from "fumadocs-ui/components/callout"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"

import type * as React from "react"

import { CutCards } from "@/components/docs/cut-cards"
import { Heading } from "@/components/docs/heading"
import {
  AlertDialogDemo,
  CommandDemo,
  ComponentDemo,
  DialogDemo,
  DrawerDemo,
  IconMovesDemo,
  ListCutDemo,
  LoadCutDemo,
  MatchCutDemo,
  Playground,
  SheetDemo,
  StateCutDemo,
  TabsDemo,
  ToastDemo,
  TunedDemo,
  ValueCutDemo,
} from "@/components/docs/lazy-demos"
import { Preview } from "@/components/docs/preview"
import { Tab, Tabs } from "@/components/docs/tabs"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    h2: (props: React.ComponentProps<"h2">) => <Heading as="h2" {...props} />,
    h3: (props: React.ComponentProps<"h3">) => <Heading as="h3" {...props} />,
    h4: (props: React.ComponentProps<"h4">) => <Heading as="h4" {...props} />,
    Callout,
    Step,
    Steps,
    TypeTable,
    Preview,
    Playground,
    CutCards,
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
    ComponentDemo,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
