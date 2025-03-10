<template>
  <article
    :class="[
      'ra-icon-tile',
      backgroundClasses,
      detailsLocationClasses,
      horizontalAlignClasses,
      {
        'ra-icon-tile--has-main-link': mainLink,
        'ra-icon-tile--stack': stack,
      },
    ]"
    :style="[foregroundVariables, backgroundVariables]"
    v-on="$listeners"
  >
    <div
      :class="['ra-icon-tile__media', 'component-media', verticalAlignClasses]"
    >
      <!-- @slot Replaces the default media with custom content. -->
      <slot name="media">
        <RaImage
          v-if="hasImage"
          :src="imageSrc"
          :srcset="imageSrcset"
          :alt="imageAlt"
          :width="media.image.width"
          :height="media.image.height"
          class="ra-icon-tile__image"
          v-bind="{ ...cmsBindings.image }"
        />
      </slot>
    </div>

    <div
      :class="[
        'ra-icon-tile__details',
        'component-details',
        verticalAlignClasses,
      ]"
    >
      <!-- @slot Replaces the entire details container with custom content. -->
      <slot name="details">
        <div class="ra-icon-tile__copy" :class="[horizontalAlignClasses]">
          <!-- @slot Replaces the title and description elements. -->
          <slot name="details-copy">
            <slot name="details-copy-start" />

            <div
              v-if="subtitle"
              class="ra-icon-tile__subtitle"
              v-bind="{ ...cmsBindings.subtitle }"
              v-html="subtitle"
            ></div>

            <RaTitle
              class="ra-icon-tile__title"
              :level="titleLevel"
              :as="titleAs"
              :title="title"
              v-bind="{ ...cmsBindings.title }"
            />

            <div
              v-if="description"
              class="ra-icon-tile__description"
              v-bind="{ ...cmsBindings.description }"
              v-html="description"
            ></div>

            <slot name="details-copy-end" />
          </slot>

          <!-- @slot Replaces the links/CTAs container. -->
          <slot name="details-linkList">
            <RaLinkList
              :link-list="links"
              class="ra-icon-tile__link-list"
              v-bind="{ ...cmsBindings.links }"
            />
          </slot>
        </div>
      </slot>
    </div>
  </article>
</template>

<script>
import RaImage from '../../atoms/RaImage/RaImage.vue';
import RaTitle from '../../atoms/RaTitle/RaTitle.vue';
import RaLinkList from '../../molecules/RaLinkList/RaLinkList.vue';
import CommonMixins from '@bva/ui-vue/src/mixins/common';

/**
 * Displays media, text, and links in the form of a card or tile.
 * Has controls for text alignment and positioning, background and foreground color, and more.
 * Multiple links can be provided if necessary.
 * Supports optional aspect ratio controls.
 */
export default {
  name: 'RaIconTile',
  components: {
    RaImage,
    RaTitle,
    RaLinkList,
  },
  mixins: [CommonMixins],
  props: {
    verticalAlign: {
      type: String,
      default: 'top',
    },
    horizontalAlign: {
      type: String,
      default: 'center',
    },
    imageWidth: {
      type: [String, Number],
      default: 64,
    },
    titleAs: {
      type: Number,
      default: 6,
    },
    /**
     * Displays the tile stacked instead of side-by-side.
     */
    stack: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    media() {
      return {
        image: {
          width: this.imageWidth,
          height: this.imageHeight,
        },
      };
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaIconTile.css';
</style>
