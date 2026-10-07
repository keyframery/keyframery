/** An app window: the frame every wall screen sits in. */
export function Screen({ name, title, className, children }: { name: string; title: string; className?: string; children: React.ReactNode }) {
  return (
    <section data-screen={name} aria-label={title} className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-[0_1px_0_rgba(22,24,29,0.04),0_8px_24px_-12px_rgba(22,24,29,0.12)] ${className ?? ""}`}>
      <header className="flex items-center gap-2 border-b px-3 py-2">
        <span aria-hidden="true" className="flex gap-1">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
        <h3 className="text-[13px] font-medium">{title}</h3>
      </header>
      <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
    </section>
  )
}
