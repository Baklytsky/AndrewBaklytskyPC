<template>
  <article
    class="ra-hero"
    :class="[detailsLocationClasses, aspectRatioClasses]"
    :style="[foregroundVariables, backgroundVariables]"
    v-on="$listeners"
  >
    <div class="ra-hero__media component-media">
      <!-- @slot Replaces the default media with custom content. -->
      <slot name="media">
        <RaImage
          v-if="hasImage"
          :src="imageSrc"
          :srcset="imageSrcset"
          :alt="imageAlt"
          :width="imageWidth"
          :height="imageHeight"
          :use-aspect-ratio="respectMediaRatio"
          :use-as-background="!respectMediaRatio"
          class="ra-hero__image"
          v-bind="{ ...cmsBindings.image }"
        />

        <RaVideo
          v-if="hasVideo"
          :src="videoSrc"
          :width="videoWidth"
          :height="videoHeight"
          :use-aspect-ratio="!hasImage && respectMediaRatio"
          :use-as-background="hasImage || !respectMediaRatio"
          class="ra-hero__video"
          v-bind="{ ...cmsBindings.video }"
        />
      </slot>
    </div>

    <div class="ra-hero__details component-details--set-order">
      <!-- @slot Replaces the entire details container with custom content. -->
      <slot name="details">
        <div
          class="ra-hero__copy"
          :class="[verticalAlignClasses, horizontalAlignClasses]"
        >
          <!-- @slot Replaces the title and description elements. -->
          <slot name="details-copy">
            <slot name="details-copy-start" />

            <div
              v-if="subtitle"
              class="ra-hero__subtitle"
              v-bind="{ ...cmsBindings.subtitle }"
              v-html="subtitle"
            ></div>

            <RaTitle
              class="ra-hero__title"
              :level="titleLevel"
              :as="titleAs"
              :title="title"
              v-bind="{ ...cmsBindings.title }"
            />

            <div
              v-if="description"
              class="ra-hero__description"
              v-bind="{ ...cmsBindings.description }"
              v-html="description"
            ></div>

            <slot name="details-copy-end" />
          </slot>

          <!-- @slot Replaces the links/CTAs container. -->
          <slot name="details-linkList">
            <RaLinkList
              :link-list="links"
              class="ra-hero__link-list"
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
import RaVideo from '../../molecules/RaVideo/RaVideo.vue';
import RaTitle from '../../atoms/RaTitle/RaTitle.vue';
import RaLinkList from '../../molecules/RaLinkList/RaLinkList.vue';
import CommonMixins from '@bva/ui-vue/src/mixins/common';

/**
 * A banner used for a full width image/video for promotional displays.
 *
 * Has controls for text alignment and positioning, background and foreground color, and more.
 *
 * Multiple links can be provided if necessary.
 * Supports optional aspect ratio controls.
 */
export default {
  name: 'RaHero',
  components: {
    RaImage,
    RaVideo,
    RaTitle,
    RaLinkList,
  },
  mixins: [CommonMixins],
  props: {
    detailsLocation: {
      type: String,
      default: 'overlay',
    },
    verticalAlign: {
      type: String,
      default: 'middle',
    },
    horizontalAlign: {
      type: String,
      default: 'center',
    },
    aspectRatio: {
      type: String,
      default: 'main',
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaHero.css';
</style>
