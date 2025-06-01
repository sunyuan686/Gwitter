import { useCallback, useRef } from 'react';
import { throttle } from '../utils';

interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

type AnyFunction = (...args: any[]) => any;

/**
 * A hook that returns a throttled version of the callback function
 * @param callback The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @param options The options object
 * @param options.leading Specify invoking on the leading edge of the timeout
 * @param options.trailing Specify invoking on the trailing edge of the timeout
 * @returns The throttled version of the callback
 */
export function useThrottle<T extends AnyFunction>(
  callback: T,
  wait: number,
  options: ThrottleOptions = {},
): T {
  const throttledFn = useRef<T | null>(null);

  return useCallback(
    ((...args: any[]) => {
      if (!throttledFn.current) {
        throttledFn.current = throttle(callback, wait, options) as T;
      }
      return throttledFn.current(...args);
    }) as T,
    [callback, wait, options.leading, options.trailing],
  );
}
