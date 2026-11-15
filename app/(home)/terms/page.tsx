import { Policy, PolicySection } from "@site/components/policy"
import { pageMetadata } from "@site/lib/seo"

export const metadata = pageMetadata({
  title: "Terms",
  description: "Keyframery's components are MIT licensed. The website is provided as is.",
  path: "/terms",
})

export default function Page() {
  return (
    <Policy title="Terms" effective="15 November 2026">
      <PolicySection title="The code">
        <p>
          Keyframery&apos;s components are released under the MIT license. The license file in the{" "}
          <a href="https://github.com/keyframery/keyframery">repository</a> is what governs your use of the code.
        </p>
      </PolicySection>
      <PolicySection title="UI SDK">
        <p>
          Keyframery is built on UI SDK, which is a separate project with its own license. Keyframery is not affiliated with or endorsed by Vercel
          or shadcn.
        </p>
      </PolicySection>
      <PolicySection title="The website">
        <p>keyframery.com is provided as is, without warranties of any kind. We may change or stop it at any time.</p>
      </PolicySection>
      <PolicySection title="Fair use">
        <p>Don&apos;t overload, aggressively scrape or try to break the site.</p>
      </PolicySection>
      <PolicySection title="Changes">
        <p>If these terms change, we&apos;ll update this page and its date.</p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          Briyan Hingrajiya, <a href="mailto:briyan@keyframery.com">briyan@keyframery.com</a>
        </p>
      </PolicySection>
    </Policy>
  )
}
