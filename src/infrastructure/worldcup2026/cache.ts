type CacheEntry<TValue> = {
  expiresAt: number;
  value: TValue;
};

const responseCache = new Map<string, CacheEntry<unknown>>();

export async function getOrSetCache<TValue>(
  key: string,
  ttlMs: number,
  load: () => Promise<TValue>,
): Promise<TValue> {
  const cached = responseCache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as TValue;
  }

  const value = await load();
  responseCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });

  return value;
}
