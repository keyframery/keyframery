// Manual deployment step only; application startup never imports this script.
import { readFileSync } from "node:fs"

let phase = "configuration"
let reason = "apply-flag-required"

try {
  const args = process.argv.slice(2)
  if (args.length !== 1 || args[0] !== "--apply") throw new Error(reason)

  reason = "database-not-configured"
  if (!process.env.DATABASE_URL?.trim()) throw new Error(reason)

  reason = "migration-shape-changed"
  const statements = readFileSync(new URL("../db/usage.sql", import.meta.url), "utf8")
    .replace(/^--.*$/gm, "")
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement && !/^(begin|commit)$/i.test(statement))
  const expected = [
    "create table if not exists usage_counts (day date not null, kind text not null, item text not null, client text not null, count integer not null default 0, primary key (day, kind, item, client))",
    "alter table usage_counts drop constraint if exists usage_counts_kind_check",
    "alter table usage_counts add constraint usage_counts_kind_check check (kind in ('install', 'mcp', 'agent', 'install_copy', 'agent_prompt_copy', 'theme_copy', 'theme_share'))",
  ]
  const normalize = (statement) => statement.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")")
  if (JSON.stringify(statements.map(normalize)) !== JSON.stringify(expected)) throw new Error(reason)

  const { neon } = await import("@neondatabase/serverless")
  const sql = neon(process.env.DATABASE_URL, { fetchOptions: { signal: AbortSignal.timeout(15000) } })
  phase = "migration"
  reason = "migration-failed"
  const before = await sql.query("select to_regclass('public.usage_counts')::text as table_name")
  const result = await sql.transaction([
    sql.query("set local lock_timeout = '3s'"),
    sql.query("set local statement_timeout = '10s'"),
    sql.query(statements[0]),
    sql.query("lock table usage_counts in access exclusive mode"),
    sql.query("select count(*)::text as rows, coalesce(sum(count),0)::text as events from usage_counts"),
    sql.query(statements[1]),
    sql.query(statements[2]),
    sql.query("select count(*)::text as rows, coalesce(sum(count),0)::text as events from usage_counts"),
    sql.query("select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid='public.usage_counts'::regclass and conname='usage_counts_kind_check'"),
  ])

  // Neon has committed when transaction() resolves. A failed check here cannot roll it back.
  phase = "post-commit-verification"
  reason = "counter-preservation-check-failed"
  if (JSON.stringify(result[4]) !== JSON.stringify(result[7])) throw new Error(reason)
  reason = "constraint-verification-failed"
  const definition = result[8][0]?.definition ?? ""
  if (!["install_copy", "agent_prompt_copy", "theme_copy", "theme_share"].every((kind) => definition.includes(kind))) throw new Error(reason)
  console.log("KEYFRAMERY_USAGE_MIGRATION " + JSON.stringify({ success: true, existingTable: Boolean(before[0]?.table_name), rowsPreserved: true, countersPreserved: true, newKindsVerified: true }))
} catch (error) {
  // Database errors may contain credentials, SQL parameters or hostnames; print none of those.
  const code = typeof error?.code === "string" && /^[0-9A-Z]{5}$/.test(error.code) ? error.code : "unavailable"
  console.error("KEYFRAMERY_USAGE_MIGRATION_FAILED " + JSON.stringify({ phase, reason, code, committed: phase === "post-commit-verification" ? true : "not-confirmed" }))
  process.exitCode = 1
}
