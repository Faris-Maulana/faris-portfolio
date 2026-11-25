# Faris Maulana, Infrastructure Atlas

AI engineering leadership portfolio for Faris Maulana, Manager of AI Engineering
at PT Trans Indonesia Superkoridor. The site presents architecture decisions,
system maturity, evaluation practice and public credential evidence without
publishing private operational data.

Live: https://faris-portfolio-red.vercel.app

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 with semantic tokens in `src/app/globals.css` |
| Typography | Self-hosted Archivo variable display and Source Sans 3 body |
| Motion | One progressive IntersectionObserver, reduced-motion aware CSS and Lenis |
| Data | Typed project evidence, editorial repository manifest and hourly public GitHub metadata |
| Simulation | Deterministic TypeScript event sourcing, policy evaluation and replay for SIMPUL |
| APIs | Route Handlers plus direct OpenRouter and Resend/Fonnte HTTP adapters |
| Testing | Vitest for contracts/providers, Playwright and axe for browser behavior |
| Hosting | Vercel; the app remains portable to a normal Node 22 runtime |

## Infrastructure Atlas design system

Basalt surfaces, phosphor signal lime, mineral blue and survey lines form the
visual language. Color has a stable role: signal marks current/actionable work,
agent marks AI systems, data marks data/evaluation, cred marks documents and
threat marks limits/security. The atlas renders source-derived, geometry-only
SVG corridors from an authorized infrastructure KMZ over Natural Earth land.
Placemarks, points, names, styles and operational metadata are excluded. Routes
are simplified for public display and do not represent live network telemetry.

Type primitives (`t-display`, `t-h2`, `t-h3`, `t-meta`, `t-lead`, `t-body`) and
layout/surface primitives (`container`, `section`, `panel`, `corner-mark`) keep
all routes consistent. Runtime colors used by Satori and viewport metadata live
in `src/lib/design-tokens.ts`.

`npm run check:uicopy` runs the project-local mechanical UI validator. Satori
metadata images use inline styles by design, but all colors still reference the
shared palette rather than embedding local one-off colors.

## SIMPUL proving ground

`/simpul` is a standalone Flight Recorder interface for replaying synthetic
fiber incidents. Six scenarios cover hard cuts, progressive optical degradation,
duplicate/stale alerts, missing and contradictory telemetry, indirect prompt
injection, and maintenance-approval binding. Its product rule is: the model
proposes, deterministic controls decide, and every action can be replayed and
challenged.

The initial vertical slice is implemented locally in TypeScript. It includes
seeded scenarios, an append-only run record, reconstruction at any event,
counterfactual approve/reject branches, topology and evidence views, and replay
export. Guided review exposes each scenario's learning objective, links to the
current event/topology/evidence/policy sections, and seeks recorded inception,
impact, proposal, decision and outcome stages without adding simulator behavior.
On narrow screens the review stages and synthetic topology use labeled internal
scroll regions. Approval is read only from typed envelopes bound to the exact run,
action, target and validity window; prose inside a ticket or runbook grants no
authority. Approved actions change only simulator state.

**Boundary:** these are labeled deterministic reference traces, not an evaluation
of a live language model. The slice has no FastAPI service, live topology,
production network command path, or measured incident-response performance.
The topology and all operational records are synthetic.

## Structure

```text
src/
  app/
    page.tsx                 Proof-first homepage composition and public repositories
    simpul/                  Standalone synthetic incident proving ground
    work/[slug]/page.tsx     Static case studies with evidence and limitations
    api/                     Strict chat/contact boundaries
    layout.tsx               Fonts, canonical metadata, JSON-LD and page chrome
    opengraph-image.tsx      Build-time social card from shared content
    globals.css             Infrastructure Atlas tokens and primitives
  components/
    canvas/StaticAtlas.tsx   Source-derived public infrastructure corridors
    sections/               Server sections except small interactive islands
    simpul/                 Flight Recorder topology, evidence and transport UI
    work/EvidenceLedger.tsx  Typed artifact/provenance presentation
    layout/                 Accessible native-dialog navigation and footer
    chat/                    Cancellable, disclosed assistant interaction
    providers/               Shared reveal and reduced-motion scroll behavior
  data/
    infrastructure-atlas.ts  Generated geometry-only routes and land paths
  lib/
    constants.ts            Leadership, experience and public case-study content
    case-study-details.ts   Architecture, evaluation and limitations
    chat-context.ts         Bounded public-record grounding and answer contract
    chat-guard.ts           Deterministic private-data and exact-evidence responses
    chat-sources.ts         Static editorial links resolved from pinned artifacts
    evidence.ts             Evidence types, ranking and runtime policy validation
    evidence-content.ts     Project ledgers, pinned artifacts and editorial repository manifest
    simpul/                 Synthetic scenarios, simulator, replay, branching and policy gate
    contact-schema.ts       Shared client/server contact validation
    site.ts                  Validated canonical site origin
    github.ts               Public-only curation, validation and snapshot fallback
    notify.ts               Bounded notification provider adapters
scripts/
  generate-infrastructure-atlas.py  Authorized KMZ to public geometry artifact
  generate-cv.mjs                  Reproducible two-page executive CV
  generate-quantitative-methods.py Methodology-only public PDF, without result claims
  chat-eval-cases.json             Nineteen versioned ARIA live-smoke cases
  chat-eval-contract.mjs           Deterministic assertions and run-report contract
  evaluate-chat.mjs                Deliberate live HTTP runner; no visitor contact prompts
public/
  cv/                       Current CV and quantitative portfolio documents
  certificates/             Public credential evidence
```

## Content and evidence policy

Case studies distinguish public reference implementations, proofs of concept,
in-development systems and internal deployments. Architecture descriptions
omit private schemas and records. A public reference is inspectable source, not
an enterprise deployment or independently verified operational outcome.

`src/lib/evidence.ts` defines the artifact and provenance contract. Every case
attaches its strongest existing evidence, data exposure and result boundary in
`src/lib/evidence-content.ts`; test runs, committed reports, interactive demos
and architecture prose are different levels. External source/results use full
commit revisions. `artifact-inspection` never means a fresh local execution;
`local-run` requires an actual command and observation timestamp. The
`nextEvidence` collection is planned work, not a result payload. Unit tests
validate registry coverage, unique identities, safe references, evidence-level
consistency and these provenance rules.

ARIA adds only the public case-study records selected by the latest user message
to its model prompt; assistant history cannot inject a different project record.
High-confidence private-record extraction, exact public evaluation values,
bounded technical/maturity/evidence questions and public-role integrity checks
receive deterministic responses without provider invocation. Open-ended answers
remain model-generated. Model-generated URLs are
removed from the reply because validated static `sources` are the only link
channel. Responses expose non-secret `mode` and `model` metadata so live-smoke
reports distinguish deterministic responses from attributed provider output.

Quantitative method notes do not render invented series as observed charts or
turn observational associations into causal outcomes. Unsupported precision
must be removed until source artifacts can support it. The downloadable
quantitative document therefore contains methods, required provenance and
limitations rather than historical performance claims.

The GitHub archive is hand curated, public only and revalidated hourly. It does
not request private repository metadata or use `GITHUB_TOKEN`. Editorial
case descriptions and canonical repository URLs come from the evidence manifest,
not mutable upstream descriptions. A committed four-repository snapshot covers
provider outage/rate limiting and partial API responses without producing an
empty page.

Credential entries point to issuer verification or local public documents. The
redacted diploma/transcript rasters must never be replaced with unredacted
originals.

The raw infrastructure KMZ stays outside the repository. After receiving an
updated authorized source, regenerate the sanitized route asset with Python 3
and a local path. The generator fetches public-domain Natural Earth land data:

```bash
python3 scripts/generate-infrastructure-atlas.py "/path/to/authorized-source.kmz"
```

## Local development

Node 22.12 or newer is required.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Every provider credential is optional and server-only. Without OpenRouter the
assistant reports itself unavailable. Without Resend/Fonnte, contact uses the
existing prefilled email/WhatsApp handoff after the API reports that delivery
is unconfigured. Do not paste provider credentials into source, docs or chat.

There is no application database. Chat stores a capped browser copy for up to
30 days and filters retention per message on restore, persistence and outbound
requests. Recent retained conversation context goes to OpenRouter for open-ended
responses. Only the latest message is forwarded for owner notification when the
visitor deliberately includes an email in that latest message. The correlation
identifier is random, per-tab `sessionStorage`, never identity evidence, and any
legacy persistent identifier is removed when chat next runs. Clear history removes
the local transcript and correlation identifier; it does not request deletion of
provider-side records.

The browser cancels chat requests after 35 seconds. The route uses one 30-second
end-to-end deadline across all provider attempts and notification, composes
timeout signals with incoming request cancellation, and gives notification only
the remaining budget. Provider success means accepted for delivery, not
guaranteed inbox receipt. Contact data goes to whichever notification providers
are configured.

Vercel Analytics is mounted only on Vercel. The bounded event layer in
`src/lib/analytics.ts` counts CV downloads, case contact actions, SIMPUL run and
replay export, ARIA open/first-question/handoff and contact provider/fallback
outcomes. Properties are limited to static placement, case/scenario identifiers
and status enums; message bodies, form values and email addresses are excluded.
`contact_provider_accepted` intentionally does not claim inbox delivery or lead
conversion. Event payload contracts are tested through a mocked transport and
browser interception; production Analytics dashboard ingestion is a separate
operational check.

## Generated public documents

Both documents are regenerated from checked-in source rather than edited as
opaque binaries. The CV renderer uses the same isolated Playwright Chromium
installation as browser tests:

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run generate:cv
python3 -m venv .venv-pdf
.venv-pdf/bin/pip install 'reportlab==5.1.1' 'pypdf==6.6.2'
.venv-pdf/bin/python scripts/generate-quantitative-methods.py
.venv-pdf/bin/python scripts/verify-cv-pdfs.py
```

`.venv-pdf` is local-only and gitignored. Poppler tools such as `pdfinfo` and
`pdftotext` can verify page count and searchable text. The verifier also checks
page budgets, positive-area URI annotations, required evidence links and available
structure tagging. The two-page executive CV includes tagged Chromium structure
and linked annotations. The six-page quantitative PDF has real URI annotations
but remains untagged because the installed ReportLab API does not expose a
structure tree. These checks do not establish PDF/UA conformance or screen-reader
reading order; HTML case studies remain the accessible evidence surface.

## Security headers

`next.config.ts` publishes `nosniff`, a strict-origin referrer policy, frame and
permissions controls, and HSTS matching the existing Vercel production policy.
Do not widen the HSTS subdomain scope without an HTTPS inventory. The enforced CSP
publishes `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` and
`frame-ancestors 'self'`. Production deliberately omits `unsafe-eval`; browser-side
Zod validation is configured as jitless so its `Function` probe is never reached.
Development alone permits `unsafe-eval` for framework tooling. Inline scripts and
styles remain allowed, so this is defense in depth rather than a strict nonce-based
XSS boundary. `tests/e2e/security-headers.spec.ts` inspects built HTTP responses and
checks hydration plus contact validation for CSP violations.

## Verification

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium firefox webkit
npm run verify          # typecheck, lint, unit tests, UI validator, production build
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e -- --browser=all
npm audit --audit-level=low
```

E2E tests mock paid/external API routes. Browser coverage includes 320px reflow,
wide desktop collision checks, no-JavaScript content/filter workflows, reduced
motion, recorder anchors, keyboard/touch/focus behavior, structured metadata and
privacy-safe analytics. Axe checks fail on every violation with configured WCAG
A/AA tags rather than discarding lower-impact results; automated axe results are
not a substitute for manual screen-reader or cross-browser conformance review.
On macOS 27, Firefox 159 may exit before launching a page with `Could not find
profile folder` while resolving its protected shared app-data directory. Redirect
only that Firefox runtime directory into the project; no application or test
behavior changes:

```bash
mkdir -p "$PWD/.playwright-browsers/tmp/moz-app-data"
MOZ_APP_DATA="$PWD/.playwright-browsers/tmp/moz-app-data" PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e -- --browser=all
```

A real OpenRouter evaluation must be
run deliberately with the existing local key, never in CI and never by printing
the key. Real Resend/Fonnte delivery requires local credentials; unconfigured
fallback behavior does not prove provider delivery.

The ARIA harness has 19 versioned live-smoke cases across architecture,
maturity, privacy, instruction resistance, comparisons, evaluation evidence and
static editorial source behavior. Offline dataset and contract tests run in
`npm test`. With a deliberately configured local server running, execute:

```bash
npm run evaluate:chat
# Optional target and non-secret configuration hints:
EVAL_BASE_URL=http://127.0.0.1:3000 EVAL_MODEL='provider/model' npm run evaluate:chat
```

Each report includes UTC timing, dataset version, Git commit, raw responses,
HTTP status, latency, failure reasons and an explicit smoke-test warning in
`eval-results/chat-evals/` (gitignored and separate from Playwright's cleaned output). Raw responses are not printed to
stdout. Successful responses include deterministic/model mode and actual model
attribution; prompt revision and uncommitted deployment provenance may still be
null or unavailable. `EVAL_MODEL` is only a configuration hint, not proof of the
responder. The fixed cases exercise deterministic portfolio controls, not model
quality or general production evaluation; use a separate open-ended query with
`mode: model` to verify provider availability. No live report is bundled as a
passing claim. Inspect a local report, including its failure modes and response
metadata, before sharing it.

The local in-memory limiter is best effort on serverless, not a global billing
quota. Configure Vercel Firewall/provider spend limits for production abuse
control. Add an atomic shared store if measured traffic requires fixed global
budgets.

## Deployment and hosting

Vercel remains the default host: ISR, Route Handlers, Next `after()` behavior and
analytics fit its runtime, and the previous production baseline did not show a
hosting bottleneck. `vercel.json` uses `npm ci` for reproducible installs.

This project is linked through the Vercel CLI and has no Git integration, so
pushing does not deploy. Check authentication with `vercel whoami`, then run
`vercel --prod --yes` from the repository root and verify the public alias. If
source changes need to land in Git, use a branch and pull request because `main`
is protected. Never place a deployment token in documentation or source.

For another host, provide Node 22, reverse-proxy body/rate limits, canonical
`NEXT_PUBLIC_SITE_URL`, production secrets and an analytics alternative or Vercel
runtime. Multi-instance self-hosting needs shared rate limiting and coordinated
caching. Static export is not compatible with the POST APIs.
