// Shared parser for bulk entry input.
// Splits on newlines, commas, semicolons, tabs, pipes; strips leading numbers/bullets.
export function parseEntries(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;\t|]+/)
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
