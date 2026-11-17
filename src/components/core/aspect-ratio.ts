/* Aspect ratio, as a UI SDK primitive. UI SDK ships no aspect ratio, so it is defined with its core:
   the same definition renders in React, Vue, Svelte, Solid and web components.

   The root keeps its content at a width-to-height ratio, like 16 / 9 for a video or 1 for a
   square. The ratio goes out as `--aspect-ratio` and the root's `aspect-ratio` reads it, so the
   right box is in the server's HTML before anything loads. (The image inside, with its loading
   state, is UI SDK's avatar primitive, composed in the React file.) */

import { css, definePrimitive } from "@ui-sdk/core"

type AspectRatioOptions = {
  /** Width divided by height, like `16 / 9`. @defaultValue 1 */
  ratio?: number
}

const ratioOf = (options: AspectRatioOptions) => (options.ratio && options.ratio > 0 ? options.ratio : 1)

const aspectRatio = definePrimitive({
  name: "aspect-ratio",
  options: { ratio: "number" },
  state: (options: AspectRatioOptions) => ({ ratio: ratioOf(options) }),
  sync: (options) => ({ ratio: ratioOf(options) }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { ratio: number }>({
      state: (state) => ({ ratio: state.ratio }),
      attrs: (state) => ({
        "data-orientation": state.ratio > 1 ? "landscape" : state.ratio < 1 ? "portrait" : "square",
        style: css({ "--aspect-ratio": String(state.ratio), "aspect-ratio": "var(--aspect-ratio)" }),
      }),
    }),
  }),
  /* A frame for other content: nothing for an agent to read or do. */
  agent: { actions: [], shown: () => false },
})

export { aspectRatio, type AspectRatioOptions }
