<template>
  <RaGrid
    :class="[
      'ra-skeleton',
      modifierClass(variant),
      modifierClass(align, 'align'),
    ]"
    :gap="gap"
    :columns="columns"
  >
    <!-- @slot Use the `default` slot to generate a custom skeleton layout. -->
    <slot v-bind="{ variant, repeat, getBoneWidth, animation }">
      <component
        :is="componentType"
        v-for="(item, index) in repeat"
        :key="index"
        :variant="variant"
        :animation="animation"
        :width="getBoneWidth(index)"
        :height="getBoneHeight(index)"
      />
    </slot>
  </RaGrid>
</template>

<script>
import RaGrid from '../RaGrid/RaGrid.vue';
import RaBone from './_internal/RaBone.vue';
import RaSkeletonProductTile from './_internal/RaSkeletonProductTile.vue';
import RaSkeletonProductDetails from './_internal/RaSkeletonProductDetails.vue';
import RaSkeletonProductLineItem from './_internal/RaSkeletonProductLineItem.vue';

export default {
  name: 'RaSkeleton',
  components: {
    RaGrid,
    RaBone,
    RaSkeletonProductTile,
    RaSkeletonProductDetails,
    RaSkeletonProductLineItem,
  },
  props: {
    /**
     * Defines shape for RaSkeleton.
     * Available options: `paragraph`, `image`, `productTile`, `productDetails`, `productLineItem`.
     */
    variant: {
      type: String,
      default: 'paragraph',
      validator: (value) => [
        'paragraph',
        'image',
        'productTile',
        'productDetails',
        'productLineItem',
      ],
    },
    /**
     * Choose the animation type for this skeleton.
     * Available options: `linear`, `fade`, `pulsate`, `none`.
     */
    animation: {
      type: String,
      default: 'linear',
      validator: (value) => ['linear', 'fade', 'pulsate', 'none'],
    },
    /**
     * Configure the overall bones alignment for this skeleton.
     * Available options: `left`, `center`, `right`.
     */
    align: {
      type: String,
      default: '',
    },
    /**
     * Define how many repetitions of a given skeleton item to repeat.
     * For example, given that `type` is set to "productTile", then an `itemCount` of 8 will render 8 product tile skeletons.
     */
    itemCount: {
      type: Number,
      default: 1,
    },
    /**
     * Provide a single value for the width, or an array of values.
     * If using an array, the positions in said array will correspond to those in the list of skeleton items available.
     * If you provide an `itemsWidth` array with fewer values than skeleton items available, then the `itemsWidth` array is repeated until all skeleton items have a width.
     */
    itemsWidth: {
      type: [Array, String, Number],
      default() {
        return [];
      },
    },
    /**
     * Provide a single value for the height, or an array of values.
     * If using an array, the positions in said array will correspond to those in the list of skeleton items available.
     * If you provide an `itemsHeight` array with fewer values than skeleton items available, then the `itemsHeight` array is repeated until all skeleton items have a height.
     */
    itemsHeight: {
      type: [Array, String, Number],
      default() {
        return [];
      },
    },
    /**
     * Specify how much space to leave between items of this skeleton.
     * Accepts any valid CSS unit value.
     * Read the `RaGrid` documentation to learn more.
     */
    gap: {
      type: [Object, Array, String, Boolean],
      default() {
        return ['.5rem'];
      },
    },
    /**
     * Set how many grid columns to display globally or on a per viewport basis.
     * Read the `RaGrid` documentation to learn more.
     */
    columns: {
      type: [Object, Array, String, Number],
      default() {
        return [];
      },
    },
  },
  computed: {
    componentType() {
      if (this.variant === 'productTile') {
        return 'RaSkeletonProductTile';
      } else if (this.variant === 'productDetails') {
        return 'RaSkeletonProductDetails';
      } else if (this.variant === 'productLineItem') {
        return 'RaSkeletonProductLineItem';
      }

      return 'RaBone';
    },
    repeat() {
      return Array.from(Array(this.itemCount));
    },
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-skeleton--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
    getDimensionByIndex(dimension, index) {
      if (Array.isArray(dimension)) {
        return dimension[index] || dimension[index % dimension.length];
      } else {
        return dimension;
      }
    },
    getBoneWidth(index) {
      return this.getDimensionByIndex(this.itemsWidth, index);
    },
    getBoneHeight(index) {
      return this.getDimensionByIndex(this.itemsHeight, index);
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaSkeleton.css';
</style>
