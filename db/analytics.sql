-- Keyframery event log (page views, registry GETs, agent reads, successful copies), read by /admin.
-- Run by hand in the Neon SQL editor (or psql "$DATABASE_URL" -f db/analytics.sql).
-- Safe to rerun. The app only inserts and reads rows; it never creates or changes tables.
-- Until this has run, the site keeps writing the daily usage_counts and quietly skips the event log.
--
-- One row per event. No IP address and no user agent string is stored:
--   visitor  = 16 hex chars of sha256('kf:' || sha256(DATABASE_URL) || ':' || UTC date || ':' || IP), made in
--              site/lib/usage.ts. It links a browser visit and a CLI install from one network on one day, changes
--              every day, and cannot be turned back into the IP without the secret. Null when the request had no IP.
--   client   = a client class ("browser", "cli", "ClaudeBot", ...), never the user agent itself.
--   country  = two-letter code from Vercel's x-vercel-ip-country header, when present.
--   referrer = the referring site's host name on a visit's first page view (never a full URL).
--   item     = view: the page path; install: the registry item; agent: the Markdown path; copy: the action name.
--   detail   = copy: the page path where it happened.

begin;

create table if not exists usage_events (
  id       bigint      generated always as identity primary key,
  at       timestamptz not null default now(),
  kind     text        not null,
  item     text        not null,
  client   text        not null,
  visitor  text,
  country  text,
  referrer text,
  detail   text
);

alter table usage_events drop constraint if exists usage_events_kind_check;
alter table usage_events add constraint usage_events_kind_check
  check (kind in ('view', 'install', 'agent', 'copy'));

create index if not exists usage_events_at_idx on usage_events (at);
create index if not exists usage_events_kind_at_idx on usage_events (kind, at);
create index if not exists usage_events_visitor_at_idx on usage_events (visitor, at);

commit;
