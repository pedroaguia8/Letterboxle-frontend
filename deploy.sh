#!/bin/bash

read -s -p "Enter the DATABASE_URL: " DATABASE_URL_FROM_USER
echo ""

export DATABASE_URL_FROM_USER

docker compose down
docker compose up -d --build
