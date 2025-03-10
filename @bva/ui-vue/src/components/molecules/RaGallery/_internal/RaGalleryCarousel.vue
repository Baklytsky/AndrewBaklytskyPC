<template>
  <div
    :class="[
      'ra-gallery-carousel',
      {
        'ra-gallery-carousel--has-thumbnails': thumbnails,
      },
    ]"
    :style="{
      '--thumbnails-width': thumbnailsWidth,
      '--thumbnails-horizontal-gap': thumbnailsHorizontalGap,
    }"
  >
    <RaIconButton
      v-if="$parent.zoom && $parent.zoomButton"
      class="ra-gallery__zoom-button"
      :size="'lg'"
      :icon="'plus'"
      :icon-size="'lg'"
      :shape="'square'"
      :variant="'tertiary'"
      @click="
        $emit('click:zoomButton', {
          image: currentImage,
          index: currentIndex,
        })
      "
    />

    <RaCarousel
      v-if="thumbnails && !isMobile"
      ref="thumbnails"
      :settings="{
        loop: false,
        rewind: true,
        direction: 'vertical',
        spaceBetween: thumbnailsGap,
        slidesPerView: thumbnailsPerView,
        watchSlidesProgress: true,
        ...thumbnailsSettings,
      }"
      v-bind="{
        navVariant: 'ghost',
        navIcons: {
          prev: 'chevron_up',
          next: 'chevron_down',
        },
        navSize: 'xs',
        navIconSize: 'md',
        navShape: 'square',
        ...thumbnailsProps,
      }"
      :style="{
        ...thumbnailsHeightVars,
      }"
      class="ra-gallery-carousel__thumbnails display--md"
    >
      <RaCarouselItem
        v-for="(image, index) in $parent.processedMedia"
        :key="index"
        class="ra-gallery__item"
      >
        <RaImage
          class="ra-gallery-carousel__thumbnail"
          :src="image.src || image.url"
          :alt="image.alt"
          :width="$parent.imageWidth || image.width"
          :height="$parent.imageHeight || image.height"
          :use-aspect-ratio="true"
        />
      </RaCarouselItem>
    </RaCarousel>

    <RaCarousel
      ref="main"
      thumbs-ref="thumbnails"
      class="ra-gallery-carousel__main"
      :settings="{
        ...carouselSettings,
      }"
      v-bind="{
        navIcons: {
          prev: 'chevron_left',
          next: 'chevron_right',
        },
        ...carouselProps,
      }"
      @change:slide="handleCarouselChange"
      v-on="$listeners"
    >
      <RaCarouselItem
        v-for="(image, index) in $parent.processedMedia"
        :key="index"
        class="ra-gallery__item"
      >
        <!--@slot Use these slots to replace the contents of a specific container within the carousel.-->
        <slot
          :name="`media-${index}`"
          v-bind="{
            isGallery: true,
            index,
            image,
            handleClick,
            handleLoad: () => {},
          }"
        >
          <RaImage
            class="ra-gallery-carousel__image"
            :src="image.src || image.url"
            :alt="image.alt"
            :width="$parent.imageWidth || image.width"
            :height="$parent.imageHeight || image.height"
            :use-aspect-ratio="true"
            @click="handleClick(index, image)"
          />
        </slot>
      </RaCarouselItem>
    </RaCarousel>
  </div>
</template>

<script>
import RaImage from '../../../atoms/RaImage/RaImage.vue';
import RaIconButton from '../../../atoms/RaIconButton/RaIconButton.vue';
import RaCarousel from '../../../molecules/RaCarousel/RaCarousel.vue';
import RaCarouselItem from '../../../molecules/RaCarousel/_internal/RaCarouselItem.vue';
import { getThumbnailsHeightVars } from '@bva/ui-shared/helpers/carousel';
import { useBreakpoint } from '@bva/ui-vue/src/composables';

export default {
  name: 'RaGallery',
  components: {
    RaImage,
    RaIconButton,
    RaCarousel,
    RaCarouselItem,
  },
  inheritAttrs: false,
  props: {
    /**
     * Pass props directly to the "main" carousel component.
     */
    carouselProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Pass settings directly to the "main" carousel plugin.
     * These should follow the JS API for the carousel plugin.
     */
    carouselSettings: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Toggle visibility of the carousel thumbnails.
     */
    thumbnails: {
      type: Boolean,
      default: false,
    },
    /**
     * Pass props directly into the thumbnails carousel component.
     */
    thumbnailsProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Pass settings directly into the thumbnails carousel plugin.
     * These should follow the JS API for the carousel plugin.
     */
    thumbnailsSettings: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Specify the width of the thumbnails container.
     * Can be set using any valid CSS unit value.
     */
    thumbnailsWidth: {
      type: String,
      default: '5rem',
    },
    /**
     * Set the vertical gap used between each slide in the thumbnails carousel.
     * Note: Must be set as an `Integer` in pixels to follow the carousel plugin API.
     */
    thumbnailsGap: {
      type: Number,
      default: 8,
    },
    /**
     * Set the horizontal gap between the thumbnails carousel and the main carousel.
     * Can be set using any valid CSS unit value.
     */
    thumbnailsHorizontalGap: {
      type: String,
      default: '.75rem',
    },
    /**
     * Specify how many items to display at once in the thumbnails carousel.
     */
    thumbnailsPerView: {
      type: Number,
      default: 4,
    },
  },
  setup() {
    const { isMobile } = useBreakpoint();

    return { isMobile };
  },
  data() {
    return {
      currentImage: this.$parent.processedMedia[0],
      currentIndex: 0,
    };
  },
  computed: {
    thumbnailsHeightVars() {
      return getThumbnailsHeightVars(
        this.$parent.imageHeight,
        this.thumbnailsPerView,
        this.thumbnailsGap
      );
    },
    mediaItems() {
      return this.$parent.processedMedia;
    },
  },
  watch: {
    mediaItems(newVal, oldVal) {
      //Force a carousel update when the slides change.
      if (newVal.length !== oldVal.length) {
        this.$nextTick(() => {
          const mainCarousel = this.$refs.main;
          const thumbsCarousel = this.$refs.thumbnails;

          mainCarousel.carouselPlugin.update();
          thumbsCarousel.carouselPlugin.update();
        });
      }
    },
  },
  methods: {
    handleCarouselChange(carousel, index, currentSlide) {
      this.currentIndex = index;
      this.currentImage = this.$parent.processedMedia[index];

      this.$emit('change:slide', {
        carousel,
        index,
        image: this.currentImage,
        el: currentSlide,
      });
    },
    handleClick(index, image) {
      this.$emit('click:galleryMedia', { index, image });
    },
  },
};
</script>
