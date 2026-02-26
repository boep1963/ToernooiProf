# Backup cron – elke nacht om 5 uur

De backup wordt **niet** automatisch door de app gedraaid. Je moet een externe cron job (of Google Cloud Scheduler) instellen die `POST /api/backup/run` aanroept.

## Cron-instelling: elke nacht om 5:00

- **Cron expression:** `0 5 * * *`
- **Betekenis:** minuut 0, uur 5, elke dag (05:00 lokale tijd).

---

## 1. Linux / macOS (crontab)

Voer `crontab -e` uit en voeg toe:

```cron
0 5 * * * /usr/bin/curl -s -X POST "https://JOUW_DOMEIN/api/backup/run" -H "Authorization: Bearer JOUW_BACKUP_CRON_SECRET" >> /var/log/clubmatch-backup.log 2>&1
```

Vervang:

- `https://JOUW_DOMEIN` – het volledige basis-URL van je app (bijv. `https://clubmatch.example.nl`).
- `JOUW_BACKUP_CRON_SECRET` – de waarde van `BACKUP_CRON_SECRET` uit je `.env` (minimaal 32 tekens).

Of gebruik een script dat de secret uit de omgeving haalt (zie hieronder).

---

## 2. Script (aanroep vanuit crontab)

Maak een script dat alleen `curl` aanroept en de secret uit de omgeving gebruikt (niet hardcoden):

**`scripts/run-backup-cron.sh`** (maak het bestand aan en maak het uitvoerbaar: `chmod +x scripts/run-backup-cron.sh`):

```bash
#!/bin/bash
# Roept ClubMatch backup API aan. Voor gebruik in crontab: 0 5 * * * /pad/naar/scripts/run-backup-cron.sh

APP_URL="${CLUBMATCH_APP_URL:-https://localhost:3000}"
SECRET="${BACKUP_CRON_SECRET}"

if [ -z "$SECRET" ]; then
  echo "$(date -Iseconds) BACKUP_CRON_SECRET niet gezet" >&2
  exit 1
fi

curl -s -X POST "${APP_URL}/api/backup/run" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Content-Type: application/json"
```

In crontab:

```cron
0 5 * * * BACKUP_CRON_SECRET='jouw_secret_hier' CLUBMATCH_APP_URL='https://jouw-domein.nl' /pad/naar/scripts/run-backup-cron.sh >> /var/log/clubmatch-backup.log 2>&1
```

Of zet `BACKUP_CRON_SECRET` en eventueel `CLUBMATCH_APP_URL` in de omgeving van de cron (bijv. in `/etc/environment` of in een bestand dat je in crontab met `source` laadt), en roep alleen het script aan:

```cron
0 5 * * * /pad/naar/scripts/run-backup-cron.sh >> /var/log/clubmatch-backup.log 2>&1
```

---

## 3. Google Cloud Scheduler (aanbevolen bij Firebase/GCP)

1. Open [Google Cloud Console](https://console.cloud.google.com) → **Cloud Scheduler**.
2. **Create job**:
   - **Name:** bv. `clubmatch-backup-nightly`
   - **Frequency:** `0 5 * * *` (elke nacht 05:00; timezone kies je bij “Timezone”, bijv. `Europe/Amsterdam`).
   - **Target type:** HTTP.
   - **URL:** `https://JOUW_DOMEIN/api/backup/run`
   - **HTTP method:** POST.
   - **Auth header:** Add header:
     - **Name:** `Authorization`
     - **Value:** `Bearer JOUW_BACKUP_CRON_SECRET`
   - **Body:** leeg laten (of `{}`).

3. Sla op. De job draait elke nacht om 5 uur en triggert de backup.

---

## Controle

- Logs: in de app/serverlogs zie je `[Backup API] Authorized via CRON secret` en daarna het resultaat van de backup.
- Backups bewaard: maximaal 5; de oudste wordt automatisch verwijderd (zie feature #326).
- `BACKUP_CRON_SECRET` moet exact overeenkomen met de waarde in de omgeving van de draaiende Next.js-app.
