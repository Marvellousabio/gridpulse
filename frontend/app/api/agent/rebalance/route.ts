import { generateText } from 'ai';
import { cencori, cencoriConfigured, CENCORI_DEFAULT_MODEL } from '@/lib/cencori';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!cencoriConfigured()) {
    return Response.json({ error: 'CENCORI_API_KEY not configured' }, { status: 503 });
  }

  const body = (await req.json()) as {
    clusterId?: string;
    prompt?: string;
    model?: string;
  };

  const clusterId = body.clusterId ?? 'Ikeja';
  const prompt =
    body.prompt ??
    `Grid failure in ${clusterId}. Recommend cross-chemistry okada fleet reroute in 2 sentences.`;

  const result = await generateText({
    model: cencori(body.model ?? CENCORI_DEFAULT_MODEL),
    system:
      'You are GridPulse Balancer — chemistry-agnostic Lagos EV energy orchestrator. Be concise.',
    prompt,
  });

  return Response.json({
    clusterId,
    model: body.model ?? CENCORI_DEFAULT_MODEL,
    text: result.text,
    usage: result.usage,
  });
}
