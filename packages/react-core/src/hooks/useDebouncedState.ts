import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * @param initialState
 * @param timeoutCallback callback to be called after bouncing ends. Should be memoized.
 * @param timeoutMs
 */
export function useDebouncedState<S>(
  initialState: S | (() => S),
  timeoutCallback?: (state: S) => void,
  timeoutMs = 166
): [S, Dispatch<SetStateAction<S>>] {
  let timeoutId: null | ReturnType<typeof setTimeout> = null;

  const [state, setState] = useState<S>(initialState);

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);
    if (timeoutCallback)
      timeoutId = setTimeout(() => timeoutCallback(state), timeoutMs);
  }, [state, timeoutCallback]);

  return [state, setState];
}
