import { computed } from 'vue-demi';

import {
  getSortedSrcSet,
  getHasWidthOrRes,
  formatSrcSet,
  formatSizes,
  formatBreakpoint,
} from '@bva/ui-shared/helpers';

export const useImage = ({ srcset } = {}) => {
  const sortedSrcset = computed(() => {
    return getSortedSrcSet(srcset);
  });

  const formattedSrcset = computed(() => {
    return formatSrcSet(sortedSrcset.value);
  });

  const formattedSizes = computed(() => {
    return formatSizes(sortedSrcset.value);
  });

  const hasWidthOrResolution = computed(() => {
    return getHasWidthOrRes(sortedSrcset.value);
  });

  return {
    //Computed
    sortedSrcset,
    formattedSrcset,
    formattedSizes,
    hasWidthOrResolution,
    //Methods
    formatBreakpoint,
  };
};
