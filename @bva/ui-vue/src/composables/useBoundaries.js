import { computed } from 'vue-demi';
import { spacing } from '@bva/ui-shared/tokens/layout';
import { getBoundarySizeClasses } from '@bva/ui-shared/helpers';
import { useScopedVars } from './useScopedVars';

/**
 * Returns spacing boundary configurations for top, bottom, and edges.
 */
export const useBoundaries = ({ top, bottom, edge, maxWidth } = {}) => {
  const { vars: varsTop, scope: scopeTop } = useScopedVars(top, 'spacing-top', {
    map: spacing,
  });
  const { vars: varsBottom, scope: scopeBottom } = useScopedVars(
    bottom,
    'spacing-bottom',
    { map: spacing }
  );
  const { vars: varsEdge, scope: scopeEdge } = useScopedVars(
    edge,
    'spacing-edge',
    { map: spacing }
  );

  const vars = computed(() => {
    return {
      ...varsTop.value,
      ...varsBottom.value,
      ...varsEdge.value,
    };
  });

  const scope = computed(() => {
    return {
      'data-boundary-top': scopeTop.value,
      'data-boundary-bottom': scopeBottom.value,
      'data-boundary-edge': scopeEdge.value,
    };
  });

  return {
    vars,
    varsTop,
    varsBottom,
    varsEdge,

    scope,
    scopeTop,
    scopeBottom,
    scopeEdge,

    classesMaxWidth: computed(() => getBoundarySizeClasses(maxWidth.value)),
  };
};
