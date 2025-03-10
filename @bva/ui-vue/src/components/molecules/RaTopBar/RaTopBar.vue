<template>
  <RaContainer
    class="ra-top-bar"
    inner-class="ra-top-bar__container"
    raw
    v-bind="{ ...$props, ...$attrs }"
  >
    <div class="ra-top-bar__left">
      <!--@slot Custom left content-->
      <slot name="left" />
    </div>
    <div class="ra-top-bar__center">
      <!--@slot Custom center content-->
      <slot name="center" />
      <slot />
    </div>
    <div class="ra-top-bar__right">
      <!--@slot Custom right content-->
      <slot name="right" />
    </div>
  </RaContainer>
</template>

<script>
import RaContainer from '../RaContainer/RaContainer.vue';
import StylesMixins from '@bva/ui-vue/src/mixins/common-styles';
import ContainerMixins from '@bva/ui-vue/src/mixins/container-layout';

/**
 * A navigation element that generally renders on the top-most area of a page.
 * This can be used to host custom promotional and marketing information, locale and currency options, etc.
 */
export default {
  name: 'RaTopBar',
  components: {
    RaContainer,
  },
  mixins: [ContainerMixins, StylesMixins],
  props: {
    spacingEdge: {
      type: [Object, Array, String],
      default: 'sm',
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaTopBar.css';
</style>
