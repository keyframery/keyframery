-- Keyframery aggregate counts (registry GETs, MCP calls, agent reads, successful copies), read by /admin.
-- Run by hand in the Neon SQL editor (or psql "$DATABASE_URL" -f db/usage.sql).
-- Safe to rerun: existing installations need the updated kind constraint for copy events.
-- The app only inserts and reads rows; it never creates or changes tables.
-- One row per day + kind + item + client, holding a count. No IP addresses or user agent strings are stored.

begin;

create table if not exists usage_counts (
  day    date    not null,
  kind   text    not null,
  item   text    not null,
  client text    not null,
  count  integer not null default 0,
  primary key (day, kind, item, client)
);

alter table usage_counts drop constraint if exists usage_counts_kind_check;
alter table usage_counts add constraint usage_counts_kind_check
  check (kind in ('install', 'mcp', 'agent', 'install_copy', 'agent_prompt_copy', 'theme_copy', 'theme_share'));

commit;
