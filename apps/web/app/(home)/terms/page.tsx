import type { Metadata } from "next"

import { Policy, PolicySection } from "@/components/site/policy"
import { PRO_ENABLED } from "@/lib/pro"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Terms",
  description: "The terms for keyframery.com, the Keyframery MCP server and the MIT-licensed code: what is provided as is, fair use, and how changes are announced.",
  path: "/terms",
})

export default function Page() {
  return (
    <Policy title="Terms">
      <PolicySection title="The code">
        <p>
          Keyframery&apos;s components and engine are released under the MIT license. The license file in the repository is what governs your use of the code.
        </p>
      </PolicySection>
      <PolicySection title="The website and the MCP server">
        <p>keyframery.com and keyframery.com/mcp are provided as is, without warranties of any kind. We may change or stop them at any time.</p>
      </PolicySection>
      <PolicySection title="Fair use">
        <p>Don&apos;t overload, aggressively scrape or try to break the site or the MCP server.</p>
      </PolicySection>
      {PRO_ENABLED && (
        <PolicySection title="Pro">
          <p>When Pro launches, it will come with its own terms.</p>
        </PolicySection>
      )}
      <PolicySection title="Changes">
        <p>If these terms change, we&apos;ll update this page and its date.</p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>Briyan Hingrajiya, briyan@keyframery.com</p>
      </PolicySection>
    </Policy>
  )
}
