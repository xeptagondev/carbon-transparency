import { useEffect, useState } from 'react';
import { useConnection } from '../Context/ConnectionContext/connectionContext';

export interface ReferenceOption {
  /** The stable code that records store. */
  value: string;
  /** What the user sees; an admin can rename it in National configurations. */
  label: string;
}

const optionsCache = new Map<string, ReferenceOption[]>();
const inflightRequests = new Map<string, Promise<ReferenceOption[]>>();

async function loadReferenceOptions(
  listKey: string,
  get: (path: string) => Promise<unknown>
): Promise<ReferenceOption[]> {
  const cached = optionsCache.get(listKey);
  if (cached) {
    return cached;
  }

  const inflight = inflightRequests.get(listKey);
  if (inflight) {
    return inflight;
  }

  const request = get(`national/reference-data/${listKey}`)
    .then((response: any) => {
      const options: ReferenceOption[] = response.data.map((v: any) => ({
        value: v.code,
        label: v.label,
      }));
      optionsCache.set(listKey, options);
      return options;
    })
    .catch(() => [] as ReferenceOption[])
    .finally(() => {
      inflightRequests.delete(listKey);
    });

  inflightRequests.set(listKey, request);
  return request;
}

/**
 * The values of one admin-managed list (National configurations), ready to use as dropdown options.
 *
 * Only active values are returned, so a disabled value no longer shows up for new selections. A
 * record that already holds a disabled value still displays it: the dropdown shows the stored value
 * when it has no matching option.
 */
export const useReferenceOptions = (listKey: string): ReferenceOption[] => {
  const { get } = useConnection();
  const [options, setOptions] = useState<ReferenceOption[]>(() =>
    listKey ? optionsCache.get(listKey) ?? [] : []
  );

  useEffect(() => {
    if (!listKey) {
      setOptions([]);
      return;
    }

    const cached = optionsCache.get(listKey);
    if (cached) {
      setOptions(cached);
      return;
    }

    let cancelled = false;

    loadReferenceOptions(listKey, get).then((loaded) => {
      if (!cancelled) {
        setOptions(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [listKey, get]);

  return options;
};
