<template>
  <div
    class="ra-grid-item"
    :data-row="appliedRow"
    :data-column="appliedColumn"
    :style="gridItemVars"
  >
    <!-- @slot Use this slot to populate the contents of a grid item. -->
    <slot />
  </div>
</template>

<script>
import {
  getMergedVars,
  getFormattedVars,
  getCSSVarsFromMap,
  getAppliedScope,
} from '@bva/ui-shared/helpers';

export default {
  name: 'RaGridItem',
  props: {
    /**
     * Set how many columns should this grid item span.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Integers which are parsed in the order they're set.
     *   The 1st item in the array is used for the global viewport, the 2nd for medium viewports, and so forth.
     */
    columnSpan: {
      type: [Object, Array, String, Number],
      default() {
        return [];
      },
    },
    /**
     * Specify how many rows should this grid item span.
     * Behaves and works the same way as `columnSpan`.
     */
    rowSpan: {
      type: [Object, Array, String, Number],
      default() {
        return [];
      },
    },
  },
  computed: {
    gridItemVars() {
      return getMergedVars(this.rowSpanVars, this.columnSpanVars);
    },
    rowSpanVars() {
      const varMap = getFormattedVars(this.rowSpan, 'grid-row');

      return getCSSVarsFromMap(varMap);
    },
    columnSpanVars() {
      const varMap = getFormattedVars(this.columnSpan, 'grid-column');

      return getCSSVarsFromMap(varMap);
    },
    appliedRow() {
      return getAppliedScope(this.rowSpan);
    },
    appliedColumn() {
      return getAppliedScope(this.columnSpan);
    },
  },
};
</script>
