import { Cencori } from 'cencori';
import { createCencori, cencori as cencoriProvider } from 'cencori/vercel';

const apiKey = process.env.CENCORI_API_KEY;

/** Official Cencori SDK client (server-only). Uses SDK default base URL. */
export const cencoriClient = apiKey
  ? new Cencori({ apiKey })
  : null;

/** Vercel AI SDK provider — prefer createCencori when key is present. */
export const cencori = apiKey
  ? createCencori({ apiKey })
  : cencoriProvider;

export const CENCORI_DEFAULT_MODEL =
  process.env.CENCORI_MODEL ?? 'claude-sonnet-4.5';

export function cencoriConfigured(): boolean {
  return Boolean(apiKey);
}
