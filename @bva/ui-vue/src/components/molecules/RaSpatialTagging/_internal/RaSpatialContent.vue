<template>
  <div class="ra-spatial-content__details component-details">
    <!-- @slot Replaces the entire details container with custom content. -->
    <slot name="details">
      <div
        class="ra-spatial-content__copy"
        :class="[verticalAlignClasses, horizontalAlignClasses]"
      >
        <!-- @slot Replaces the title and description elements. -->
        <slot name="details-copy">
          <slot name="details-copy-start" />

          <div
            v-if="subtitle"
            class="ra-spatial-content__subtitle"
            v-bind="{ ...cmsBindings.subtitle }"
            v-html="subtitle"
          ></div>

          <RaTitle
            class="ra-spatial-content__title"
            :level="titleLevel"
            :as="titleAs"
            :title="title"
            v-bind="{ ...cmsBindings.title }"
          />

          <div
            v-if="description"
            class="ra-spatial-content__description"
            v-bind="{ ...cmsBindings.description }"
            v-html="description"
          ></div>

          <slot name="details-copy-end" />
        </slot>

        <!-- @slot Replaces the links/CTAs container. -->
        <slot name="details-linkList">
          <RaLinkList
            :link-list="links"
            :fake="0"
            class="ra-spatial-content__link-list component-links"
            v-bind="{ ...cmsBindings.links }"
          />
        </slot>
      </div>
    </slot>
  </div>
</template>

<script>
import RaTitle from '../../../atoms/RaTitle/RaTitle.vue';
import RaLinkList from '../../../molecules/RaLinkList/RaLinkList.vue';
import CommonMixins from '@bva/ui-vue/src/mixins/common';

export default {
  name: 'RaSpatialContent',
  components: {
    RaTitle,
    RaLinkList,
  },
  mixins: [CommonMixins],
};
</script>
