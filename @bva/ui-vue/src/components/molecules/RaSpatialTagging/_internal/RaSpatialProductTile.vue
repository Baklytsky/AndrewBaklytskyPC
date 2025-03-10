<template>
  <RaProductTile
    class="ra-spatial-product-tile"
    v-bind="{ ...productProps, ...$attrs }"
    v-on="{
      ...$listeners,
      ...events,
    }"
  />
</template>

<script>
import { toRefs } from 'vue-demi';
import RaProductTile from '../../RaProductTile/RaProductTile.vue';

export default {
  name: 'RaSpatialProductTile',
  components: {
    RaProductTile,
  },
  props: {
    product: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  setup(props) {
    const { events, ...productProps } = toRefs(props.product);

    return {
      events,
      productProps,
    };
  },
};
</script>
