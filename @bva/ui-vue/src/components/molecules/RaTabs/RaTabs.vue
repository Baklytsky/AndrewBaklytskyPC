<template>
  <div :class="['ra-tabs', modifierClass(align), modifierClass(layout)]">
    <!--@slot Default. Here you should pass your RaTab components-->
    <slot />
  </div>
</template>

<script>
export default {
  name: 'RaTabs',
  provide() {
    return { scopedState: this.scopedState };
  },
  props: {
    /**
     * Control the horizontal alignment for the tabs.
     */
    align: {
      type: String,
      default: 'left',
    },
    /**
     * Choose between the available layout types for the tabbed interface.
     */
    layout: {
      type: String,
      default: 'default',
    },
    // layoutMD: {
    //   type: String,
    //   default: 'default',
    // },
  },
  data() {
    return {
      scopedState: {
        activeList: null,
      },
    };
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-tabs--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaTabs.css';
</style>
