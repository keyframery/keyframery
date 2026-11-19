import { Policy, PolicySection } from "@site/components/policy"
import { pageMetadata } from "@site/lib/seo"

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "What keyframery.com collects: Google Analytics page views, Microsoft Clarity recordings, our own cookie-free usage records, and request logs. No accounts, nothing sold.",
  path: "/privacy",
})

export default function Page() {
  return (
    <Policy title="Privacy" effective="19 November 2026">
      <PolicySection title="What we collect">
        <ul>
          <li>
            <b>Google Analytics.</b> On the production website, Google Analytics measures page views, visits and interactions. It receives page and
            device information and can use analytics cookies such as <code>_ga</code> to tell browsers apart and connect visits. Google processes this
            information under its <a href="https://policies.google.com/privacy">Privacy Policy</a>.
          </li>
          <li>
            <b>Microsoft Clarity.</b> On the production website, Microsoft Clarity records how pages are used (clicks, scrolling and mouse movement) as
            heatmaps and session replays, so we can see where the docs confuse people. Text typed into fields is masked before it leaves your browser.
            Clarity can use cookies such as <code>_clck</code> and <code>_clsk</code>, and Microsoft processes this information under its{" "}
            <a href="https://privacy.microsoft.com/privacystatement">Privacy Statement</a>.
          </li>
          <li>
            <b>Copy actions.</b> When you copy an install command (including a preset&apos;s command on <code>/create</code>) or the coding-agent
            prompt, we send the action&apos;s name, the page path and which button you used to Google Analytics, and record the same action in our own
            database (described below). We never send what was copied.
          </li>
          <li>
            <b>Our own usage records.</b> We record page views, component and preset downloads from <code>keyframery.com/r</code>, reads of{" "}
            <code>llms.txt</code>, <code>llms-full.txt</code> and the agent files under <code>/.well-known</code>, pages fetched as Markdown, and the
            copy actions above. We keep a daily count of each, and a log with one row per event. A row holds the time, what happened (the page path,
            the item downloaded or the copy action), the kind of client (such as &quot;browser&quot;, &quot;cli&quot; or the name of a search or AI
            crawler), your country as reported by our host, the host name of the site that linked you on your first page view (not the full address),
            and a visitor code.
          </li>
          <li>
            <b>The visitor code.</b> It is made on our server from your IP address, the date and a secret key, and lets us tell that a page view and a
            download on the same day came from the same network. It changes every day, so visits on different days can&apos;t be linked. It is a
            one-way hash, so reading the table, including when we do, doesn&apos;t show your IP address, and nobody without the secret key can
            check a list of addresses against it. Your IP address itself is never stored, logged or sent anywhere,
            and neither is your browser&apos;s user agent string. No cookies or browser storage are used for any of this, and requests from known
            crawlers are not logged as page views.
          </li>
          <li>
            <b>Request logs.</b> Vercel, which hosts the site, keeps standard request logs, such as IP address and browser, for a short time to run and
            protect the service. Component downloads from <code>keyframery.com/r</code> are ordinary requests and appear in those logs too.
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
