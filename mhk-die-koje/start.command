#!/bin/bash
# Doppelklick-Server für „MHK: Die Koje“.
# Startet einen lokalen Webserver im Repo-Root und öffnet die Versionsübersicht.
# Beenden: Terminal-Fenster schließen oder Ctrl+C.
cd "$(dirname "$0")/.." || exit 1
PORT=8080
while lsof -i :"$PORT" >/dev/null 2>&1; do PORT=$((PORT + 1)); done
URL="http://localhost:$PORT/mhk-die-koje/"
echo "Die Koje läuft auf $URL"
(sleep 1 && open "$URL") &
python3 -m http.server "$PORT"
