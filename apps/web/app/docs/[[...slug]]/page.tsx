import { source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { docData, faqData, JsonLd, pageMetadata, SITE, url } from '@/lib/seo';

/** `code` in a FAQ answer, as inline code. */
function inline(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const heading = page.data.heading ?? page.data.title;
  const faq = page.data.faq ?? [];
  const toc = faq.length ? [...page.data.toc, { title: 'Questions', url: '#questions', depth: 2 }] : page.data.toc;

  return (
    <DocsPage toc={toc} full={page.data.full}>
      <JsonLd data={docData({ path: page.url, headline: heading, description: page.data.description ?? '', image: `${SITE}${getPageImageUrl(page).url}` })} />
      {faq.length > 0 && <JsonLd data={faqData(faq.map(({ q, a }) => ({ q, text: a.replaceAll('`', '') })))} />}
      <DocsTitle>{heading}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/apps/web/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
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
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const metadata = pageMetadata({
    title: page.data.seoTitle ?? page.data.title,
    description: page.data.description ?? '',
    path: page.url,
    image: getPageImageUrl(page).url,
  });
  // The same page as Markdown, for AI tools that look for it.
  return { ...metadata, alternates: { ...metadata.alternates, types: { 'text/markdown': `${url(page.url)}.mdx` } } };
}
