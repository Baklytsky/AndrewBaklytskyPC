<template>
  <RaContainer
    as="article"
    class="ra-text-only-banner"
    inner-class="ra-text-only-banner__details"
    :max-width="maxWidth"
    :spacing-top="spacingTop"
    :spacing-bottom="spacingBottom"
    :spacing-edge="spacingEdge"
    raw
    v-on="$listeners"
  >
    <!-- @slot Replaces the entire details container with custom content. -->
    <slot name="details">
      <div
        class="ra-text-only-banner__copy"
        :class="[verticalAlignClasses, horizontalAlignClasses]"
      >
        <!-- @slot Replaces the title and description elements. -->
        <slot name="details-copy">
          <slot name="details-copy-start" />

          <div
            v-if="subtitle"
            class="ra-text-only-banner__subtitle"
            v-bind="{ ...cmsBindings.subtitle }"
            v-html="subtitle"
          ></div>

          <RaTitle
            v-if="title"
            class="ra-text-only-banner__title"
            :level="titleLevel"
            :as="titleAs"
            :title="title"
            v-bind="{ ...cmsBindings.title }"
          />

          <div
            v-if="description"
            class="ra-text-only-banner__description"
            v-bind="{ ...cmsBindings.description }"
            v-html="description"
          ></div>

          <slot name="details-copy-end" />
        </slot>

        <!-- @slot Replaces the links/CTAs container. -->
        <slot name="details-linkList">
          <RaLinkList
            :link-list="links"
            class="ra-text-only-banner__link-list"
            v-bind="{ ...cmsBindings.links }"
          />
        </slot>
      </div>
    </slot>
  </RaContainer>
</template>

<script>
import RaTitle from '../../atoms/RaTitle/RaTitle.vue';
import RaLinkList from '../../molecules/RaLinkList/RaLinkList.vue';
import RaContainer from '../../molecules/RaContainer/RaContainer.vue';

import CommonTextMixins from '@bva/ui-vue/src/mixins/common-text';
import CommonLinksMixins from '@bva/ui-vue/src/mixins/common-links';
import CommonLayoutMixins from '@bva/ui-vue/src/mixins/common-layout';
import CommonStylesMixins from '@bva/ui-vue/src/mixins/common-styles';
import CommonCMSMixins from '@bva/ui-vue/src/mixins/common-cms';
import ContainerMixins from '@bva/ui-vue/src/mixins/container-layout';

/**
 * This section serves as a place to read a bold brand or mission statement.
 *
 * Has controls for background and text color, vertical and horizontal spacing and alignment, max width, and more.
 */
export default {
  name: 'RaTextOnlyBanner',
  components: {
    RaTitle,
    RaLinkList,
    RaContainer,
  },
  mixins: [
    CommonTextMixins,
    CommonLayoutMixins,
    CommonStylesMixins,
    CommonLinksMixins,
    CommonCMSMixins,
    ContainerMixins,
  ],
  props: {
    verticalAlign: {
      type: String,
      default: 'middle',
    },
    horizontalAlign: {
      type: String,
      default: 'center',
    },
    maxWidth: {
      type: String,
      default: 'medium',
    },
    spacingTop: {
      type: [Object, Array, String],
      default() {
        return {
          base: 'lg',
          md: '2xl',
        };
      },
    },
    spacingBottom: {
      type: [Object, Array, String],
      default() {
        return {
          base: 'lg',
          md: '2xl',
        };
      },
    },
    spacingEdge: {
      type: [Object, Array, String],
      default() {
        return {
          base: 'sm',
          md: 'DEFAULT',
        };
      },
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaTextOnlyBanner.css';
</style>
