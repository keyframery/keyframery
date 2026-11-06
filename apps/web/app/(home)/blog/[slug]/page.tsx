import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ReadingRing } from "@/components/blog/reading-ring"
import { getMDXComponents } from "@/components/mdx"
import { AUTHORS, authorPath, blog, longDate, readingTime, type Post } from "@/lib/blog"
import { blogPostData, faqData, JsonLd, pageMetadata, SITE } from "@/lib/seo"

const image = (post: Post) => `/og/blog/${post.slugs[0]}/image.png`

/** `code` in a FAQ answer, as inline code. */
function inline(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))
}

export default async function Page(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params
  const post = blog.getPage([slug])
  if (!post) notFound()

  const { title, description, published, updated, tldr, tags, faq = [], sources, disclosure, about } = post.data
  const author = AUTHORS[post.data.author]
  const { words, minutes } = await readingTime(post)
  const toc = [
    ...post.data.toc.filter((t) => t.depth === 2),
    ...(faq.length ? [{ title: "Questions", url: "#questions", depth: 2 }] : []),
    ...(sources.length ? [{ title: "Sources", url: "#sources", depth: 2 }] : []),
  ]
  const MDX = post.data.body

  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-x-16 px-4 pt-12 pb-24 md:pt-16 lg:grid-cols-[minmax(0,720px)_220px] lg:justify-center">
      <JsonLd
        data={blogPostData({
          path: post.url,
          headline: title,
          description,
          image: `${SITE}${image(post)}`,
          published,
          updated,
          author,
          words,
          minutes,
          tldr,
          tags,
          sources,
          about: about ?? tags.slice(0, 1),
        })}
      />
      {faq.length > 0 && <JsonLd data={faqData(faq.map(({ q, a }) => ({ q, text: a.replaceAll("`", "") })))} />}

      <header className="lg:col-start-1">
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
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="line-clamp-1 max-w-[40ch] text-foreground">
              {title}
            </li>
          </ol>
        </nav>
        <h1 className="mt-5 text-[34px] leading-[1.12] font-semibold tracking-[-0.025em] text-balance md:text-[44px]">{title}</h1>
        <p className="mt-4 max-w-[64ch] text-[18px] leading-relaxed text-pretty text-muted-foreground">{description}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>
            By{" "}
            <Link href={authorPath(author)} rel="author" className="font-medium text-foreground underline-offset-4 hover:underline">
              {author.name}
            </Link>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Published <time dateTime={published}>{longDate(published)}</time>
          </span>
          {updated && updated !== published && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Updated <time dateTime={updated}>{longDate(updated)}</time>
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{minutes} min read</span>
        </p>
      </header>

      <aside aria-labelledby="tldr" className="mt-10 rounded-xl border bg-muted/40 p-5 md:p-6 lg:col-start-1">
        <h2 id="tldr" className="text-sm font-semibold tracking-wide uppercase">
          TL;DR
        </h2>
        <ul className="mt-3 grid list-disc gap-2 pl-5 text-[16px] leading-relaxed marker:text-muted-foreground">
          {tldr.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </aside>

      {/* One list, in the reading order on phones; on wide screens it sits beside the article and stays in view. */}
      <nav
        aria-labelledby="contents"
        className="mt-8 border-l pl-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-6 lg:row-start-1 lg:mt-16 lg:self-start"
      >
        <h2 id="contents" className="text-sm font-semibold">
          Contents
        </h2>
        <ol className="mt-3 grid gap-2 text-sm text-muted-foreground">
          {toc.map((item) => (
            <li key={item.url}>
              <a href={item.url} className="underline-offset-4 hover:text-foreground hover:underline">
                {item.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {disclosure && (
        <p className="mt-6 rounded-lg border border-dashed px-4 py-3 text-sm leading-relaxed text-muted-foreground lg:col-start-1">
          <span className="font-medium text-foreground">Disclosure: </span>
          {disclosure}
        </p>
      )}

      <article id="article" className="prose mt-10 max-w-none lg:col-start-1">
        <MDX components={getMDXComponents()} />
        {faq.length > 0 && (
          <section aria-labelledby="questions">
            <h2 id="questions">Questions</h2>
            {faq.map(({ q, a }) => (
              <div key={q}>
                <h3>{q}</h3>
                <p>{inline(a)}</p>
              </div>
            ))}
          </section>
        )}
        {sources.length > 0 && (
          <section aria-labelledby="sources">
            <h2 id="sources">Sources</h2>
            <ol>
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url}>{s.title}</a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>

      <section id="author" aria-label="About the author" className="mt-14 flex items-start gap-4 rounded-xl border p-5 md:p-6 lg:col-start-1">
        {author.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatar} alt="" width={56} height={56} loading="lazy" className="size-14 shrink-0 rounded-full object-cover" />
        )}
        <div>
        <p className="text-sm text-muted-foreground">Written by</p>
        <p className="mt-1 font-semibold">
          <Link href={authorPath(author)} className="underline-offset-4 hover:underline">
            {author.name}
          </Link>
          <span className="font-normal text-muted-foreground">, {author.role}</span>
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{author.bio}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {author.sameAs.map((u) => (
            <a key={u} href={u} rel="me" className="underline underline-offset-4">
              {new URL(u).hostname === "x.com" ? "X" : new URL(u).hostname === "github.com" ? "GitHub" : new URL(u).hostname}
            </a>
          ))}
        </p>
        </div>
      </section>

      <ReadingRing target="article" />
    </div>
  )
}

export function generateStaticParams() {
  return blog.getPages().map((post) => ({ slug: post.slugs[0] }))
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params
  const post = blog.getPage([slug])
  if (!post) notFound()
  const { title, seoTitle, description, published, updated, author, tags } = post.data
  const writer = AUTHORS[author]
  return pageMetadata({
    title: seoTitle ?? title,
    description,
    path: post.url,
    image: image(post),
    markdown: `${post.url}.md`,
    article: { published, updated, authorUrl: `${SITE}${authorPath(writer)}`, tags },
    imageAlt: `${title}: a dark card with the post title, ${author} and the date`,
  })
}
