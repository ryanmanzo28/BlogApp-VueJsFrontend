#!/bin/bash

cd "/Users/ryanmanzo/Desktop/Hydracor Project 3/VueJS-Frontend" && npm install && npm run build &&
cd "/Users/ryanmanzo/Desktop/Hydracor Project 3" && docker compose up -d &&
docker compose exec backend sh -lc "/var/www/html/bin/cake migrations migrate"
echo "done"
