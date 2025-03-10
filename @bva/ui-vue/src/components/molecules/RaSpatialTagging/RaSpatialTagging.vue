<template>
  <component
    :is="as"
    :class="['ra-spatial-tagging', modifierClass(viewportVariant)]"
  >
    <RaSpatialContent v-if="!isSplitSection" v-bind="{ ...$props }">
      <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
        <slot :name="slotName" v-bind="data"></slot>
      </template>
    </RaSpatialContent>

    <div
      ref="imageMap"
      :class="[
        'ra-spatial-media',
        {
          'ra-spatial-column': isSplitSection,
        },
      ]"
    >
      <RaSpatialGroup
        v-for="(tag, index) in tags"
        :key="`indicator-tag-${index}`"
        :index="index"
        :config="tag"
        :active="getIsActive(index)"
        :popup="!isSplitSection"
        :tag-variant="tagVariant"
        :offset="popupOffset"
        :transition="viewportTransition"
        :product-tile-props="productTileProps"
        :close-button-props="closeButtonProps"
        @click:tag="handleActive(index)"
        @close:popup="handleClose"
      >
        <template #tags>
          <slot
            name="tags"
            v-bind="{
              index,
              selected: getIsActive(index),
              handleTagClick: handleActive,
            }"
          />
        </template>

        <template #[`item-${index}`]="config">
          <slot :name="`item-${index}`" v-bind="config" />
        </template>
      </RaSpatialGroup>

      <RaImage
        class="ra-spatial-tagging__image-wrapper"
        :use-aspect-ratio="true"
        :src="imageSrc"
        :alt="imageAlt"
        :width="imageWidth"
        :height="imageHeight"
        :srcset="imageSrcset"
        v-bind="{ ...cmsBindings.spatialTags }"
      />
    </div>

    <div v-if="isSplitSection" :class="['ra-spatial-widget ra-spatial-column']">
      <RaSpatialContent
        class="ra-spatial-widget__contents"
        v-bind="{ ...$props }"
      >
        <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
          <slot :name="slotName" v-bind="data"></slot>
        </template>
      </RaSpatialContent>

      <div
        class="ra-spatial-widget__carousel"
        v-bind="{ ...cmsBindings.spatialTags }"
      >
        <slot
          v-if="isSplitSection"
          name="widget"
          v-bind="{
            ...$props,
          }"
        >
          <RaCarousel
            v-if="hasCarousel"
            :slide-to-index="activeIndex"
            :nav-size="'md'"
            :settings="carouselSettings"
            v-bind="{ ...carouselProps }"
            @change:slide="(_, index) => handleActive(index)"
            @init:carousel="handleActive(carouselSettings.initialSlide)"
          >
            <RaCarouselItem
              v-for="(tag, index) in tags"
              :key="`spatial-carousel-item-${index}`"
            >
              <slot :name="`item-${index}`">
                <RaSpatialProductTile
                  :product="tag.product"
                  v-bind="productTileProps"
                />
              </slot>
            </RaCarouselItem>
          </RaCarousel>

          <slot v-else-if="!hasCarousel && tags[0]" name="item-0">
            <RaSpatialProductTile
              :product="tags[0].product"
              v-bind="productTileProps"
            />
          </slot>
        </slot>
      </div>
    </div>
  </component>
</template>

<script>
import { computed, ref, toRef, provide } from 'vue-demi';
import { formatModifier, validateViewportProp } from '@bva/ui-shared/helpers';

import RaCarousel from '../RaCarousel/RaCarousel.vue';
import RaCarouselItem from '../RaCarousel/_internal/RaCarouselItem.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaImage from '../../atoms/RaImage/RaImage.vue';

import RaSpatialGroup from './_internal/RaSpatialGroup.vue';
import RaSpatialContent from './_internal/RaSpatialContent.vue';
import RaSpatialProductTile from './_internal/RaSpatialProductTile.vue';

import CommonMixins from '@bva/ui-vue/src/mixins/common';
import { useBreakpoint, useViewportProp } from '@bva/ui-vue/src/composables';

/**
 * CMS driven component displaying an image of products in real life and tags
 * overlaid on each product which allow a user to learn more about a product
 */
export default {
  name: 'RaSpatialTagging',
  components: {
    RaCarousel,
    RaCarouselItem,
    RaImage,
    RaSpatialGroup,
    RaSpatialContent,
    RaSpatialProductTile,
  },
  mixins: [CommonMixins],
  props: {
    /**
     * Customize the HTML tag rendered by the component.
     */
    as: {
      type: String,
      default: 'article',
    },
    /**
     * Control the look and feel of the spatial tagging component
     * on a per-viewport basis.
     */
    variant: {
      type: [String, Array, Object],
      default: 'split',
      validator(prop) {
        return validateViewportProp(prop, ['split', 'full']);
      },
    },
    /**
     * Array of configuration objects to populate tags
     */
    tags: {
      type: Array,
      default: () => [],
    },
    /**
     * Provide an index that should be set as active in the initial render.
     */
    initial: {
      type: Number,
      default: -1,
    },
    /**
     * Props to control the Carousel component in the Spatial Tagging Component
     */
    carouselProps: {
      type: Object,
      default: () => {},
    },
    /**
     * Props to control the Product Tile component in the Spatial Tagging Component
     */
    productTileProps: {
      type: Object,
      default: () => {},
    },
    /**
     * Props for the product info popup close button - RaIconButton
     */
    closeButtonProps: {
      type: Object,
      default: () => {},
    },
    /**
     * Style for the tags / hotspots - used by RaTagIndicator
     */
    tagVariant: {
      type: String,
      default: '',
    },
    /**
     * Focal point used to determine the distance actice product info popup should be from tag
     */
    popupOffset: {
      type: Object,
      default: () => ({
        x: 22,
        y: -10,
      }),
    },
    /**
     * Set the popup transition on a per-viewport basis.
     */
    transition: {
      type: [String, Array, Object],
      default() {
        return {
          base: 'ra-slide-bottom',
          md: 'ra-fade',
        };
      },
    },
    titleAs: {
      type: Number,
      default: 4,
    },
    horizontalAlign: {
      type: String,
      default: 'center',
    },
  },
  setup(props, { slots }) {
    const imageMap = ref(null);
    const activeIndex = ref(props.initial);

    const { isMobile } = useBreakpoint();
    const viewportVariant = useViewportProp(toRef(props, 'variant'));
    const viewportTransition = useViewportProp(toRef(props, 'transition'));

    provide('spatialScope', {
      container: imageMap,
      tags: props.tags,
      isMobile,
    });

    const hasCarousel = computed(() => props.tags.length > 1);

    const carouselSettings = computed(() => {
      return {
        initialSlide: activeIndex.value >= 0 ? activeIndex.value : 0,
      };
    });

    const isSplitSection = computed(() => viewportVariant.value !== 'full');

    //Methods
    const getIsActive = (index) => {
      return index === activeIndex.value;
    };

    const modifierClass = (modifier, prefix) =>
      formatModifier('ra-spatial-tagging', modifier, prefix);

    const handleClose = () => {
      const newActiveIndex = isSplitSection.value ? 0 : -1;

      activeIndex.value = newActiveIndex;
    };

    const handleActive = (tagIndex) => {
      const currentActive = activeIndex.value;
      const newConfig = props.tags[tagIndex];

      handleClose();

      if (isSplitSection.value || currentActive !== tagIndex) {
        activeIndex.value = tagIndex;
      }
    };

    return {
      slots,
      //Ref
      imageMap,
      activeIndex,
      hasCarousel,
      //Computed
      isMobile,
      carouselSettings,
      isSplitSection,
      viewportVariant,
      viewportTransition,
      //Methods
      getIsActive,
      modifierClass,
      handleClose,
      handleActive,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaSpatialTagging.css';
</style>
