import { cencoriClient, cencoriConfigured, CENCORI_DEFAULT_MODEL } from '@/lib/cencori';

export const runtime = 'nodejs';

/** Non-streaming SDK smoke — OpenAI-compatible shape via official client. */
export async function GET() {
  if (!cencoriConfigured() || !cencoriClient) {
    return Response.json({ ok: false, error: 'CENCORI_API_KEY not configured' }, { status: 503 });
  }

  const response = await cencoriClient.ai.chat({
    model: CENCORI_DEFAULT_MODEL,
    messages: [{ role: 'user', content: 'Reply with exactly: GridPulse Cencori OK' }],
    maxTokens: 32,
  });

  return Response.json({
    ok: true,
    content: response.content,
    usage: response.usage,
  });
}
