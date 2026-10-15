-- Keyframery usage counts (installs, MCP calls, agent reads), read by /admin.
-- Run this once by hand in the Neon SQL editor (or psql "$DATABASE_URL" -f db/usage.sql).
-- The app only inserts and reads rows; it never creates or changes tables.
-- One row per day + kind + item + client, holding a count. No IP addresses or user agent strings are stored.

create table if not exists usage_counts (
  day    date    not null,
  kind   text    not null check (kind in ('install', 'mcp', 'agent')),
  item   text    not null,
  client text    not null,
  count  integer not null default 0,
  primary key (day, kind, item, client)
);
