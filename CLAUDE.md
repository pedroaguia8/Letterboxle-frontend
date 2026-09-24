# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Letterboxle is a Wordle-style daily movie-guessing game. This repo is the React frontend only — the backend (Go, consumed via a REST API) lives in a separate repository and is not present here.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run lint` — run ESLint over the project
- `npm run preview` — serve the production build locally
- `npm test` — run the Vitest unit tests once (`npx vitest` for watch mode)

Tests live next to the code as `*.test.js`. Only pure logic is tested so far (`src/movieMatching.js`); there are no component tests.

## Architecture

- Single-page app, no router, no state management library — all game state lives in `useState` hooks in `src/App.jsx`.
- `src/App.jsx` owns the entire game flow: fetches the daily puzzle, tracks the current guess index, guess history, win/loss status, and builds the shareable result text (copied to clipboard, Wordle-style emoji grid).
- `src/MovieSearch.jsx` is a debounced (500ms) autocomplete input that filters the movie list fetched by `App.jsx` and reports the selected movie back up via `onSelectMovie`. The matching and ranking of suggestions lives in `src/movieMatching.js`.
- `src/Modal.jsx` is a generic presentational modal (open/close/children) used for the end-of-game summary.
- API calls go through relative `/api/...` paths (`/api/movie_of_the_day/today`, `/api/movies?search_query=...`). In dev, `vite.config.js` proxies `/api` to `http://localhost:8080` (the Go backend must be running locally for `npm run dev` to work end-to-end). In production, Nginx serves the built static files directly (see `nginx.conf`) and `/api` is expected to be routed to the backend by the surrounding infra (reverse proxy), not by this repo.

## Deployment

- `Dockerfile` is a two-stage build: Node builds the Vite app, then an `nginx:stable-alpine` image serves the static `dist/` output. `nginx.conf` does SPA fallback routing (`try_files ... /index.html`).
- `docker-compose.yml` builds and runs the `frontend` service on an external `npm` Docker network (expects an existing `nginx-proxy-manager` setup fronting it).
- `deploy.sh` rebuilds the image with `--no-cache`, brings the compose stack up, and restarts `nginx-proxy-manager`. It's meant to be run directly on the deployment host, not in CI.
