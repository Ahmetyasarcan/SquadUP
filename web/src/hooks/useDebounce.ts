import { useState, useEffect } from 'react';

/**
 * Debounce hook — delays value update until user stops typing.
 * Used for search inputs to avoid excessive API calls / filtering.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
