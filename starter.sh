#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
docker compose down 
cd "$SCRIPT_DIR/VueJS-Frontend"
npm install
npm run build

cd "$SCRIPT_DIR"
docker compose up -d --build
docker compose exec backend sh -lc "/var/www/html/bin/cake migrations migrate"
echo "done"
