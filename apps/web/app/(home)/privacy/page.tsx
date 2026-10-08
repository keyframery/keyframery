import type { Metadata } from "next"

import { Policy, PolicySection } from "@/components/site/policy"
import { PRO_ENABLED } from "@/lib/pro"

export const metadata: Metadata = { title: "Privacy", description: "What keyframery.com collects, and what it doesn't." }

export default function Page() {
  return (
    <Policy title="Privacy">
      <PolicySection title="What we collect">
        <ul>
          {PRO_ENABLED && (
            <li>
              <b>Your email, if you join the Pro waitlist.</b> We store the email, which form you used and when you signed up, in a Postgres database
              hosted by Neon.
            </li>
          )}
          <li>
            <b>Anonymous usage.</b> Vercel Web Analytics counts page views and a few button presses, such as the Keyframery switch. It uses no cookies and
            doesn&apos;t identify you.
          </li>
          <li>
            <b>Request logs.</b> Vercel, which hosts the site, keeps standard request logs, such as IP address and browser, for a short time to run and
            protect the service.
          </li>
        </ul>
      </PolicySection>
      <PolicySection title="The MCP server">
        <p>
          keyframery.com/mcp answers your AI tool&apos;s questions about the docs. It receives only what the tool sends it, such as a search query, a docs
          path or theme settings. It stores none of it, and it never reads your code. Its requests appear in Vercel&apos;s request logs like any other page.
        </p>
      </PolicySection>
      <PolicySection title="What we don't do">
        <p>We don&apos;t sell or share your data, and we don&apos;t use advertising or tracking cookies.</p>
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
