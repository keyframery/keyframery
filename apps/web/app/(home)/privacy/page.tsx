import type { Metadata } from "next"

import { AnalyticsPreferences } from "@/components/site/analytics-preferences"
import { Policy, PolicySection } from "@/components/site/policy"
import { configuredClarityId } from "@/lib/clarity"
import { PRO_ENABLED } from "@/lib/pro"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: "How keyframery.com uses Google Analytics, aggregate usage counts, optional Microsoft Clarity session analytics, and your privacy choices.",
  path: "/privacy",
})

export default function Page() {
  return (
    <Policy title="Privacy" effective="23 October 2026">
      <PolicySection title="What we collect">
        <ul>
          {PRO_ENABLED && (
            <li>
              <b>Your email, if you join the Pro waitlist.</b> We store the email, which form you used and when you signed up, in a Postgres database
              hosted by Neon.
            </li>
          )}
          <li>
            <b>Anonymous usage.</b> Cloudflare Web Analytics counts page views and visits, and how fast pages load. It uses no cookies and doesn&apos;t
            identify you.
          </li>
          <li>
            <b>Google Analytics.</b> Google Analytics measures page views, visits and interactions on the production website. It receives page and
            device information and can use analytics cookies such as <code>_ga</code> to distinguish browsers and connect visits. Google processes
            this information under its{" "}
            <a href="https://policies.google.com/privacy" className="underline underline-offset-4">Privacy Policy</a>.
          </li>
          <li>
            <b>Download and agent counts.</b> When a tool downloads a component from keyframery.com/r, calls the MCP server, or reads the docs as
            Markdown, we add one to a daily count of what was fetched and the kind of client (for example the shadcn CLI, a browser or a named
            crawler). We keep only those counts, not your IP address or anything else that identifies you.
          </li>
          <li>
            <b>Copy actions.</b> When you successfully copy an install command, coding-agent prompt, theme code or theme share link, we add one to a
            daily count of that action, the page path and the component used. These aggregate counts contain no clipboard contents, theme settings,
            query strings, referrers or visitor identifiers, use no cookies, and are not linked to your browsing or downloads. On the production
            website, we also send the action name, page path and component to Google Analytics so we can understand which visits lead to copy
            actions. Google Analytics can connect these events to visits using its analytics cookies. We do not include clipboard contents or
            theme settings in the custom event parameters.
          </li>
          <li>
            <b>Optional session analytics.</b> If you explicitly allow it below, Microsoft Clarity can collect page URLs, device information and
            masked interactions such as clicks and scrolling to create heatmaps and session replays. It can use this site&apos;s <code>_clck</code> and{" "}
            <code>_clsk</code> cookies to connect visits. We mask page text and inputs, send no custom user or session identifiers, and keep advertising
            storage denied. Microsoft processes this information under its{" "}
            <a href="https://privacy.microsoft.com/privacystatement" className="underline underline-offset-4">Privacy Statement</a>.
          </li>
          <li>
            <b>Request logs.</b> Vercel, which hosts the site, keeps standard request logs, such as IP address and browser, for a short time to run and
            protect the service.
          </li>
        </ul>
      </PolicySection>
      <PolicySection title="Analytics preferences">
        <p>
          Clarity is off by default and makes no requests before you opt in. It does not run on the admin dashboard or preview/local sites.
          Turning it off stops recording and clears this site&apos;s Clarity cookies. We cannot delete Microsoft-domain cookies from this site;
          your browser&apos;s privacy settings control those. This choice controls Microsoft Clarity only; it does not change Google Analytics,
          cookieless Cloudflare analytics or aggregate copy/download counts.
        </p>
        <AnalyticsPreferences configured={Boolean(configuredClarityId())} />
      </PolicySection>
      <PolicySection title="The MCP server">
        <p>
          keyframery.com/mcp answers your AI tool&apos;s questions about the docs. It receives only what the tool sends it, such as a search query, a docs
          path or theme settings. It stores none of it, apart from counting which tool was called and the client&apos;s name, and it never reads
          your code. Its requests appear in Vercel&apos;s request logs like any other page.
        </p>
      </PolicySection>
      <PolicySection title="What we don't do">
        <p>We don&apos;t sell your personal data or send custom user identifiers to Clarity. Optional Clarity analytics uses cookies only after your opt-in; advertising storage remains denied.</p>
      </PolicySection>
      {PRO_ENABLED && (
        <PolicySection title="Your choices">
          <p>To remove your email from the waitlist, write to briyan@keyframery.com and we&apos;ll delete it.</p>
        </PolicySection>
      )}
      <PolicySection title="Contact">
        <p>Briyan Hingrajiya, briyan@keyframery.com</p>
      </PolicySection>
    </Policy>
  )
}
