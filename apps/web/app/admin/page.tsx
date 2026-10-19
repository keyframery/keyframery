import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"

import { logout } from "@/app/admin/actions"
import { LoginForm } from "@/app/admin/login-form"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { distribution, github, setup, traffic, usage, type Row, type Source } from "@/lib/admin/data"
import { adminPassword, SESSION_COOKIE, sessionValid } from "@/lib/admin/session"

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

const RANGES = [7, 30, 90]

export default async function Page({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const password = adminPassword()
  const session = (await cookies()).get(SESSION_COOKIE)?.value
  if (!sessionValid(session, password)) {
    return (
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
        <h1 className="text-2xl font-semibold">Keyframery admin</h1>
        {password ? <LoginForm /> : <p className="text-sm text-muted-foreground">Admin isn&apos;t set up: KEYFRAMERY_ADMIN_PASSWORD is missing or shorter than 24 characters.</p>}
      </main>
    )
  }

  const requested = Number((await searchParams).days)
  const days = RANGES.includes(requested) ? requested : 30
  const [use, site, gh, dist] = await Promise.all([usage(days), traffic(days), github(), distribution()])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Keyframery admin</h1>
          <p className="text-sm text-muted-foreground">
            Last {days} days (UTC), as of {new Date().toISOString().slice(0, 16).replace("T", " ")} UTC.
          </p>
        </div>
        <nav aria-label="Range" className="flex items-center gap-2">
          {RANGES.map((d) => (
            <Link
              key={d}
              href={`/admin?days=${d}`}
              aria-current={d === days ? "page" : undefined}
              className={buttonVariants({ size: "sm", variant: d === days ? "default" : "outline" })}
            >
              {d} days
            </Link>
          ))}
          <form action={logout}>
            <Button type="submit" size="sm" variant="ghost">
              Sign out
            </Button>
          </form>
        </nav>
      </header>

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Stat label="Cuts downloads (CLI-like)" value={use.ok ? sum(use.data.cutsByDay) : null} note={use.ok ? `${use.data.allTime.install} all-time registry GETs` : undefined} />
        <Stat label="MCP calls" value={use.ok ? use.data.totals.mcp : null} />
        <Stat label="Agent reads" value={use.ok ? use.data.totals.agent : null} />
        <Stat label="Site visits" value={site.ok ? site.data.visits : null} note={site.ok ? `${site.data.views} page views` : undefined} />
        <Stat label="GitHub stars" value={gh.ok ? gh.data.stars : null} />
        <Stat label="skills.sh installs" value={dist.ok ? sum(dist.data.skills.ours) : null} />
      </section>

      <Section title="Copy actions" description="Successful clipboard writes, by action, page and component. These aggregate intent counts are not unique developers, completed installations or organic conversions. No visitor/session attribution is collected; failed clipboard writes do not count.">
        <Sourced source={use}>
          {(u) => (
            <Table>
              <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Page</TableHead><TableHead>Component</TableHead><TableHead className="text-right">Copies</TableHead></TableRow></TableHeader>
              <TableBody>
                {u.copyEvents.length === 0 && <Empty colSpan={4} />}
                {u.copyEvents.map((r) => (
                  <TableRow key={`${r.event}:${r.page}:${r.component}`}>
                    <TableCell className="font-mono text-xs">{r.event}</TableCell>
                    <TableCell className="font-mono text-xs">{r.page}</TableCell>
                    <TableCell className="font-mono text-xs">{r.component}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Sourced>
      </Section>

      <Section title="Registry downloads" description="GET requests for keyframery.com/r/*.json, recorded before response completion. CLI-like means an approximate Node/Bun/Deno user-agent classification; it is a download proxy, not a confirmed installation or unique developer. Cuts is counted separately from helpers/dependencies; one shadcn add can request several files. registry.json is only the index.">
        <Sourced source={use}>
          {(u) => (
            <div className="grid gap-6 lg:grid-cols-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">CLI-like</TableHead>
                    <TableHead className="text-right">Browser</TableHead>
                    <TableHead className="text-right">Crawler/AI</TableHead>
                    <TableHead className="text-right">Other</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {u.registryByItem.length === 0 && <Empty colSpan={5} />}
                  {u.registryByItem.map((r) => (
                    <TableRow key={r.item}>
                      <TableCell className="font-mono text-xs">{r.item}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.cli}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.browser}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.crawler}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.other}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="grid gap-6">
                <Rows rows={u.cutsByDay} head={["Day", "Cuts CLI-like GETs"]} />
                <Rows rows={u.otherRegistryByDay} head={["Day", "Other files CLI-like GETs"]} />
                <Rows rows={u.registryClients} head={["Client classification", "Registry GETs"]} />
              </div>
            </div>
          )}
        </Sourced>
      </Section>

      <Section title="MCP server" description="Calls to keyframery.com/mcp: which tools, and which clients connected (from the client's own name).">
        <Sourced source={use}>
          {(u) => (
            <div className="grid gap-6 lg:grid-cols-2">
              <Rows rows={u.mcpTools} head={["Tool", "Calls"]} />
              <Rows rows={u.mcpClients} head={["Client", "Connections"]} />
            </div>
          )}
        </Sourced>
      </Section>

      <Section title="Agent reads" description="Markdown docs, llms.txt and .well-known files: what AI tools and crawlers read instead of the pages.">
        <Sourced source={use}>
          {(u) => (
            <div className="grid gap-6 lg:grid-cols-2">
              <Rows rows={u.agentItems} head={["Path", "Reads"]} mono />
              <Rows rows={u.agentClients} head={["Client", "Reads"]} />
            </div>
          )}
        </Sourced>
      </Section>

      <Section title="Site traffic" description="Cloudflare Web Analytics: people whose browser ran the beacon, including automated browsers that read every page in a row. These are Cloudflare's estimates: data older than about a week is sampled (about 1 in 10), so small numbers come out in round tens.">
        <Sourced source={site}>
          {(t) => (
            <div className="grid gap-6 lg:grid-cols-2">
              <Rows rows={t.byDay} head={["Day", "Visits", "Views"]} />
              <Rows rows={t.pages} head={["Page", "Views"]} mono />
              <Rows rows={t.referrers} head={["Came from", "Views"]} />
              <Rows rows={t.countries} head={["Country", "Views"]} />
              <Rows rows={t.devices} head={["Device", "Views"]} />
              <Rows rows={t.browsers} head={["Browser", "Views"]} />
            </div>
          )}
        </Sourced>
      </Section>

      <Section title="GitHub" description="github.com/keyframery/keyframery. Traffic covers GitHub's last 14 days and needs GITHUB_TOKEN.">
        <Sourced source={gh}>
          {(g) => (
            <div className="flex flex-col gap-6">
              <p className="text-sm tabular-nums">
                {g.stars} stars · {g.forks} forks · {g.watchers} watchers · {g.issues} open issues · last push {g.pushed.slice(0, 10)}
              </p>
              {g.traffic ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <p className="text-sm tabular-nums lg:col-span-2">
                    {g.traffic.views} views ({g.traffic.uniqueViews} unique) · {g.traffic.clones} clones ({g.traffic.uniqueClones} unique; mostly mirrors and scanners)
                  </p>
                  <Rows rows={g.traffic.referrers} head={["Referrer", "Views", "Unique"]} />
                  <Rows rows={g.traffic.paths} head={["Path", "Views", "Unique"]} mono />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Add GITHUB_TOKEN to see views, clones and referrers.</p>
              )}
            </div>
          )}
        </Sourced>
      </Section>

      <Section title="Discovery" description="Where agents and the shadcn CLI look for Keyframery.">
        <Sourced source={dist}>
          {(d) => (
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <b>shadcn registry index:</b> {d.registryIndex.listed ? `listed (${d.registryIndex.url})` : "not listed"}
              </li>
              <li>
                <b>skills.sh:</b>{" "}
                {d.skills.ours.length ? d.skills.ours.map((s) => `${s.label} (${s.count} installs)`).join(", ") : "no Keyframery skill listed yet"}
                {d.skills.topMatch && `. Searching “keyframery” shows ${d.skills.topMatch.label} first (${d.skills.topMatch.count.toLocaleString("en")} installs).`}
              </li>
              <li>
                <b>MCP server:</b> version {d.mcpVersion}
              </li>
            </ul>
          )}
        </Sourced>
      </Section>

      <Section title="Setup" description="Settings this page reads. Values are never shown.">
        <Table>
          <TableBody>
            {setup().map((s) => (
              <TableRow key={s.name}>
                <TableCell className="font-mono text-xs">{s.name}</TableCell>
                <TableCell>{s.set ? "set" : "missing"}</TableCell>
                <TableCell className="text-muted-foreground">{s.use}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </main>
  )
}

const sum = (rows: Row[]) => rows.reduce((n, r) => n + r.count, 0)

function Stat({ label, value, note }: { label: string; value: number | null; note?: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value === null ? "–" : value.toLocaleString("en")}</CardTitle>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </CardHeader>
    </Card>
  )
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Sourced<T>({ source, children }: { source: Source<T>; children: (data: T) => React.ReactNode }) {
  return source.ok ? children(source.data) : <p className="text-sm text-muted-foreground">Not available: {source.reason}</p>
}

function Rows({ rows, head, mono }: { rows: Row[]; head: string[]; mono?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {head.map((h, i) => (
            <TableHead key={h} className={i > 0 ? "text-right" : undefined}>
              {h}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && <Empty colSpan={head.length} />}
        {rows.map((r) => (
          <TableRow key={r.label}>
            <TableCell className={mono ? "font-mono text-xs break-all" : undefined}>{r.label}</TableCell>
            <TableCell className="text-right tabular-nums">{r.count}</TableCell>
            {head.length > 2 && <TableCell className="text-right tabular-nums">{r.extra ?? ""}</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Empty({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-muted-foreground">
        Nothing yet.
      </TableCell>
    </TableRow>
  )
}
