#!/bin/bash

docker compose up -d --build
docker restart nginx-proxy-manager