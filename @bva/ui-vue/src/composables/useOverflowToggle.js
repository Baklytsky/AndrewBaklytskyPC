import { ref, computed, watch } from 'vue-demi';
import { useWindowSize } from '@vueuse/core';
import {
  getHasScroll,
  getOverflownChildrenCount,
} from '@bva/ui-shared/helpers';

/**
 * Watches a scrollable `observedEl` for dimension changes and updates the scroll state,
 * providing utilities to toggle children visibility and lock scroll.
 */
export const useOverflowToggle = (
  observedEl,
  { enabled, offsetX = 85 } = {}
) => {
  const showMore = ref(true);
  const hasScroll = ref(false);
  const hiddenCount = ref(0);

  const hideScroll = computed(() => hasScroll.value && showMore.value);
  const isEnabled = computed(() => enabled.value && observedEl.value);

  const getIsInvisible = (index, options) => {
    return hideScroll.value && index >= options.length - hiddenCount.value;
  };

  const toggleShowMore = () => {
    observedEl.value.$el.scrollTo(0, 0);

    showMore.value = !showMore.value;
  };

  const { width } = useWindowSize();
  const elWidth = ref(null);

  //This complicated watcher exists cause for the time being,
  //we can't use `useResizeObserver()` on SSR/Nuxt. It throws a "max calls" error.
  watch(
    [width, elWidth, isEnabled],
    ([newWidth, newElWidth, newEnabled], [oldWidth, oldElWidth]) => {
      if (!newEnabled) {
        return false;
      }

      if (newWidth !== oldWidth) {
        elWidth.value = observedEl.value.$el.clientWidth;
      }

      if (elWidth !== oldElWidth) {
        // Intentionally avoid setting variables for performance reasons.
        hasScroll.value = getHasScroll(observedEl.value.$el);

        hiddenCount.value = hasScroll.value
          ? getOverflownChildrenCount(observedEl.value.$el, offsetX)
          : 0;
      }
    }
  );

  return {
    showMore,
    hasScroll,
    hiddenCount,
    hideScroll,

    getIsInvisible,

    toggleShowMore,
  };
};
