# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Letterboxle is a Wordle-style daily movie-guessing game, live at letterboxle.pedroaguia8.dev. This repo is the React frontend only. The Go backend is in a separate repository (usually checked out next to this one as `../Letterboxle-backend`), and it owns the API contract.

## Commands

- `npm run dev`: start the Vite dev server
- `npm run build`: production build to `dist/`
- `npm run lint`: run ESLint over the project
- `npm run preview`: serve the production build locally
- `npm test`: run the Vitest unit tests once (`npx vitest` for watch mode)
- `npx vitest run src/movieMatching.test.js -t "ranking"`: run a single test file or a single test by name

Tests sit next to the code as `*.test.js`. So far only pure logic is tested (`src/movieMatching.js`). There are no component tests. CI runs lint, tests and the build (see CI/CD).

## Architecture

- Single-page app with no state-management library. `src/main.jsx` wraps the app in `StrictMode` and `BrowserRouter`. `src/App.jsx` only holds the routes (`/` → `Game`, `/privacy` → `Privacy`, `/about` → `About`, anything else → `NotFound`) and the `Footer` that links to the two static pages. `About` and `Privacy` share `StaticPage.css`. `Privacy` is a placeholder for now.
- `src/Game.jsx` runs the whole game flow. All game state lives in `useState` hooks there. Nothing is saved: a page refresh resets the day's game.
- On mount `Game` makes two independent fetches, each with its own error and retry UI:
  - `GET /api/movie_of_the_day/today` returns the answer and its hint fields.
  - `GET /api/movies` returns the full lightweight `{id, title, year}` list, fetched once and filtered client-side. There's no server-side search.
- Each fetch is defined inside its own `useEffect`, which depends on an attempt counter (`puzzleAttempt` / `movieListAttempt`). Retry increments the counter, so the effect runs again. Don't move the fetches back out into component-level functions: `react-hooks/set-state-in-effect` flags an effect that calls one. Each effect also has an `ignore` flag set by its cleanup, so a response that arrives late (StrictMode's double run in dev, or unmount) doesn't set state.
- The six hints are built in a fixed order in the puzzle fetch: tagline, genre, director, actor 1, actor 2, year. `hints.length` is the maximum number of guesses. Each wrong guess or skip reveals the next hint and adds an emoji to `guessHistory`. That history becomes the Wordle-style share grid that `handleShare` copies to the clipboard.
- Guesses are checked by movie `id`, not by title. The puzzle date is formatted in UTC to match the backend's UTC day boundary.
- `src/MovieSearch.jsx` is a debounced (500ms) autocomplete input. Typing clears the current selection (`onSelectMovie(null)`), which keeps Submit disabled until a suggestion is clicked. It shows the year only when two suggestions share a title, because the year is itself a hint.
- `src/movieMatching.js` (`findSuggestions`) holds the matching and ranking logic. Matching ignores accents and punctuation. Results are ranked in tiers (exact match, title prefix, word prefix, substring), then by shorter title, and capped at `maxSuggestions`. Tiers are ranked before the cap is applied, so an exact match can never be dropped. The test file documents the intended behaviour case by case.
- `src/Modal.jsx` is a generic presentational modal used for the end-of-game summary.
- Styling is plain CSS (`index.css`, `App.css`, `Modal.css`, `Footer.css`, `StaticPage.css`), with no CSS framework. API calls use `fetch`.
- Lint is ESLint 10 flat config (`eslint.config.js`) with `eslint-plugin-react-hooks` 7's `configs.flat.recommended`. In v7 the top-level presets (`configs.recommended` etc.) are legacy eslintrc configs and crash ESLint 10, and `configs.flat['recommended-latest']` adds experimental React Compiler rules.
- API calls use relative `/api/...` paths. In dev, `vite.config.js` proxies `/api` to `http://localhost:8080`, so the Go backend must be running locally for `npm run dev` to work end-to-end. In production, Nginx serves only the static files (see `nginx.conf`, which has an SPA fallback, so `/about` and `/privacy` load on a direct visit). The surrounding reverse proxy routes `/api` to the backend, not this repo.

## Deployment

- `Dockerfile` is a two-stage build: Node (`node:24…-alpine`) builds the Vite app, then `nginxinc/nginx-unprivileged` (mainline `1.31.x-alpine`) serves `dist/` as a non-root user on port 8080 (non-root can't bind ports below 1024, so don't move `nginx.conf` back to 80). Both base images are pinned by version and digest, and Renovate bumps them.
- `docker-compose.yml` builds and runs the `frontend` service on an external `npm` Docker network, behind an existing `nginx-proxy-manager` (its letterboxle proxy host forwards to `letterboxle-frontend:8080`). As in the backend, don't run it locally: the `npm` network only exists on the prod host.
- `deploy/letterboxle-frontend.container` is the Podman quadlet for the new server (ASUS, rootless Podman under the `apps` user; replaces `docker-compose.yml` at cutover). `Image=@IMAGE@` is a placeholder the deploy fills in with `ghcr.io/pedroaguia8/letterboxle-frontend:<sha>@sha256:<digest>`. It joins only the `web` network (Caddy routes to `letterboxle-frontend:8080`; never `db`) and runs with a read-only root, which works because nginx-unprivileged keeps its pid and temp files in `/tmp` (tmpfs under `ReadOnly=true`). Those names are a contract with the `homelab` repo (`docs/04-services.md`); renaming one changes both. Until the new deploy path exists it's installed by hand.

## CI/CD

- `ci.yml`: on PR/push to `main` or `dev`, runs tests and the build in one job, and lint in a separate job. Both use `npm ci` on Node 24. On push to `main` only, it also builds and pushes the image to GHCR.
- `cd.yml`: triggers when the `ci` workflow completes successfully on `main` (not directly on push). It SSHes into the prod host through a cloudflared tunnel, runs `git pull` in `~/Letterboxle-frontend`, rebuilds the image with `docker compose build --no-cache` (deliberately uncached, because cached builds caused bugs before), and brings the stack up. (It used to also restart `nginx-proxy-manager`; that was only needed because NPM's `/api` route cached the backend's IP, fixed in NPM's config on 2026-10-06. NPM re-resolves the frontend's container name on its own.) It uses the same `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` and `SSH_KNOWN_HOSTS` secrets as the backend. The frontend needs no app secrets.

## Git workflow

- Two long-lived branches: `dev` (integration) and `main` (prod). Every change goes on a short-lived branch cut from `dev` and into `dev` through a PR (`gh pr create --base dev`, since `main` stays the default branch). Never push directly to either.
- Merge PRs into `dev` with a rebase merge (linear history, no merge commits), and delete the branch once it's merged.
- `dev` doesn't deploy anywhere; it only runs CI. Releasing is a separate, deliberate step, done only when asked: open a PR from `dev` into `main` (so CI runs on it), then merge it by fast-forwarding, `git push origin dev:main` (GitHub marks the PR merged). Don't use any GitHub merge button for `dev` → `main`: they all rewrite or add commits, so `main` would diverge from `dev`. Merging to `main` deploys to prod. Never commit to `main` anything that isn't already on `dev`, so the fast-forward always works.
- Renovate (Mend GitHub App, config in `renovate.json`) opens dependency PRs into `dev`: it reads its config from `main` (so config changes only apply after a release) and scans `dev`'s files because of `baseBranchPatterns`. If `dev` is ever retired, change `baseBranchPatterns` in the same change, or Renovate silently stops. Dependabot only alerts (it scans `main`, so an open alert means the vulnerable version is live); its security and version update PRs stay off.
- When a Renovate `security` PR merges into `dev`, release to `main` right away instead of waiting for the next release.
- Don't leave branches lying around. If one exists, check whether it's already in `dev` (`git log dev..<branch>`) and either open a PR for it or delete it. Exception: `renovate/*` branches belong to Renovate, which deletes them itself when their PRs merge or close, so leave them alone.
- The same rules apply to the backend repo (`../Letterboxle-backend`).
