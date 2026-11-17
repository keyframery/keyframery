/* Skeletons, as UI SDK primitives. UI SDK ships no skeleton, so these are defined with its core: the
   same definitions render in React, Vue, Svelte, Solid and web components.

   `skeleton` is one placeholder block, hidden from assistive technology, with a light that sweeps
   across it while `shimmer` is on. `skeletonSwap` holds the placeholders and the real content in one
   place: while `loading`, the placeholders show and the content is hidden and inert; when loading
   ends, the placeholders step back and the content takes over. */

import { definePrimitive } from "@ui-sdk/core"

type SkeletonOptions = {
  /** A band of light sweeps across the block. On by default. */
  shimmer?: boolean
}

const skeleton = definePrimitive({
  name: "skeleton",
  options: { shimmer: "boolean" },
  state: (options: SkeletonOptions) => ({ shimmer: options.shimmer ?? true }),
  sync: (options) => ({ shimmer: options.shimmer ?? true }),
  controlled: ["shimmer"],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { shimmer: boolean }>({
      state: (state) => ({ shimmer: state.shimmer }),
      attrs: (state) => ({ "aria-hidden": "true", "data-shimmer": state.shimmer ? "" : undefined }),
    }),
  }),
  /* The decorative block remains aria-hidden; SkeletonSwap reports loading. */
  agent: { actions: [] },
})

type SkeletonSwapOptions = {
  /** Shows the placeholders while true, the content once false. */
  loading?: boolean
}

const skeletonSwap = definePrimitive({
  name: "skeleton-swap",
  options: { loading: "boolean" },
  state: (options: SkeletonSwapOptions) => ({ loading: options.loading ?? false }),
  sync: (options) => ({ loading: options.loading ?? false }),
  controlled: ["loading"],
  api: () => ({}),
  slots: (slot) => ({
    /* `aria-busy` tells a screen reader the region is still filling in. */
    root: slot<{}, { loading: boolean }>({
      state: (state) => ({ loading: state.loading }),
      attrs: (state) => ({
        "data-loading": state.loading ? "" : undefined,
        "aria-busy": state.loading ? "true" : undefined,
      }),
    }),
    /* The placeholders: never read out, and out of reach once loading ends. */
    fallback: slot<{}, { loading: boolean }>({
      state: (state) => ({ loading: state.loading }),
      attrs: (state) => ({
        "aria-hidden": "true",
        "data-loading": state.loading ? "" : undefined,
        inert: state.loading ? undefined : "",
      }),
    }),
    /* The content: hidden and inert while loading, so nobody tabs into what they cannot see. */
    content: slot<{}, { loading: boolean }>({
      state: (state) => ({ loading: state.loading }),
      attrs: (state) => ({
        "aria-hidden": state.loading ? "true" : undefined,
        "data-loading": state.loading ? "" : undefined,
        inert: state.loading ? "" : undefined,
      }),
    }),
  }),
  /* Agents can read the loading state; loaded controls keep their own actions. */
  agent: { actions: [] },
})

export { skeleton, skeletonSwap, type SkeletonOptions, type SkeletonSwapOptions }
