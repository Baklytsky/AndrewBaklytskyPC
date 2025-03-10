<template>
  <div
    :class="[
      'ra-row',
      modifierClass(alignItems, 'items'),
      modifierClass(justifyContent, 'justify'),
      {
        'row-no-gap': !hasGap,
      },
    ]"
    :style="gapVars"
    :data-row-gap="gapScope"
  >
    <!-- @slot Default row content slot. Use to populate using RaCol elements. -->
    <slot />
  </div>
</template>

<script>
import {
  getFormattedVars,
  getCSSVarsFromMap,
  getAppliedScope,
} from '@bva/ui-shared/helpers';

/**
 * Renders a Flex Row/Column system which expects `RaCol`-like children.
 * Custom gap can be set on a per-viewport basis.
 * For more grid-like functionalities, we recommend to use the `RaGrid` component instead.
 * The main difference between this component and `RaGrid` is the use of `display: flex;` vs `display: grid;`.
 * This means that row items or columns can be of arbitrary sizes, not necessarily needing to fit within a CSS Grid system.
 */
export default {
  name: 'RaRow',
  provide() {
    return {
      base: this.base,
    };
  },
  props: {
    /**
     * Specify the column count base to use for this flexbox column system.
     */
    base: {
      type: Number,
      default: 12,
    },
    /**
     * Set CSS Flex `align-items` configurations.
     * Possible values: `start`, `center`, `end`, `baseline`, `stretch`.
     */
    alignItems: {
      type: String,
      default: '',
    },
    /**
     * Set CSS Flex `justify-content` configurations.
     * Possible values: `start`, `center`, `end`, `between`, `around`.
     */
    justifyContent: {
      type: String,
      default: '',
    },
    /**
     * Specify one or more gap values to use within the rows.
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
        return {
          base: '1rem',
          md: '1.5rem',
          lg: '1.5rem',
        };
      },
    },
  },
  setup(props, context) {},
  computed: {
    /**
     * Generates a list of CSS Custom Variables with gap (spacing) values for each viewport (if provided).
     * Gaps are used for both vertical and horizontal spacing between each column.
     */
    gapVars() {
      if (!this.gap) {
        return null;
      }

      const varMap = getFormattedVars(this.gap, 'row-gap');

      return getCSSVarsFromMap(varMap);
    },
    gapScope() {
      return getAppliedScope(this.gap);
    },
    hasGap() {
      return this.gapVars;
    },
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier ? `${prefix ? `${prefix}-` : ''}${modifier}` : '';
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaRow.css';
</style>
