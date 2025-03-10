<template>
  <footer class="ra-footer" :style="[backgroundVariables, foregroundVariables]">
    <RaContainer class="ra-footer__main">
      <slot name="main">
        <RaGrid class="ra-footer__main-grid" :columns="columns" :gap="gap">
          <RaGridItem
            class="ra-footer__main-grid-zone ra-footer__communications"
          >
            <slot name="communications" />
          </RaGridItem>

          <RaGridItem class="ra-footer__main-grid-zone">
            <slot name="content">
              <RaAccordion v-if="isMobile">
                <slot />
              </RaAccordion>

              <RaGrid
                v-else
                class="ra-footer__content"
                :columns="contentColumns"
                :gap="contentGap"
              >
                <slot />
              </RaGrid>
            </slot>
          </RaGridItem>
        </RaGrid>
      </slot>
    </RaContainer>

    <RaContainer class="ra-footer__bottom" combined>
      <slot name="bottom">
        <slot name="bottom_copy">
          <p class="ra-footer__bottom-copy">
            {{ bottomCopy }}
          </p>
        </slot>

        <slot name="bottom_links">
          <div class="ra-footer__bottom-links">
            <RaLink
              v-for="(currentLink, linkIndex) in bottomLinks"
              :key="`footer-bottom-link-${linkIndex}`"
              inherit-color
              v-bind="currentLink"
              class="ra-footer__bottom-link"
              >{{ currentLink.label }}</RaLink
            >
          </div>
        </slot>
      </slot>
    </RaContainer>
  </footer>
</template>
<script>
import { ref, watch, provide } from 'vue-demi';
import { useBreakpoint } from '@bva/ui-vue/src/composables/useBreakpoint';
import StylesMixins from '@bva/ui-vue/src/mixins/common-styles';
import RaAccordion from '../../molecules/RaAccordion/RaAccordion.vue';
import RaGrid from '../../atoms/RaGrid/RaGrid.vue';
import RaGridItem from '../../atoms/RaGrid/_internal/RaGridItem.vue';
import RaContainer from '../../molecules/RaContainer/RaContainer.vue';
import RaLink from '../../atoms/RaLink/RaLink.vue';

export default {
  name: 'RaFooter',
  components: {
    RaAccordion,
    RaGrid,
    RaGridItem,
    RaContainer,
    RaLink,
  },
  mixins: [StylesMixins],
  props: {
    /**
     * Multiple footer columns open at the same time on mobile
     */
    multiple: {
      type: Boolean,
      default: true,
    },
    /**
     * Footer columns open on mobile
     */
    open: {
      type: [String, Array],
      default: () => [],
    },
    /**
     * Provide copy to display in the bottom area of the footer.
     */
    bottomCopy: {
      type: String,
      default() {
        const currentYear = new Date().getFullYear();

        return `Copyright ${currentYear}. All rights reserved.`;
      },
    },
    /**
     * Provide a list of links to render in the bottom area of the footer.
     * Each item in the list must follow the `RaLink` API.
     */
    bottomLinks: {
      type: Array,
      default() {
        return [];
      },
    },
    /**
     * Define the column count/size for the main grid (top area).
     */
    columns: {
      type: [Object, Array, String, Number],
      default() {
        return [1, 2];
      },
    },
    /**
     * Set the overally footer gap between each main column.
     */
    gap: {
      type: [Object, Array, String, Boolean],
      default: '0',
    },
    /**
     * Define the column count/size for the content grid.
     */
    contentColumns: {
      type: [Object, Array, String, Number],
      default() {
        return [1, 2];
      },
    },
    /**
     * Set the gap between each content/link list column in the footer.
     */
    contentGap: {
      type: [Object, Array, String, Boolean],
      default: '1rem',
    },
  },
  setup(props) {
    const { isMobile } = useBreakpoint();

    const items = ref([]);

    provide('accordionOnMobile', isMobile);

    return {
      isMobile,
      items,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/organisms/RaFooter.css';
</style>
