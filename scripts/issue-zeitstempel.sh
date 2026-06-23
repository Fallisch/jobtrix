#!/usr/bin/env bash
# Zeigt die Bearbeitungsdauer (Erstellung -> Schließung) aller geschlossenen
# GitHub-Issues an, neueste zuerst, sowie Summe und Durchschnitt.
#
# Nutzung:
#   scripts/issue-zeitstempel.sh [repo]
#
# Beispiel:
#   scripts/issue-zeitstempel.sh Fallisch/jobtrix

set -euo pipefail

REPO="${1:-Fallisch/jobtrix}"

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

gh issue list --repo "$REPO" --state closed --limit 200 \
  --json number,title,createdAt,closedAt \
  --jq '.[] | [.number, .createdAt, .closedAt, .title] | @tsv' > "$TMP_FILE"

python3 - "$TMP_FILE" <<'EOF'
import datetime as dt
import sys

def parse(ts):
    return dt.datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")

rows = []
with open(sys.argv[1]) as f:
    for line in f:
        num, created, closed, title = line.rstrip("\n").split("\t")
        c = parse(created)
        cl = parse(closed)
        rows.append((int(num), c, cl, cl - c, title))

rows.sort(key=lambda r: r[0], reverse=True)

total = dt.timedelta()
for num, c, cl, delta, title in rows:
    total += delta
    days = delta.days
    hours, rem = divmod(delta.seconds, 3600)
    minutes = rem // 60
    print(f"#{num:<3} {days}d {hours:02d}h {minutes:02d}m   {title}")

print()
print(f"Summe (alle {len(rows)}):", total)
print("Durchschnitt:", total / len(rows))
EOF
