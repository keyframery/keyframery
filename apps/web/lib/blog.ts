import { loader } from "fumadocs-core/source"
import { pageSchema } from "fumadocs-core/source/schema"
import { defineCollections } from "fumadocs-mdx/macro"
import { z } from "zod"

import { faqSchema } from "./source"

/** A day as written in frontmatter (YYYY-MM-DD). YAML would turn an unquoted date into a Date, so both are accepted. */
const day = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date().transform((d) => d.toISOString().slice(0, 10))])

const posts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: pageSchema.extend({
    description: z.string(),
    /** The search-result title (the layout adds " | Keyframery"); the page's H1 is `title`. */
    seoTitle: z.string().optional(),
    published: day,
    /** Set only when the answer, examples or evidence change, never for a typo. */
    updated: day.optional(),
    author: z.string().default("Briyan Hingrajiya"),
    /** The short answer, shown at the top as the TL;DR and given to search and AI engines as the article's abstract. */
    tldr: z.array(z.string()).min(2).max(5),
    tags: z.array(z.string()).default([]),
    faq: faqSchema.optional(),
    /** Outside pages the post relies on: listed under Sources and given to engines as citations. */
    sources: z.array(z.object({ title: z.string(), url: z.url() })).default([]),
    /** What the post is about, for its structured data. Defaults to its first tag. */
    about: z.array(z.string()).optional(),
    /** Shown in a box above the article when the post discusses our own product. */
    disclosure: z.string().optional(),
  }),
  postprocess: { includeProcessedMarkdown: true },
})

export const blogRoute = "/blog"

export const blog = loader({ baseUrl: blogRoute, source: posts.toFumadocsSource() })

export type Post = NonNullable<ReturnType<typeof blog.getPage>>

/** Newest first. */
export const allPosts = () => [...blog.getPages()].sort((a, b) => b.data.published.localeCompare(a.data.published))

/** 230 words a minute: a careful read of technical prose with code, rounded up. Code blocks count like prose. */
export async function readingTime(post: Post) {
  const words = (await post.data.getText("processed")).replace(/[#>*_`|[\]()-]/g, " ").split(/\s+/).filter(Boolean).length
  return { words, minutes: Math.max(1, Math.ceil(words / 230)) }
}

/** "6 November 2026", the same on the server and in every visitor's time zone. */
export const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

/** People who write here: the byline, the author box and the Person in the structured data all come from this. */
export type Author = {
  name: string
  /** The author's page on this site: /authors/<slug>. */
  slug: string
  role: string
  bio: string
  /** One sentence for search results, up to about 155 characters. */
  summary: string
  /** What they work on, for the author page and the Person's knowsAbout. */
  knowsAbout: string[]
  /** Their own profiles elsewhere (X, GitHub, LinkedIn): search and AI engines use these to tell who wrote the post. */
  sameAs: string[]
  /** A square photo under /public, at least 400 × 400: the Person image in structured data. */
  image?: string
  /** A face-centred crop of the photo for the round avatars on the page. */
  avatar?: string
  homeLocation: string
  /** Longer paragraphs for the author page. */
  about: string[]
  projects: { name: string; url: string; note: string }[]
}

export const AUTHORS: Record<string, Author> = {
  "Briyan Hingrajiya": {
    name: "Briyan Hingrajiya",
    slug: "briyan-hingrajiya",
    role: "Software engineer, creator of Keyframery",
    bio: "Briyan is a software engineer in Ahmedabad, India. He builds Keyframery, the open-source motion layer for shadcn/ui, and tests it against every shadcn/ui component on Base UI and Radix in Chromium, Firefox and WebKit.",
    summary: "Briyan Hingrajiya is a software engineer in Ahmedabad who builds Keyframery, the open-source motion layer for shadcn/ui, and tests what he writes about.",
    knowsAbout: ["UI animation", "shadcn/ui", "React", "Next.js", "Web Animations API", "Claude Code skills", "AI coding agents", "System design"],
    sameAs: ["https://x.com/briyan_dev", "https://github.com/BriyanPatel"],
    image: "/authors/briyan-hingrajiya.jpg",
    avatar: "/authors/briyan-hingrajiya-avatar.jpg",
    homeLocation: "Ahmedabad, India",
    about: [
      "Briyan is a full-stack software engineer who works on generative AI tools and developer experience. He writes about AI, software and system design on X as @briyan_dev, where he has posted since August 2024.",
      "In October 2026 he released Keyframery, an MIT-licensed motion layer that animates the shadcn/ui components an app already has, with one line. Every release runs its end-to-end suite in Chromium, Firefox and WebKit, on Base UI and on Radix.",
      "Before Keyframery he built Zuro CLI, which adds backend modules (auth, database, uploads, mail) to an Express and TypeScript project as code you own, the way shadcn/ui does for components. On this blog he publishes tests he runs himself: the prompts, the setup and the numbers, so you can check the work.",
    ],
    projects: [
      { name: "Keyframery", url: "https://keyframery.com", note: "Open-source motion layer for shadcn/ui" },
      { name: "Zuro CLI", url: "https://zuro-cli.devbybriyan.com", note: "shadcn-style backend modules for Express and TypeScript" },
    ],
  },
}

export const authorPath = (a: Author) => `/authors/${a.slug}`

/** The post as plain Markdown for AI tools (/blog/<slug>.md and llms-full.txt): the same text the page shows, in reading order. */
export async function postMarkdown(post: Post) {
  const { title, description, published, updated, tldr, faq = [] } = post.data
  const { minutes } = await readingTime(post)
  const dates = `Published ${published}${updated && updated !== published ? `, updated ${updated}` : ""}`
  const body = await post.data.getText("processed")
  const questions = faq.length ? `\n\n## Questions\n\n${faq.map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n")}` : ""
  return [
    `# ${title}`,
    `> ${description}`,
    `URL: https://keyframery.com${post.url}\nBy ${post.data.author}. ${dates}. ${minutes} min read.`,
    `## TL;DR\n\n${tldr.map((t) => `- ${t}`).join("\n")}`,
    body.trim() + questions,
  ].join("\n\n") + "\n"
}
