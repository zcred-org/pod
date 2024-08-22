import { throttle } from 'lodash-es';
import type { RefObject } from 'react';
import { useEffect } from 'react';


/**
 * Calls a function when the user scrolls to the bottom of the element.
 * @param args - Arguments.
 * @returns void.
 */
export function useOnScrollOver(args: {
  /** Scrolling element **/
  refOrElement: RefObject<HTMLElement> | HTMLElement | Window,
  /** Remaining scrolling to trigger the event **/
  bottomOffset?: number,
  /** Function called on event **/
  onScrollOver: () => unknown | Promise<unknown>,
  /** Whether the event is enabled **/
  isDisabled?: boolean,
}) {
  const { refOrElement, bottomOffset = 500, onScrollOver, isDisabled } = args;

  useEffect(() => {
    if (isDisabled) return;
    const element = 'current' in refOrElement ? refOrElement.current : refOrElement;
    if (!element) return;

    const handleScroll = throttle((event: WindowEventMap['scroll']) => {
      let target = event.target as HTMLElement;
      if (target === window.document as unknown) target = document.documentElement;

      const bottomPosition = target.scrollTop + target.clientHeight;
      const bottomTrigger = target.scrollHeight - bottomOffset;

      if (bottomPosition >= bottomTrigger) {
        element.removeEventListener('scroll', handleScroll);
        onScrollOver();
      }
    }, 300);

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [refOrElement, bottomOffset, onScrollOver, isDisabled]);
}
