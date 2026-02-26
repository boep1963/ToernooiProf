#!/bin/bash
# Roept ClubMatch backup API aan.
# Gebruik in crontab voor elke nacht om 5 uur: 0 5 * * * /pad/naar/scripts/run-backup-cron.sh

APP_URL="${CLUBMATCH_APP_URL:-https://localhost:3000}"
SECRET="${BACKUP_CRON_SECRET}"

if [ -z "$SECRET" ]; then
  echo "$(date '+%Y-%m-%dT%H:%M:%S%z') BACKUP_CRON_SECRET niet gezet" >&2
  exit 1
fi

curl -s -X POST "${APP_URL}/api/backup/run" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Content-Type: application/json"
