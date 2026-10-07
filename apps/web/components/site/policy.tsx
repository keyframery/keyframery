/** The frame for the privacy and terms pages: a title, the effective date, and plain sections. */
export function Policy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[720px] px-4 pt-16 pb-24 md:pt-24">
      <h1 className="text-[36px] leading-[1.1] font-semibold tracking-[-0.025em] md:text-[44px]">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Effective 8 October 2026</p>
      <div className="mt-12 grid gap-10">{children}</div>
    </main>
  )
}

export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 text-[16px] leading-relaxed text-muted-foreground [&_b]:font-medium [&_b]:text-foreground [&_li]:pl-1 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-2 [&_ul]:pl-5">
      <h2 className="text-[19px] font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  )
}
