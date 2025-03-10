<template>
  <div v-if="hasVisibleLinks" class="ra-link-list">
    <template v-for="(currentBtn, index) in filteredList">
      <RaButton
        v-if="currentBtn && currentBtn.label"
        :key="index"
        :tabindex="fakeLinkTabIndex(index)"
        v-bind="currentBtn"
        class="ra-link-list__cta"
        v-on="
          !currentBtn.link
            ? { click: () => $emit('click:list-button', currentBtn, index) }
            : {}
        "
      >
        {{ currentBtn.label }}
      </RaButton>
    </template>
  </div>
</template>

<script>
import RaButton from '../../atoms/RaButton/RaButton.vue';
import { getFilteredLinks } from '@bva/ui-shared/helpers/links';

export default {
  name: 'RaLinkList',
  components: { RaButton },
  props: {
    /**
     * Provide an Array of Objects or a singular Object
     * to generate a list of CTAs/Links for a module.
     * Each `Object` must follow the `RaButton` API.
     */
    linkList: {
      type: [Array, Object],
      default: () => [],
    },
    /**
     * Specify the index of the CTA to set as "fake".
     * That is, a CTA that should not be accessible via keyboard.
     * This is useful in combination with the component anchor overlay,
     * as it prevents tabbing into this CTA.
     */
    fake: {
      type: Number,
      default: -1,
    },
  },
  computed: {
    filteredList() {
      return getFilteredLinks(this.linkList, 'label');
    },
    hasVisibleLinks() {
      return this.filteredList.length > 0;
    },
  },
  methods: {
    isFakeLink(index) {
      return this.fake === index;
    },
    fakeLinkTabIndex(index) {
      return this.isFakeLink(index) ? '-1' : false;
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaLinkList.css';
</style>
