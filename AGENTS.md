<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Gate

`npm run verify` = `tsc --noEmit` + `eslint . --max-warnings 0` + `next build` (no env needed), same as CI
(`.github/workflows/verify.yml`). Do not claim done without its output. Secrets only in `.env.local` / Vercel env;
`.githooks/pre-commit` blocks them (enable per clone: `git config core.hooksPath .githooks`).
