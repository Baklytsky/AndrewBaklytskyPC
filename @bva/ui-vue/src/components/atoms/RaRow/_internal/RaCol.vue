<template>
  <div
    :class="['ra-col']"
    :style="colVars"
    :data-col-size="colScopeUnits"
    :data-col-auto="colScopeAuto"
  >
    <!-- @slot Default column content slot. -->
    <slot />
  </div>
</template>

<script>
import {
  getFormattedVars,
  getCSSVarsFromMap,
  getAppliedScope,
  getFormattedColumns,
} from '@bva/ui-shared/helpers';
import { ref, computed, inject } from 'vue-demi';

/**
 * Renders a custom-sized column within the context of a `.row` container, or a `RaRow` parent component.
 */
export default {
  name: 'RaCol',
  inheritAttrs: false,
  props: {
    /**
     * Set a column size on small and higher breakpoints.
     * Accepts: column count, pixels, percent, or any other valid CSS unit.
     */
    size: {
      type: [String, Number],
      default: '100%',
    },
  },
  setup(props, { attrs }) {
    const base = inject('base');
    const config = { size: props.size, ...attrs };

    const formatted = getFormattedColumns(config, base);

    const colVars = computed(() => {
      const varMap = getFormattedVars(formatted.units, 'col-size', {
        rootScope: 'size',
      });

      return getCSSVarsFromMap(varMap);
    });

    const colScopeUnits = computed(() => {
      return getAppliedScope(formatted.units);
    });
    const colScopeAuto = computed(() => {
      return getAppliedScope(formatted.auto);
    });

    return {
      colVars,
      colScopeUnits,
      colScopeAuto,
    };
  },
};
</script>
