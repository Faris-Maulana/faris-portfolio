# faris-portfolio

Personal site for Faris Maulana. AI Engineering Manager at PT Trans Indonesia
Superkoridor, working on multi-agent LLM systems and medallion data platforms
over a 25,000 km DWDM fiber backbone.

Live: https://faris-portfolio-red.vercel.app

## Stack

| Layer     | Choice                                                                              |
| --------- | ----------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                                                    |
| Language  | TypeScript, React 19                                                                  |
| Styling   | Tailwind CSS v4 with a token layer in `globals.css`                                   |
| Type      | `next/font` (Inter, Inter Tight, JetBrains Mono, Instrument Serif)                     |
| Motion    | CSS transitions driven by one IntersectionObserver. Framer Motion for overlays only    |
| 3D        | react-three-fiber, a single scene in the hero                                          |
| Data      | Supabase (blog, chat, analytics) and the GitHub REST API                               |
| Hosting   | Vercel                                                                                |

## Design system

Everything visual comes from `src/app/globals.css`. Colours are semantic rather
than decorative: each accent maps to a domain, so a violet chip always means
agent or LLM work and a coral one always means security.

```
signal  #5CF2C0   platform, live systems, primary action
agent   #8B7BFF   AI, LLM, multi-agent
data    #58B9FF   data engineering, BI
cred    #FFB454   credentials and documents
threat  #FF6B7A   security research
```

Type primitives (`t-display`, `t-h2`, `t-h3`, `t-label`, `t-lead`, `t-body`) and
surface primitives (`panel`, `ticks`, `rule`) keep eight independently built
sections reading as one publication.

## Structure

```
src/
  app/
    page.tsx              server component, fetches repos, composes sections
    layout.tsx            fonts, metadata, Person JSON-LD, page chrome
    opengraph-image.tsx   link preview card, generated from live constants
    sitemap.ts robots.ts
  components/
    canvas/               hero backbone visual (topology generator + renderer)
    sections/             one file per section
    layout/               navbar, footer
    providers/            reveal observer, smooth scroll
    ui/                   shared primitives
  lib/
    constants.ts          site copy and CV data
    credentials.ts        certifications, served from /public
    github.ts             live repo fetch with a committed snapshot fallback
public/
  cv/                     CV and portfolio PDFs
  certificates/           certification documents
```

## Content

Site copy lives in `src/lib/constants.ts`. Credentials live in
`src/lib/credentials.ts` and point at files in `public/certificates`. Neither
depends on a database, so both render even when Supabase is unreachable.

The GitHub archive in the Projects section is fetched live and revalidated
hourly. `src/data/github-repos.json` is a committed snapshot used when the API
is rate limited, so the section is never empty.

To refresh the snapshot:

```bash
curl -s "https://api.github.com/users/Faris-Maulana/repos?per_page=100&sort=updated" > /tmp/repos.json
```

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Supabase keys. The site
renders without them. Only the blog, chat, and analytics routes need them.

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Deploying

The Vercel project is linked through the CLI, not the GitHub app, so **pushing
to `main` does not deploy anything**. Until the repository is connected in the
Vercel dashboard, production only updates when someone runs:

```bash
npx vercel --prod --yes
```

## Notes

- Sections render on the server. They were previously client-only dynamic
  imports, which meant crawlers received a hero and seven loading skeletons.
- The homepage must stay statically prerendered. Anything that reads `cookies()`
  during its render, including the cookie-backed Supabase client, silently opts
  the whole route into per-request rendering. `lib/posts.ts` uses a plain anon
  client for that reason.
- The hero canvas suspends its render loop once the hero leaves the viewport.
- Reduced motion disables the canvas, the smooth scroll, and every reveal.
- The diploma and transcript in `public/certificates` are redacted rasters. The
  national ID, student number, and date of birth are painted over the pixels
  before encoding, so there is no text layer and no removable overlay. Never
  replace them with the originals.
