#!/bin/zsh
# Runs the bench for the given slugs, one at a time, and prints each one's verdict and differences right away
# (report.json is shared with other builders' runs).
cd /Users/briyan/keyframery-ui-lab
for s in "$@"; do
  node scripts/frameworks/bench-parity.mjs $s --no-shots >/dev/null 2>&1
  python3 - "$s" <<'PY'
import json, sys
slug = sys.argv[1]
d = json.load(open(f"frameworks/bench/report-{slug}.json"))
c = d["components"].get(slug)
r = d["results"].get(slug)
if not c or not r: print(slug, "NOT IN REPORT (clobbered?)"); sys.exit()
print(f"== {slug}: {c.get('verdict')} {c.get('reasons') or ''} {c.get('missingComponents') or ''} {c.get('noPort') or ''}")
for ex, runs in r.items():
  for m, x in runs.items():
    errs = {k: v for k, v in (x.get("errors") or {}).items() if v}
    if x.get("status") != "identical":
      print(f"  {ex} {m}: {x.get('status')} recipe={x.get('recipe')} {json.dumps(errs)[:400] if errs else ''}")
      for y in (x.get("diffs") or [])[:10]: print("    ", json.dumps(y)[:300])
PY
done
