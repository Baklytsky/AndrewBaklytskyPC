<template>
  <div
    :class="[
      'ra-property',
      {
        'ra-property--stack': stack,
        'ra-property--split': split,
        'ra-property--inherit-color': inheritColor,
      },
    ]"
    :style="[
      {
        '--property-name-separator': formattedSeparator,
      },
    ]"
    v-on="$listeners"
  >
    <!-- @slot Use this slot to replace property name -->
    <slot name="name" v-bind="{ ...$props }">
      <span class="ra-property__name">{{ name }}</span>
    </slot>
    <!-- @slot Use this slot to replace property value -->
    <slot name="value" v-bind="{ ...$props }">
      <span class="ra-property__value">{{ value }}</span>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'RaProperty',
  props: {
    /**
     * The "name" portion of the property. Displays before the `value`.
     */
    name: {
      type: String,
      default: '',
    },
    /**
     * The "value" portion of the property. Displays after the `name`.
     */
    value: {
      type: [String, Number],
      default: '',
    },
    /**
     * Displays the `name` and `value` stacked on top of each other.
     */
    stack: {
      type: Boolean,
      default: false,
    },
    /**
     * Displays the `name` and `value` with a wide gap in-between.
     */
    split: {
      type: Boolean,
      default: false,
    },
    /**
     * Forces the `name` and `value` elements to inherit the current color of the context they're in.
     */
    inheritColor: {
      type: Boolean,
      default: false,
    },
    /**
     * Controls the display of the separator between the `name` and the `value`.
     * Set to `false` to disable.
     */
    separator: {
      type: [Boolean, String],
      default: '',
    },
  },
  computed: {
    /**
     * The `content` property of CSS Pseudo Elements supports `"String"` values only (including the quotes).
     * This formatter ensures the output var contains these quotes.
     */
    formattedSeparator() {
      return this.separator === false
        ? ' '
        : this.separator
        ? JSON.stringify(this.separator)
        : '';
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaProperty.css';
</style>
