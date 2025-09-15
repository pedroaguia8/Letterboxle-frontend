#!/bin/bash

read -s -p "Enter the DATABASE_URL: " DATABASE_URL_FROM_USER
echo ""

# Check if the user actually entered a new value
if [ -n "$DATABASE_URL_FROM_USER" ]; then
    echo "New DATABASE_URL provided. Exporting it for this session..."
    export DATABASE_URL_FROM_USER
else
    echo "No new URL provided. Using the existing one for the deployment."
fi

docker compose up -d --build
