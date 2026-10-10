export type StateRepository<T> = {
  read: () => T;
  write: (value: T) => void;
  clear: () => void;
};

export function createBrowserRepository<T>(key: string, fallback: T): StateRepository<T> {
  return {
    read() {
      const serialized = window.localStorage.getItem(key);
      if (serialized === null) return fallback;
      try {
        return JSON.parse(serialized) as T;
      } catch {
        console.warn(`Les données locales "${key}" sont invalides ; la valeur par défaut est utilisée.`);
        return fallback;
      }
    },
    write(value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    clear() {
      window.localStorage.removeItem(key);
    },
  };
}
