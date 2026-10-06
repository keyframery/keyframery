export function OneLine() {
  return (
    <section className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-14 md:grid-cols-[1fr_1.15fr] md:gap-12">
      <div>
      <h2 className="text-[28px] font-semibold tracking-[-0.02em]">One line. Nothing else in your app changes.</h2>
      <p className="mt-3 max-w-[60ch] text-muted-foreground">
        Keyframery doesn&apos;t replace your components or ask you to wrap them. It finds shadcn&apos;s own parts on the page and gives them cuts.
        Remove the line and you&apos;re back to stock shadcn.
      </p>
      </div>
      <pre tabIndex={0} className="min-w-0 overflow-x-auto rounded-lg border bg-card p-4 font-mono text-[13px] leading-6">
        <code>
          <span className="text-muted-foreground">{"// app/layout.tsx\n"}</span>
          {'import { Cuts } from "@/components/keyframery/cuts"\n\n'}
          {"export default function RootLayout({ children }) {\n"}
          {"  return (\n"}
          {'    <html lang="en">\n'}
          {"      <body>\n"}
          {"        {children}\n"}
          <span className="-mx-4 block bg-foreground/[0.06] px-4">{"        <Cuts />"}</span>
          {"      </body>\n"}
          {"    </html>\n"}
          {"  )\n"}
          {"}"}
        </code>
      </pre>
    </section>
  )
}
