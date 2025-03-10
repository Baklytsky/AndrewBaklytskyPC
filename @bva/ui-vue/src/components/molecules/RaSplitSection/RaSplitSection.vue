<template>
  <article
    class="ra-split-section"
    :class="[detailsLocationClasses, aspectRatioClasses]"
    :style="[foregroundVariables, backgroundVariables]"
    v-on="$listeners"
  >
    <RaRow
      class="ra-split-section__layout-container component-layout"
      :gap="false"
    >
      <RaCol
        class="component-media ra-split-section__media-col"
        :size="mediaCol"
        :md="mediaColMD"
        :lg="mediaColLG"
      >
        <div class="ra-split-section__media">
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
              class="ra-split-section__image"
              v-bind="{ ...cmsBindings.image }"
            />

            <RaVideo
              v-if="hasVideo"
              :src="videoSrc"
              :width="media.video.width"
              :height="media.video.height"
              :use-as-background="hasImage"
              :use-aspect-ratio="!hasImage"
              class="ra-split-section__video"
              v-bind="{ ...cmsBindings.video }"
            />
          </slot>
        </div>
      </RaCol>

      <RaCol
        class="component-details ra-split-section__details-col"
        :size="width"
        :md="widthMD"
        :lg="widthLG"
      >
        <div class="ra-split-section__details">
          <!-- @slot Replaces the entire details container with custom content. -->
          <slot name="details">
            <div
              class="ra-split-section__copy"
              :class="[verticalAlignClasses, horizontalAlignClasses]"
            >
              <!-- @slot Replaces the title and description elements. -->
              <slot name="details-copy">
                <slot name="details-copy-start" />

                <div
                  v-if="subtitle"
                  class="ra-split-section__subtitle"
                  v-bind="{ ...cmsBindings.subtitle }"
                  v-html="subtitle"
                ></div>

                <RaTitle
                  class="ra-split-section__title"
                  :level="titleLevel"
                  :as="titleAs"
                  :title="title"
                  v-bind="{ ...cmsBindings.title }"
                />

                <div
                  v-if="description"
                  class="ra-split-section__description"
                  v-bind="{ ...cmsBindings.description }"
                  v-html="description"
                ></div>

                <slot name="details-copy-end" />
              </slot>

              <!-- @slot Replaces the links/CTAs container. -->
              <slot name="details-linkList">
                <RaLinkList
                  :link-list="links"
                  class="ra-split-section__link-list"
                  v-bind="{ ...cmsBindings.links }"
                />
              </slot>
            </div>
          </slot>
        </div>
      </RaCol>
    </RaRow>
  </article>
</template>

<script>
import RaImage from '../../atoms/RaImage/RaImage.vue';
import RaVideo from '../../molecules/RaVideo/RaVideo.vue';
import RaTitle from '../../atoms/RaTitle/RaTitle.vue';
import RaRow from '../../atoms/RaRow/RaRow.vue';
import RaCol from '../../atoms/RaRow/_internal/RaCol.vue';
import RaLinkList from '../../molecules/RaLinkList/RaLinkList.vue';
import CommonMixins from '@bva/ui-vue/src/mixins/common';
import DimensionWidth from '@bva/ui-vue/src/mixins/dimension-width';

/**
 * A side-by-side text + media component, stacks on mobile.
 *
 * Has controls for text alignment and positioning, background and foreground color, and more.
 *
 * Multiple links can be provided if necessary.
 * Supports optional aspect ratio controls.
 */
export default {
  name: 'RaSplitSection',
  components: {
    RaImage,
    RaVideo,
    RaTitle,
    RaLinkList,
    RaRow,
    RaCol,
  },
  mixins: [CommonMixins, DimensionWidth],
  props: {
    titleAs: {
      type: Number,
      default: 4,
    },
    width: {
      type: [String, Number],
      default: 12,
    },
    widthMD: {
      type: [String, Number],
      default: 6,
    },
    widthLG: {
      type: [String, Number],
      default: '',
    },
    mediaCol: {
      type: [String, Number],
      default: 12,
    },
    mediaColMD: {
      type: [String, Number],
      default: 'auto',
    },
    mediaColLG: {
      type: [String, Number],
      default: '',
    },
    aspectRatio: {
      type: String,
      default: 'wide',
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
          mediaHeight = 0.625;

          break;
      }

      return mediaHeight;
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaSplitSection.css';
</style>
