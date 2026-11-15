import { Policy, PolicySection } from "@site/components/policy"
import { pageMetadata } from "@site/lib/seo"

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What keyframery.com collects: Google Analytics page views, counts of copy actions, and the hosting provider's request logs. No accounts, nothing sold.",
  path: "/privacy",
})

export default function Page() {
  return (
    <Policy title="Privacy" effective="15 November 2026">
      <PolicySection title="What we collect">
        <ul>
          <li>
            <b>Google Analytics.</b> On the production website, Google Analytics measures page views, visits and interactions. It receives page and
            device information and can use analytics cookies such as <code>_ga</code> to tell browsers apart and connect visits. Google processes this
            information under its <a href="https://policies.google.com/privacy">Privacy Policy</a>.
          </li>
          <li>
            <b>Copy actions.</b> When you copy an install command or the coding-agent prompt, we send the action&apos;s name, the page path and which
            button you used to Google Analytics. We never send what was copied.
          </li>
          <li>
            <b>Request logs.</b> Vercel, which hosts the site, keeps standard request logs, such as IP address and browser, for a short time to run and
            protect the service. Component downloads from <code>keyframery.com/r</code> are ordinary requests and appear in those logs.
          </li>
          <li>
            <b>Your motion style.</b> If you pick a motion style, your browser remembers it in local storage. It never leaves your device.
          </li>
        </ul>
      </PolicySection>
      <PolicySection title="What we don't do">
        <p>There are no accounts, no forms and no email list. We don&apos;t sell personal data and don&apos;t run advertising.</p>
      </PolicySection>
      <PolicySection title="Your choices">
        <p>Browser settings and extensions that block analytics cookies or scripts work on this site, and nothing breaks without them.</p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          Briyan Hingrajiya, <a href="mailto:briyan@keyframery.com">briyan@keyframery.com</a>
        </p>
      </PolicySection>
    </Policy>
  )
}
