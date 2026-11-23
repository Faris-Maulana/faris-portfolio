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
| Data | Repository content plus an hourly curated public GitHub snapshot |
| APIs | Route Handlers plus direct OpenRouter and Resend/Fonnte HTTP adapters |
| Testing | Vitest for contracts/providers, Playwright and axe for browser behavior |
| Hosting | Vercel; the app remains portable to a normal Node 22 runtime |

## Infrastructure Atlas design system

Basalt surfaces, phosphor signal lime, mineral blue and survey lines form the
visual language. Color has a stable role: signal marks current/actionable work,
agent marks AI systems, data marks data/evaluation, cred marks documents and
threat marks limits/security. The atlas is a lightweight conceptual SVG, not
live network telemetry.

Type primitives (`t-display`, `t-h2`, `t-h3`, `t-meta`, `t-lead`, `t-body`) and
layout/surface primitives (`container`, `section`, `panel`, `corner-mark`) keep
all routes consistent. Runtime colors used by Satori and viewport metadata live
in `src/lib/design-tokens.ts`.

`npm run check:uicopy` runs the project-local mechanical UI validator. Satori
metadata images use inline styles by design, but all colors still reference the
shared palette rather than embedding local one-off colors.

## Structure

```text
src/
  app/
    page.tsx                 Server homepage composition and public repositories
    work/[slug]/page.tsx     Static case studies with architecture and limitations
    api/                     Strict chat/contact boundaries
    layout.tsx               Fonts, canonical metadata, JSON-LD and page chrome
    opengraph-image.tsx      Build-time social card from shared content
    globals.css             Infrastructure Atlas tokens and primitives
  components/
    canvas/StaticAtlas.tsx   Lightweight conceptual topology
    sections/               Server sections except small interactive islands
    layout/                 Accessible native-dialog navigation and footer
    chat/                    Cancellable, disclosed assistant interaction
    providers/               Shared reveal and reduced-motion scroll behavior
  lib/
    constants.ts            Leadership, experience and public case-study content
    case-study-details.ts   Architecture, evaluation and limitations
    contact-schema.ts       Shared client/server contact validation
    site.ts                  Validated canonical site origin
    github.ts               Public-only curation, validation and snapshot fallback
    notify.ts               Bounded notification provider adapters
public/
  cv/                       Current CV and quantitative portfolio documents
  certificates/             Public credential evidence
```

## Content and evidence policy

Case studies state their actual maturity: in development, proof of concept or
shipped. Architecture descriptions omit private schemas and records.
Quantitative method notes do not render invented series as observed charts or
turn observational associations into causal outcomes. Unsupported precision
must be removed until source artifacts can support it.

The GitHub archive is hand curated, public only and revalidated hourly. It does
not request private repository metadata or use `GITHUB_TOKEN`. A committed
snapshot covers provider outage/rate limiting without producing an empty page.

Credential entries point to issuer verification or local public documents. The
redacted diploma/transcript rasters must never be replaced with unredacted
originals.

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
30 days, sends conversation context to OpenRouter to generate responses, and
can forward recent context when the visitor deliberately includes an email.
Clear history removes only the local copy. Contact data goes to whichever
notification providers are configured.

Provider success means accepted for delivery, not guaranteed inbox receipt.

## Verification

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium
npm run verify          # typecheck, lint, unit tests, UI validator, production build
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e
npm audit --omit=dev
```

E2E tests mock paid/external API routes. A real OpenRouter evaluation must be
run deliberately with the existing local key, never in CI and never by printing
the key. Real Resend/Fonnte delivery requires local credentials; unconfigured
fallback behavior does not prove provider delivery.

The local in-memory limiter is best effort on serverless, not a global billing
quota. Configure Vercel Firewall/provider spend limits for production abuse
control. Add an atomic shared store if measured traffic requires fixed global
budgets.

## Deployment and hosting

Vercel remains the default host: ISR, Route Handlers, Next `after()` behavior and
analytics fit its runtime, and the previous production baseline did not show a
hosting bottleneck. `vercel.json` uses `npm ci` for reproducible installs.

Pushing `main` only deploys if the Vercel Git integration is connected. The saved
CLI token observed during the audit was invalid; production deployment requires
fresh interactive authentication or a working Git integration. Do not place a
deployment token in documentation or source.

For another host, provide Node 22, reverse-proxy body/rate limits, canonical
`NEXT_PUBLIC_SITE_URL`, production secrets and an analytics alternative or Vercel
runtime. Multi-instance self-hosting needs shared rate limiting and coordinated
caching. Static export is not compatible with the POST APIs.
