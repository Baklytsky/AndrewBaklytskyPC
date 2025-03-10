<template>
  <div
    :class="['ra-price', { 'ra-price--stacked': stacked && special }]"
    v-on="$listeners"
  >
    <!--@slot Custom regular price -->
    <slot name="regular" v-bind="{ ...$props }">
      <span v-if="!special" class="ra-price__regular">
        {{ regular }}
      </span>
    </slot>
    <!--@slot Custom special price -->
    <slot name="special" v-bind="{ ...$props }">
      <ins v-if="special" class="ra-price__special">
        {{ special }}
      </ins>
    </slot>
    <!--@slot Custom old price (value from regular)-->
    <slot name="old" v-bind="{ ...$props }">
      <del v-if="special && regular" class="ra-price__old">
        {{ regular }}
      </del>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'RaPrice',
  props: {
    /**
     * Regular/old price value. Crossed out if `special` is provided
     */
    regular: {
      type: [String, Number],
      default: null,
    },
    /**
     * Special price value
     */
    special: {
      type: [String, Number],
      default: null,
    },
    /**
     * Boolean to stack price and special price or not
     */
    stacked: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaPrice.css';
</style>
