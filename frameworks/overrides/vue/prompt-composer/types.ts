/* Types for the Vue prompt composer, the same shapes as React's (an icon is a component here). */
import type { Component, VNode } from "vue"

/** Something @ or / suggests: a person, an order, a file, a command. */
export type PromptComposerItem = {
  value: string
  /** What the menu shows and what is inserted after the trigger. */
  label: string
  /** A short detail at the end of the row. */
  description?: string
  /** A component (or vnode) drawn at the start of the row. */
  icon?: Component | VNode
  /** Rows with the same group are listed under it. */
  group?: string
  keywords?: string[]
}

export type PromptComposerModel = {
  value: string
  label: string
  description?: string
}

export type PromptComposerSubmit = {
  /** The message, trimmed. */
  text: string
  /** The files attached to it. */
  attachments: File[]
  /** The chosen model, when there is a model picker. */
  model?: string
}

export type PromptComposerUploadContext = { onProgress: (percent: number) => void; signal: AbortSignal }
