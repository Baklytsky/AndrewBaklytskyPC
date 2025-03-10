<template>
  <RaGrid
    class="ra-accordion"
    :columns="columns"
    :gap="gap"
    @toggle="(list, index, open) => $emit('toggle', list, index, open)"
  >
    <!--@slot default slot to setup RaAccordionItem elements -->
    <slot />
  </RaGrid>
</template>

<script>
import RaGrid from '../../atoms/RaGrid/RaGrid.vue';

/**
 * Renders one or more accordion items which can be expanded or collapsed.
 *
 * Has options for setting default open states, allowing multiple accordions at the same time, transitions, and more.
 *
 * Can be displayed either stacked or as a custom grid.
 */
export default {
  name: 'RaAccordion',
  components: {
    RaGrid,
  },
  provide() {
    return { scopedState: this.scopedState };
  },
  props: {
    /**
     * Allows to open multiple accordion items if set to `true`.
     * Must be set to `true` if the `open` property has an array of items.
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Specify how much space to leave between items of this skeleton.
     * Accepts any valid CSS unit value.
     * Read the `RaGrid` documentation to learn more.
     */
    gap: {
      type: [Object, Array, String, Boolean],
      default() {
        return ['var(--accordion-gap)'];
      },
    },
    /**
     * Set how many grid columns to display globally or on a per viewport basis.
     * Read the `RaGrid` documentation to learn more.
     */
    columns: {
      type: [Object, Array, String, Number],
      default() {
        return [1];
      },
    },
  },
  data() {
    return {
      scopedState: {
        activeList: null,
        multiple: this.multiple,
      },
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaAccordion.css';
</style>
