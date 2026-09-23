export const fetchWithCache = async (
  key: string,
  fetcher: () => Promise<any>,
  ttlMinutes: number = 5
): Promise<any> => {
  const cached = sessionStorage.getItem(key);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < ttlMinutes * 60 * 1000) {
        return parsed.data;
      }
    } catch (e) {
      console.error("Cache parsing error", e);
    }
  }

  const data = await fetcher();
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (e) {
    console.error("Cache writing error", e);
  }
  return data;
};

export const clearCache = (prefix?: string) => {
  if (!prefix) {
    sessionStorage.clear();
    return;
  }
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      sessionStorage.removeItem(key);
    }
  });
};
