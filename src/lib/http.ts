/**
 * Read a fetch Response that is *supposed* to be JSON but might not be —
 * Railway's edge, a proxy, or an upstream can return plain text like
 * "upstream error". Never throws on a parse failure; returns `{ error }`.
 */
export async function readJson<T = unknown>(res: Response): Promise<T & { error?: string }> {
  const text = await res.text();
  if (!text) {
    return (res.ok ? {} : { error: `Request failed (${res.status})` }) as T & { error?: string };
  }
  try {
    return JSON.parse(text) as T & { error?: string };
  } catch {
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 200);
    return { error: snippet || `Request failed (${res.status})` } as T & { error?: string };
  }
}
