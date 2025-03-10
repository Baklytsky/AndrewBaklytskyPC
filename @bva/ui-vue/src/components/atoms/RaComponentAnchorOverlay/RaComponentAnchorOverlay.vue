<template>
  <RaLink
    class="ra-component-anchor-overlay"
    :link="link"
    :target="target"
    :raw="true"
  >
    <div class="sr-only">
      <slot>
        <div v-html="content || label"></div>
      </slot>
    </div>
  </RaLink>
</template>

<script>
import RaLink from '../RaLink/RaLink.vue';

export default {
  name: 'RaComponentAnchorOverlay',
  components: {
    RaLink,
  },
  props: {
    /**
     * Set the link to use in this anchor overlay.
     */
    link: {
      type: String,
      default: '',
    },
    /**
     * Specify a target behavior for the anchor overlay: _self, _blank.
     */
    target: {
      type: String,
      default: '',
    },
    /**
     * Content to render hidden as part of the anchor overlay.
     * This content's prirmary purpose is for ADA/screen readers.
     */
    content: {
      type: [String, Object],
      default: '',
    },
    /**
     * Optional label to pass instead of providing content.
     */
    label: {
      type: String,
      default: '',
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaComponentAnchorOverlay.css';
</style>
