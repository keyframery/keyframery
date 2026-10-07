import { HomeLayout } from 'fumadocs-ui/layouts/home';

import { SiteFooter } from '@/components/site/footer';
import { baseOptions } from '@/lib/layout.shared';

// The footer sits beside HomeLayout, not inside it: HomeLayout renders <main id="nd-home-layout">, and a
// <footer> inside <main> is no longer the page's contentinfo landmark. <body> is a full-height flex column,
// so the footer still lands at the bottom.
export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <HomeLayout {...baseOptions()}>{children}</HomeLayout>
      <SiteFooter />
    </>
  );
}
