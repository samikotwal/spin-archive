// Shared Jikan API queue with rate-limit handling + retry + localStorage cache.
// Prevents parallel components from tripping Jikan's 3 req/sec limit.

const queue: (() => void)[] = [];
let inFlight = false;
const MIN_GAP_MS = 280;

const runNext = () => {
  if (inFlight || queue.length === 0) return;
  inFlight = true;
  const fn = queue.shift()!;
  fn();
  setTimeout(() => {
    inFlight = false;
    runNext();
  }, MIN_GAP_MS);
};

const enqueue = <T>(fn: () => Promise<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    queue.push(() => {
      fn().then(resolve, reject);
    });
    runNext();
  });

export const queuedFetch = async (url: string, retries = 2): Promise<Response> => {
  return enqueue(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        if (res.status === 429 || res.status === 503) {
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 700 * (attempt + 1)));
            continue;
          }
        }
        return res;
      } catch (e) {
        if (attempt === retries) throw e;
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }
    throw new Error('unreachable');
  });
};

// -------- localStorage cache for instant paint --------
const LS_PREFIX = 'jikan_cache_v1:';
const DEFAULT_TTL_MS = 30 * 60 * 1000;

export const readLocalCache = <T,>(key: string, ttlMs = DEFAULT_TTL_MS): T | null => {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; d: T };
    if (Date.now() - parsed.t > ttlMs) return null;
    return parsed.d;
  } catch {
    return null;
  }
};

export const readStaleLocalCache = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    return (JSON.parse(raw) as { t: number; d: T }).d;
  } catch {
    return null;
  }
};

export const writeLocalCache = <T,>(key: string, data: T) => {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    /* quota — ignore */
  }
};
