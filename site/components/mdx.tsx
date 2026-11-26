import { Accordion, Accordions } from "fumadocs-ui/components/accordion"
import { Callout } from "fumadocs-ui/components/callout"
import { Step, Steps } from "fumadocs-ui/components/steps"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import defaultMdxComponents from "fumadocs-ui/mdx"
import type { MDXComponents } from "mdx/types"
import type * as React from "react"

import { AgentPromptButton } from "@site/components/agent-prompt-button"
import { ComponentGrid } from "@site/components/docs/component-grid"
import { ComponentPreview, MotionStylePlayground } from "@site/components/docs/component-preview"
import { ExamplePreview } from "@site/components/docs/example-preview"
import { FrameworkGrid, StartingPoints, UiFrameworkPicker } from "@site/components/docs/framework-cards"
import { ProductHighlights } from "@site/components/docs/product-highlights"
import { PropsTable } from "@site/components/docs/props-table"
import { Heading } from "@site/components/docs/heading"
import { LazyCode } from "@site/components/docs/lazy-code"
import { Note } from "@site/components/docs/note"
import { TemplateGrid } from "@site/components/templates/template-grid"
import { TemplateStage } from "@site/components/templates/template-stage"

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    h2: (props: React.ComponentProps<"h2">) => <Heading as="h2" {...props} />,
    h3: (props: React.ComponentProps<"h3">) => <Heading as="h3" {...props} />,
    h4: (props: React.ComponentProps<"h4">) => <Heading as="h4" {...props} />,
    Accordion,
    Accordions,
    Callout,
    Step,
    Steps,
    Tab,
    Tabs,
    AgentPromptButton,
    ComponentGrid,
    ComponentPreview,
    ExamplePreview,
    FrameworkGrid,
    ProductHighlights,
    UiFrameworkPicker,
    StartingPoints,
    LazyCode,
    PropsTable,
    MotionStylePlayground,
    Note,
    TemplateGrid,
    TemplateStage,
    ...components,
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
