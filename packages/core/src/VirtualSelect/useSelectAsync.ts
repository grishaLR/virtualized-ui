import { useRef, useCallback, useState, useEffect } from 'react';
import type { AsyncConfig, OptionsOrGroups } from './types';

const DEFAULT_DEBOUNCE_MS = 300;
const MAX_CACHE_SIZE = 50;

export interface UseSelectAsyncReturn<TOption> {
  asyncOptions: OptionsOrGroups<TOption>;
  isLoading: boolean;
  loadAsync: (input: string) => void;
  debouncedLoadAsync: (input: string) => void;
}

export function useSelectAsync<TOption>(
  asyncConfig: AsyncConfig<TOption> | undefined
): UseSelectAsyncReturn<TOption> {
  const [asyncOptions, setAsyncOptions] = useState<OptionsOrGroups<TOption>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadIdRef = useRef(0);
  const cacheRef = useRef<Map<string, { data: OptionsOrGroups<TOption>; expiresAt: number }>>(
    new Map()
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const loadAsync = useCallback(
    (input: string) => {
      if (!asyncConfig) return;

      // Check cache
      const cached = cacheRef.current.get(input);
      if (cached && cached.expiresAt > Date.now()) {
        setAsyncOptions(cached.data);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const currentLoadId = ++loadIdRef.current;

      asyncConfig.loadOptions(input).then(
        (result) => {
          // Stale guard
          if (currentLoadId !== loadIdRef.current) return;

          setAsyncOptions(result);
          setIsLoading(false);

          // Cache
          if (asyncConfig.cacheTtlMs && asyncConfig.cacheTtlMs > 0) {
            cacheRef.current.set(input, {
              data: result,
              expiresAt: Date.now() + asyncConfig.cacheTtlMs,
            });
            // Evict oldest entry if cache exceeds max size
            if (cacheRef.current.size > MAX_CACHE_SIZE) {
              const oldestKey = cacheRef.current.keys().next().value;
              if (oldestKey !== undefined) cacheRef.current.delete(oldestKey);
            }
          }
        },
        () => {
          if (currentLoadId !== loadIdRef.current) return;
          setIsLoading(false);
        }
      );
    },
    [asyncConfig]
  );

  const debouncedLoadAsync = useCallback(
    (input: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      const delay = asyncConfig?.debounceMs ?? DEFAULT_DEBOUNCE_MS;
      debounceTimerRef.current = setTimeout(() => loadAsync(input), delay);
    },
    [asyncConfig?.debounceMs, loadAsync]
  );

  return { asyncOptions, isLoading, loadAsync, debouncedLoadAsync };
}
