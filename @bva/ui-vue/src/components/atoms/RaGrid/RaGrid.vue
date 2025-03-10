<template>
  <div
    :class="[
      'ra-grid',
      {
        'ra-grid--inherit-gap': inheritGap,
      },
    ]"
    :data-gap="appliedGap"
    :data-columns="appliedColumns"
    :style="gridVars"
  >
    <!-- @slot Use this slot to populate the contents of the grid using individual Column components. -->
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

/**
 * Renders a grid which expects `RaGridItem`-like children.
 * The grid can accept custom gap per viewport, as well as to completely disable gap.
 * Multiple grids can be nested and child grids can inherit their parent's gap config by using the `inheritGap` prop.
 */
export default {
  name: 'RaGrid',
  props: {
    /**
     * Specify one or more gap values to use within the grid.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Strings which are parsed in the order they're set.
     *   The first item in the array is used for the global viewport, the second for medium viewports, and so forth.
     * * Boolean which when set to `false` removes the gaps.
     */
    gap: {
      type: [Object, Array, String, Boolean],
      default() {
        return ['1rem'];
      },
    },
    /**
     * Define the column count/size for the grid.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Integers which are parsed in the order they're set.
     *   The 1st item in the array is used for the global viewport, the 2nd for medium viewports, and so forth.
     */
    columns: {
      type: [Object, Array, String, Number],
      default() {
        return [1];
      },
    },
    /**
     * Control the growth behavior of each item repetetion within the grid.
     */
    repeatTracks: {
      type: String,
      default: undefined,
    },
    /**
     * Makes it so that the current grid inherits any gap from the parent(s) grid.
     * This is only relevant when working with nested grids.
     */
    inheritGap: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    gridVars() {
      return getMergedVars(
        this.gapVars,
        this.columnsVars,
        this.repeatTracksVars
      );
    },
    /**
     * Generates a list of CSS Custom Variables with gap (spacing) values for each viewport (if provided).
     * Gaps are used for both vertical and horizontal spacing between each grid item/column.
     */
    gapVars() {
      if (!this.gap || this.inheritGap) {
        return null;
      }

      const varMap = getFormattedVars(this.gap, 'grid-gap');

      return getCSSVarsFromMap(varMap);
    },
    /**
     * Same functionality as `gapVars()` but for column sizing generation.
     */
    columnsVars() {
      const varMap = getFormattedVars(this.columns, 'grid-columns');

      return getCSSVarsFromMap(varMap);
    },
    repeatTracksVars() {
      const varMap = getFormattedVars(this.repeatTracks, 'grid-repeat-tracks');

      return getCSSVarsFromMap(varMap);
    },
    appliedGap() {
      return getAppliedScope(this.gap);
    },
    appliedColumns() {
      return getAppliedScope(this.columns);
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaGrid.css';
</style>
