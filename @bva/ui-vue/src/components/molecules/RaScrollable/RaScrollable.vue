<template>
  <div
    ref="container"
    class="ra-scrollable"
    :class="{
      'ra-scrollable--expanded': expanded,
    }"
    :style="{
      '--scrollable-max-height': maxContentHeight,
    }"
  >
    <div ref="content" class="ra-scrollable__content">
      <slot />
    </div>

    <slot name="expand" v-bind="{ hasScroll, expandLabel, collapseLabel }">
      <RaButton
        v-show="hasScroll"
        class="ra-scrollable__expand"
        :as-text="true"
        @click="handleExpand"
      >
        <span v-if="expanded">{{ collapseLabel }}</span>
        <span v-else>{{ expandLabel }}</span>
      </RaButton>
    </slot>
  </div>
</template>
<script>
import RaButton from '../../atoms/RaButton/RaButton.vue';
export default {
  name: 'RaScrollable',
  components: {
    RaButton,
  },
  model: {
    prop: 'expanded',
    event: 'click:expand',
  },
  props: {
    /**
     * Control the current expanded state.
     */
    expanded: {
      type: Boolean,
      default: false,
    },
    /**
     * Maximum height of visible content.
     */
    maxContentHeight: {
      type: String,
      default: null,
    },
    /**
     * Text for button showing content.
     */
    expandLabel: {
      type: String,
      default: 'Show',
    },
    /**
     * Text for button hiding content.
     */
    collapseLabel: {
      type: String,
      default: 'Hide',
    },
  },
  data() {
    return {
      hasScroll: false,
    };
  },
  mounted() {
    this.$nextTick(() => {
      if (typeof MutationObserver === 'undefined' || !this.$refs.content) {
        return;
      }

      const observer = new MutationObserver(this.sizeCalc);

      this.sizeCalc();

      observer.observe(this.$refs.content, { subtree: true, childList: true });
    });
  },
  methods: {
    sizeCalc() {
      const contentHeight = this.$refs.content.offsetHeight;
      const contentScrollHeight = this.$refs.content.scrollHeight;

      this.hasScroll = contentScrollHeight > contentHeight;
    },
    handleExpand() {
      this.$emit('click:expand', !this.expanded);
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaScrollable.css';
</style>
