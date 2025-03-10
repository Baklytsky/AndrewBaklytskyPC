/**
 * Aggregates all dimension-related mixins.
 */
import DimensionWidth from '@bva/ui-vue/src/mixins/dimension-width';
import DimensionHeight from '@bva/ui-vue/src/mixins/dimension-height';

export default {
  mixins: [DimensionWidth, DimensionHeight],
};
