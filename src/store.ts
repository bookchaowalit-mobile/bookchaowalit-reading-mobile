import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCallback, useEffect, useState} from 'react';
import {
  STORAGE_KEYS,
  parseGoals,
  parseVentures,
  type Goal,
  type Venture,
} from './lib/business';

/**
 * Tiny persisted store. Every save notifies all mounted screens, so the
 * Dashboard reflects changes made on the Ventures/Goals tabs (tabs stay
 * mounted, so load-on-mount alone showed stale numbers).
 */
type Key = keyof typeof STORAGE_KEYS;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

function useStoredList<T>(key: Key, parse: (json: string | null) => T[]) {
  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(parse(await AsyncStorage.getItem(STORAGE_KEYS[key])));
    } catch {
      setError('Could not load saved data.');
    }
  }, [key, parse]);

  useEffect(() => {
    load();
    listeners.add(load);
    return () => {
      listeners.delete(load);
    };
  }, [load]);

  const save = useCallback(
    async (next: T[]) => {
      setItems(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEYS[key], JSON.stringify(next));
        setError(null);
        notify();
      } catch {
        setError('Could not save — changes may be lost.');
      }
    },
    [key],
  );

  return {items, save, error};
}

export const useVentures = () =>
  useStoredList<Venture>('ventures', parseVentures);
export const useGoals = () => useStoredList<Goal>('goals', parseGoals);

/** Remove only this app's keys (AsyncStorage.clear() wipes every key). */
export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  notify();
}
