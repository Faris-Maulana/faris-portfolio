export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET() {
  const configured = Boolean(process.env.OPENROUTER_API_KEY?.trim())

  return Response.json(
    {
      status: configured ? 'ok' : 'misconfigured',
      runtime: 'ready',
      bindings: { OPENROUTER_API_KEY: configured },
    },
    {
      status: configured ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
