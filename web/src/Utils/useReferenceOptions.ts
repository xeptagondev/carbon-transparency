import { useEffect, useState } from 'react';
import { useConnection } from '../Context/ConnectionContext/connectionContext';

export interface ReferenceOption {
  /** The stable code that records store. */
  value: string;
  /** What the user sees; an admin can rename it in National configurations. */
  label: string;
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
  const [options, setOptions] = useState<ReferenceOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response: any = await get(`national/reference-data/${listKey}`);
        if (!cancelled) {
          setOptions(response.data.map((v: any) => ({ value: v.code, label: v.label })));
        }
      } catch (error: any) {
        if (!cancelled) {
          setOptions([]);
        }
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [listKey]);

  return options;
};
