// Shared parser for bulk entry input.
// Mode 'smart' (default): split on newlines, commas, semicolons, tabs, pipes.
// Mode 'lines': split ONLY on newlines (preserves commas inside names).
// Both modes additionally split on inline numbered markers like "1)", "2.", "12)" so
// that a pasted block like "1) Naruto 2) Bleach 3) One Piece" splits into 3 entries
// even when it's all on a single line. Sequence is preserved.
export type SplitMode = 'smart' | 'lines';

// Insert a newline before any inline numbered marker (e.g. " 12) " or " 7. ")
// that is preceded by text on the same line. Sequence is preserved.
const preSplitInlineMarkers = (raw: string): string =>
  raw.replace(/(\S)[ \t]+(?=\d{1,3}[.)][ \t])/g, '$1\n');

export function parseEntries(raw: string, mode: SplitMode = 'smart'): string[] {
  if (!raw) return [];
  const preprocessed = preSplitInlineMarkers(raw);
  const splitter = mode === 'lines' ? /\n+/ : /[\n,;\t|]+/;
  return preprocessed
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
