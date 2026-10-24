# PROJECT AURA — Holo-OS Phase 0 Audit

**Audit date:** 2026-10-24  
**Repository:** `warzonewarrioryt-dotcom/PROJECT-AURA`  
**Reviewed baseline:** `main`  
**Working branch:** `feature/aura-holo-os`  
**Status:** Initial static review; not a runtime or deployment verification.

## Executive summary

The existing project is a substantial Express/Node application with modular API routes and a large dashboard frontend. The safe next step is to resolve security and data-isolation risks before visual redesign. This report records findings directly visible in the reviewed source and separates them from work that still requires deeper inspection or runtime tests.

## Scope reviewed

- `backend/server.js`: middleware, static-file serving, API route mounts, health endpoints, and legacy AI endpoint setup.
- `backend/routes/auth.js`: account seeding, registration, login, password verification, and token generation.
- `backend/routes/files.js`: uploaded-file metadata, public download URLs, raw/download handlers.
- `backend/routes/analytics.js`: telemetry and performance endpoints.
- `backend/routes/voice.js`: text-to-speech request handling.
- `backend/routes/quiz.js`: initial route data and academic engine structure.

This is not yet a complete line-by-line audit of every route, frontend script, dependency, or deployment setting.

## Findings — prioritize before redesign

### P0 — Protect uploaded and student data

**Evidence:** `backend/server.js` serves the project root using `express.static(path.join(__dirname, ".."), { index: false })`, exposes `/uploads` as a static directory, and mounts APIs without a visible global authentication middleware. `backend/routes/files.js` provides download/raw handlers that look up file records and serve content without an authorization check in the reviewed handler.

**Risk:** Private uploaded course files and other static files may be reachable without proving ownership. Root static serving can also expose any sensitive file that happens to reside beneath the served root.

**Action:** Replace broad root static serving with an explicit public-assets directory/allowlist; keep uploads outside the public web root; require authenticated, owner-scoped access for file list/read/download/delete operations; verify every route's authorization before exposing personal records. Add regression tests for unauthenticated access and cross-user file access.

### P0 — Remove the seeded shared default credential

**Evidence:** `backend/routes/auth.js` seeds `manikandan@aura.ai` with password `aura123` when the user record is missing. Registration/login paths call this seed helper.

**Risk:** A known, hard-coded credential can grant access to the seeded account wherever that account is created.

**Action:** Remove the default-account seeding from production code. If migration is needed, require an explicit one-time local development seed guarded by a development-only flag and never use a published password. Rotate any credential that may have been used.

### P0 — Replace predictable login tokens and enforce session authorization

**Evidence:** Registration constructs a token as `aura_tok_${userId}_${Date.now()}`. In the reviewed server setup, API routers are mounted directly and no global session-verification middleware is visible. Analytics handlers accept `userId` from query/header/body, and file handlers do not show ownership checks in the reviewed portions.

**Risk:** A timestamp-based token is predictable and is not a secure session credential. User-supplied IDs are not proof of identity; records may be exposed or attributed to another user unless every endpoint independently validates authorization.

**Action:** Use cryptographically random, expiring sessions or a well-implemented signed-token flow; validate sessions on every protected route; derive user identity from the validated session rather than `userId` request parameters or `x-user-id`; enforce ownership on reads and writes. Add tests for expired/invalid tokens and cross-user access.

### P1 — Restrict permissive CORS

**Evidence:** `backend/server.js` configures `cors({ origin: true, credentials: true })`.

**Risk:** This reflects requesting origins while allowing credentials. It is broader than a production allowlist and increases the risk of unintended cross-origin access when combined with credentialed endpoints.

**Action:** Configure an explicit environment-based allowlist for trusted frontend origins. Reject unknown origins and test the production configuration.

### P1 — Add request size and cost controls

**Evidence:** JSON and URL-encoded body parsers are configured with a `30mb` limit. The reviewed voice endpoint forwards caller-supplied text to a text-to-speech service; other routes invoke AI services.

**Risk:** Large or repeated requests can consume memory and paid API quota.

**Action:** Use endpoint-specific payload limits, validate text length and content types, add per-user/IP rate limits and request timeouts, and enforce provider spend/quota controls. Do not rely on frontend limits.

### P1 — Improve error handling and avoid leaking internals

**Evidence:** Several reviewed handlers return `err.message` directly in 500 responses. Some failures in file enrichment are silently swallowed.

**Risk:** Internal implementation details can leak to clients, while silent fallbacks make failures difficult to diagnose.

**Action:** Return stable, user-safe error codes/messages; log detailed errors server-side with request IDs; distinguish optional enrichment failures from core upload failures; add structured logs and monitoring.

### P1 — Remove misleading/mock analytics from production output

**Evidence:** `backend/routes/analytics.js` comments describe performance results as mock data and constructs realistic grading output from activity records. Its performance handler filters by a caller-supplied user ID rather than a validated session in the reviewed code.

**Risk:** Analytics can be mistaken for verified student performance, and user isolation is not trustworthy without authenticated identity.

**Action:** Clearly label demo data in development only; production analytics must use persisted, validated submissions and session-derived ownership. Return empty/real data rather than invented scores.

### P2 — Validate and harden file handling

**Evidence:** The upload handler stores file paths and exposes a download URL of the form `/uploads/<filename>`; download/raw handlers also fall back to matching names in the upload directory.

**Risk:** Public URLs bypass per-user access checks, and fallback filename matching deserves path and ambiguity review.

**Action:** Generate server-side opaque file identifiers; validate file type, size, and filename; canonicalize paths and confirm they remain inside the upload directory; avoid original-name matching as an identifier; scan or safely parse uploads; use authorized streaming endpoints.

## Holo-OS implementation plan after security fixes

1. **Baseline tests:** identify current startup scripts, supported Node version, required environment variables, existing tests, and current build/deploy process. Record a clean baseline before changing UI.
2. **Security foundation:** address the P0 findings; document the authentication/session contract; add API authorization tests.
3. **Design system:** introduce shared tokens and reusable components for the dark holographic surfaces, cyan/violet accents, typography, focus states, reduced-motion mode, and responsive breakpoints.
4. **Shell/navigation:** preserve all existing feature entry points while refactoring navigation, command palette, onboarding, and mobile navigation.
5. **Feature migration:** update one existing screen at a time; retain API contracts unless a documented migration is required; do not substitute mock data for live functionality.
6. **Accessibility/performance:** test keyboard navigation, visible focus, contrast, semantic labels, responsive layouts, and reduced motion. Capture real Lighthouse results only from a running build.
7. **Verification:** run existing tests and add tests for changed behavior; validate frontend-to-backend flows and deployment configuration; record screenshots and actual test output.

## Acceptance checklist

- [ ] Full route inventory completed, including auth requirements and data ownership for every route.
- [ ] No hard-coded default production credentials.
- [ ] Every private API and file operation validates session and resource ownership.
- [ ] Static serving exposes only intentional public assets.
- [ ] CORS allowlist and rate limits are configured for deployment.
- [ ] Demo/placeholder analytics cannot be confused with real student results.
- [ ] Existing features and API contracts are inventoried before redesign.
- [ ] Automated tests pass; no test result is claimed without execution.
- [ ] Mobile, keyboard, reduced-motion, and contrast checks are performed.
- [ ] Deployment smoke test and performance measurements are recorded from the actual app.

## Verification limits

No application build, automated test suite, browser session, Lighthouse audit, or production deployment test has been run as part of this initial static review. Findings above are based on the cited source paths and should be confirmed with targeted tests before release. The report does not claim the application is production-secure.
