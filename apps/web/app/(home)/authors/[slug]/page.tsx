import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { allPosts, AUTHORS, authorPath, longDate } from "@/lib/blog"
import { authorPageData, JsonLd, pageMetadata } from "@/lib/seo"

const bySlug = (slug: string) => Object.values(AUTHORS).find((a) => a.slug === slug)

const LABELS: Record<string, string> = { "x.com": "X", "github.com": "GitHub", "linkedin.com": "LinkedIn", "www.linkedin.com": "LinkedIn" }

export default async function Page(props: PageProps<"/authors/[slug]">) {
  const { slug } = await props.params
  const author = bySlug(slug)
  if (!author) notFound()
  const posts = allPosts().filter((p) => p.data.author === author.name)
  const initials = author.name
    .split(" ")
    .map((w) => w[0])
    .join("")

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pt-16 pb-24 md:pt-24">
      <JsonLd data={authorPageData(author, posts.map((p) => ({ path: p.url, headline: p.data.title })))} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Keyframery
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-6 flex items-center gap-5">
        {author.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatar} alt={author.name} width={88} height={88} className="size-[88px] rounded-full object-cover" />
        ) : (
          <div aria-hidden="true" className="grid size-[88px] shrink-0 place-items-center rounded-full bg-muted text-[28px] font-semibold text-muted-foreground">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-[34px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[40px]">{author.name}</h1>
          <p className="mt-2 text-muted-foreground">
            {author.role} · {author.homeLocation}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-4 text-[17px] leading-relaxed">
        {author.about.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section aria-labelledby="writes-about" className="mt-10">
        <h2 id="writes-about" className="text-sm font-semibold">
          Writes about
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {author.knowsAbout.map((t) => (
            <li key={t} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="projects" className="mt-10">
        <h2 id="projects" className="text-sm font-semibold">
          Projects
        </h2>
        <ul className="mt-3 grid gap-2">
          {author.projects.map((p) => (
            <li key={p.url}>
              <a href={p.url} className="font-medium underline-offset-4 hover:underline">
                {p.name}
              </a>
              <span className="text-muted-foreground">: {p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="elsewhere" className="mt-10">
        <h2 id="elsewhere" className="text-sm font-semibold">
          Elsewhere
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {author.sameAs.map((u) => (
            <li key={u}>
              <a href={u} rel="me" className="underline underline-offset-4">
                {LABELS[new URL(u).hostname] ?? new URL(u).hostname}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {posts.length > 0 && (
        <section aria-labelledby="posts" className="mt-14">
          <h2 id="posts" className="text-[21px] font-semibold tracking-tight">
            Posts by {author.name.split(" ")[0]}
          </h2>
          <ol className="mt-4 grid gap-3">
            {posts.map((p) => (
              <li key={p.url}>
                <Link href={p.url} className="font-medium underline-offset-4 hover:underline">
                  {p.data.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  <time dateTime={p.data.published}>{longDate(p.data.published)}</time>
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}

export function generateStaticParams() {
  return Object.values(AUTHORS).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata(props: PageProps<"/authors/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const author = bySlug(slug)
  if (!author) notFound()
  // Kept short for search results: the full role and bio are on the page.
  return pageMetadata({ absolute: `${author.name}, creator of Keyframery`, description: author.summary, path: authorPath(author) })
}
