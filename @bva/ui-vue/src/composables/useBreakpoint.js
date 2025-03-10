import { breakpoints as TokenBreakpoints } from '@bva/ui-shared/tokens/breakpoints';
import { useMediaQuery, useBreakpoints } from '@vueuse/core';

export const breakpoints = useBreakpoints(TokenBreakpoints.px);

/**
 * Client-side representation of current viewport states.
 */
export function useBreakpoint() {
  return {
    isMobile: breakpoints.smaller('md'),
    isTablet: breakpoints.between('md', 'lg'),
    isDesktop: breakpoints.greater('lg'),
  };
}
