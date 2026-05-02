// Shared parser for bulk entry input.
// Mode 'smart' (default): split on newlines, commas, semicolons, tabs, pipes.
// Mode 'lines': split ONLY on newlines (preserves commas inside names).
export type SplitMode = 'smart' | 'lines';

export function parseEntries(raw: string, mode: SplitMode = 'smart'): string[] {
  if (!raw) return [];
  const splitter = mode === 'lines' ? /\n+/ : /[\n,;\t|]+/;
  return raw
    .split(splitter)
    .map(s =>
      s
        .replace(/^\s*\(?\d+\)?\s*[.)\-:]\s*/, '')
        .replace(/^\s*[•\-*–—]\s*/, '')
        .trim()
    )
    .filter(s => s.length > 0);
}

export function dedupeAgainst(existing: string[], incoming: string[]): string[] {
  const seen = new Set(existing.map(i => i.toLowerCase()));
  const out: string[] = [];
  for (const p of incoming) {
    const k = p.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
  }
  return out;
}
