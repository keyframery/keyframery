import { defineConfig } from "fumadocs-mdx/config"

export default defineConfig({
  mdxOptions: {
    // Match the homepage snippet: the default orange tokens fail 4.5:1 on white.
    rehypeCodeOptions: {
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
    },
  },
})
