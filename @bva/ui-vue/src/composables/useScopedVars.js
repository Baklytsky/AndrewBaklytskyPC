import { computed } from 'vue-demi';

import { getFormattedVars, getAppliedScope } from '@bva/ui-shared/helpers';

/**
 * Returns a formatted object with CSS Custom Properties to be applied per per viewport or "scope".
 * An optional `options` object to be passed down to the `getFormattedVars()` method.
 */
export const useScopedVars = (varProp = {}, varName = '', options = {}) => {
  return {
    vars: computed(() =>
      getFormattedVars(varProp.value || varProp, varName, options)
    ),
    scope: computed(() => getAppliedScope(varProp.value || varProp)),
  };
};
