import { streamText } from 'ai';
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
    `Grid failure in ${clusterId}. Stream ASSESS, FORECAST, ALLOCATE, REROUTE, SETTLE lines.`;

  const result = streamText({
    model: cencori(body.model ?? CENCORI_DEFAULT_MODEL),
    system:
      'You are GridPulse Balancer. Output exactly 5 short lines prefixed ASSESS:, FORECAST:, ALLOCATE:, REROUTE:, SETTLE:.',
    prompt,
  });

  return result.toTextStreamResponse();
}
