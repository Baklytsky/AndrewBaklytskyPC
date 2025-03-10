<template>
  <RaAccordionItem
    v-if="useAccordion"
    :header="title"
    :open="isOpen"
    class="ra-footer-column"
    @toggle:intercept="accordionClick"
  >
    <slot />
  </RaAccordionItem>

  <RaGridItem v-else class="ra-footer-column">
    <span class="ra-footer-column__title">
      {{ title }}
    </span>

    <div class="ra-footer-column__content">
      <slot />
    </div>
  </RaGridItem>
</template>
<script>
import { inject } from 'vue-demi';
import RaAccordionItem from '../../../molecules/RaAccordion/_internal/RaAccordionItem.vue';
import RaGridItem from '../../../atoms/RaGrid/_internal/RaGridItem.vue';

export default {
  name: 'RaFooterColumn',
  components: {
    RaAccordionItem,
    RaGridItem,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    /**
     * Sets this accordion item as open.
     * For convenience, this prop can be passed separately from the parent-level `open` prop.
     */
    open: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      useAccordion: inject('accordionOnMobile'),
    };
  },
  data() {
    return {
      isOpen: this.open,
    };
  },
  methods: {
    accordionClick() {
      this.$parent.$emit('toggle', this._uid);
    },
  },
};
</script>
