import { computed, ref, watch } from 'vue-demi';
import {
  getApplicableBreakpoints,
  getPerBreakpointPropValue,
} from '@bva/ui-shared/helpers';
import { useWindowSize } from '@vueuse/core';

/**
 * Takes a prop string, array, or object of the shape `{ key: value, key2: value2 }`.
 * Where each key is a breakpoint defined in the @bva/ui-shared/tokens,
 * and each value is the prop value to apply to the given breakpoint.
 *
 * To cover the smallest breakpoint, use `min` or `xs` (instead of `sm`).
 *
 * Supports:
 * String: 'propValue',
 * Object of format: `{ '<breakpointName>': 'propValue', ...N }`,
 * Array of format: `[ {'<breakpointName>': 'propValue'}, ...N ]`.
 */
export const useViewportProp = (prop) => {
  //Do not setup any listeners if prop is a single value.
  if (typeof prop.value === 'string') {
    return ref(prop.value);
  }

  const { width } = useWindowSize();

  const applicableBreakpoints = computed(() =>
    getApplicableBreakpoints(prop.value)
  );

  const applicableProp = ref(
    getPerBreakpointPropValue(applicableBreakpoints.value)
  );

  watch([width, prop], () => {
    applicableProp.value = getPerBreakpointPropValue(
      applicableBreakpoints.value
    );
  });

  return applicableProp;
};
