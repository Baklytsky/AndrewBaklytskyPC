<template>
  <article
    :class="[
      'ra-content-tile',
      detailsLocationClasses,
      backgroundClasses,
      aspectRatioClasses,
      {
        'ra-content-tile--has-main-link': mainLink,
      },
    ]"
    :style="[foregroundVariables, backgroundVariables]"
    v-on="$listeners"
  >
    <div class="ra-content-tile__media component-media">
      <!-- @slot Replaces the default media with custom content. -->
      <slot name="media">
        <RaImage
          v-if="hasImage"
          :src="imageSrc"
          :srcset="imageSrcset"
          :alt="imageAlt"
          :width="media.image.width"
          :height="media.image.height"
          :use-aspect-ratio="useAspectRatio"
          class="ra-content-tile__image"
          v-bind="{ ...cmsBindings.image }"
        />

        <RaVideo
          v-if="hasVideo"
          :src="videoSrc"
          :width="media.video.width"
          :height="media.video.height"
          :use-aspect-ratio="!hasImage"
          :use-as-background="hasImage"
          class="ra-content-tile__video"
          v-bind="{ ...cmsBindings.video }"
        />
      </slot>
    </div>

    <RaComponentAnchorOverlay
      v-if="mainLink && !cmsBindings.editMode"
      v-bind="{ ...mainLink }"
      :content="`${title} ${description}`"
    />

    <div class="ra-content-tile__details component-details">
      <!-- @slot Replaces the entire details container with custom content. -->
      <slot name="details">
        <div
          class="ra-content-tile__copy"
          :class="[verticalAlignClasses, horizontalAlignClasses]"
        >
          <!-- @slot Replaces the title and description elements. -->
          <slot name="details-copy">
            <slot name="details-copy-start" />

            <div
              v-if="subtitle"
              class="ra-content-tile__subtitle"
              v-bind="{ ...cmsBindings.subtitle }"
              v-html="subtitle"
            ></div>

            <RaTitle
              class="ra-content-tile__title"
              :level="titleLevel"
              :as="titleAs"
              :title="title"
              v-bind="{ ...cmsBindings.title }"
            >
              <slot name="details-copy-title_icon">
                <RaIcon
                  v-if="titleIcon"
                  :icon="titleIcon"
                  class="ra-content-tile__title-icon"
                />
              </slot>
            </RaTitle>

            <div
              v-if="description"
              class="ra-content-tile__description"
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
              class="ra-content-tile__link-list"
              v-bind="{ ...cmsBindings.links }"
            />
          </slot>
        </div>
      </slot>
    </div>
  </article>
</template>

<script>
import RaIcon from '../../atoms/RaIcon/RaIcon.vue';
import RaImage from '../../atoms/RaImage/RaImage.vue';
import RaVideo from '../../molecules/RaVideo/RaVideo.vue';
import RaTitle from '../../atoms/RaTitle/RaTitle.vue';
import RaComponentAnchorOverlay from '../../atoms/RaComponentAnchorOverlay/RaComponentAnchorOverlay.vue';
import RaLinkList from '../../molecules/RaLinkList/RaLinkList.vue';
import CommonMixins from '@bva/ui-vue/src/mixins/common';

/**
 * Displays media, text, and links in the form of a card or tile.
 * Has controls for text alignment and positioning, background and foreground color, and more.
 * Multiple links can be provided if necessary.
 * Supports optional aspect ratio controls.
 */
export default {
  name: 'RaContentTile',
  components: {
    RaIcon,
    RaImage,
    RaVideo,
    RaTitle,
    RaLinkList,
    RaComponentAnchorOverlay,
  },
  mixins: [CommonMixins],
  props: {
    detailsLocation: {
      type: String,
      default: 'after',
    },
    verticalAlign: {
      type: String,
      default: 'bottom',
    },
    horizontalAlign: {
      type: String,
      default: 'left',
    },
    titleAs: {
      type: Number,
      default: 6,
    },
    aspectRatio: {
      type: String,
      default: 'respect-media',
    },
    /**
     * Control the icon to display next to the title.
     */
    titleIcon: {
      type: [String, Boolean],
      default: undefined,
    },
  },
  computed: {
    media() {
      return {
        image: {
          width: this.getRenderWidth(this.imageWidth),
          height: this.getRenderHeight(this.imageHeight),
        },
        video: {
          width: this.getRenderWidth(this.videoWidth),
          height: this.getRenderHeight(this.videoHeight),
        },
      };
    },
    useAspectRatio() {
      return (
        !!(this.media.image.width && this.media.image.height) ||
        !this.respectMediaRatio
      );
    },
  },
  methods: {
    /**
     * Tests the different aspect ratio types for this specific component,
     * and returns a numeric value that can be used to determine how to format
     * the component's container with aspect-ratio calculations using both `mediaWidth` and `mediaHeight`.
     * @return {Number}
     */
    getRenderWidth(mediaWidth) {
      switch (this.aspectRatio) {
        case 'square':
        case 'tall':
        case 'wide':
          mediaWidth = 1;

          break;
      }

      return mediaWidth;
    },
    /**
     * Shares the same functionality as `getRenderWidth()`.
     * @return {Number}
     */
    getRenderHeight(mediaHeight) {
      switch (this.aspectRatio) {
        case 'square':
          mediaHeight = 1;

          break;
        case 'tall':
          mediaHeight = 1.25;

          break;
        case 'wide':
          mediaHeight = 0.66;

          break;
      }

      return mediaHeight;
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaContentTile.css';
</style>
