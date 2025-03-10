<template>
  <div
    :class="[
      'ra-product-tile',
      {
        'ra-product-tile--default': !isProductCard,
        'ra-product-tile--card': isProductCard,
      },
      inherited.classes,
    ]"
    v-bind="inherited.attrs"
    :style="[inherited.styles]"
  >
    <!--@slot Add content before the tile image container.-->
    <slot name="tile-before-image" />

    <div
      v-if="image"
      :class="[
        'ra-product-tile__media',
        {
          'ra-product-tile__media--card': isProductCard,
        },
      ]"
    >
      <!--@slot Add content to the start of the tile image container.-->
      <slot name="image-start" />

      <!--@slot Replaces the image portion of this tile-->
      <slot
        name="image"
        v-bind="{ title, link, image, imageList, imageDisplayList }"
      >
        <RaLink
          :link="link"
          :raw="true"
          class="ra-product-tile__media-link"
          v-bind="inherited.listeners"
          @click.native="$emit('click:product')"
          v-on="$listeners"
        >
          <RaImage
            v-for="(imageSrc, index) in imageDisplayList"
            :key="`product-tile-${index}`"
            :class="[
              'ra-product-tile__image',
              {
                'ra-product-tile__image--card': isProductCard,
              },
            ]"
            :src="imageSrc"
            v-bind="{
              width: 1,
              height: 1.2,
              alt: title,
              useAspectRatio: true,
              ...imageProps,
            }"
          />
        </RaLink>
      </slot>

      <!--@slot Replaces the badge with custom markup-->
      <slot
        v-if="!isProductCard"
        name="badge"
        v-bind="{ badgeLabel, badgeVariant }"
      >
        <RaBadge
          v-if="badgeLabel"
          :variant="badgeVariant"
          class="ra-product-tile__badge"
          >{{ badgeLabel }}</RaBadge
        >
      </slot>

      <!--@slot Replaces the wishlist button-->
      <slot
        v-if="!isProductCard"
        name="wishlist"
        v-bind="{
          stateWishlistIcon,
          handleWishlistToggle,
        }"
      >
        <RaIconButton
          v-if="wishlist"
          :class="[
            'ra-product-tile__wishlist',
            {
              'ra-product-tile__wishlist--active': isInWishlist,
            },
          ]"
          v-bind="{
            'aria-label': stateWishlistLabel,
            icon: stateWishlistIcon,
            variant: 'tertiary',
            size: 'sm',
            ...wishlistProps,
          }"
          @click="handleWishlistToggle"
        />
      </slot>

      <!--@slot Replaces the add to cart behavior-->
      <slot
        v-if="!isProductCard"
        name="add-to-cart"
        v-bind="{
          title,
        }"
      >
        <RaButton
          v-if="addToCartButton"
          class="ra-product-tile__atc"
          v-bind="{
            'aria-label': `Add to Cart ${title}`,
            variant: 'tertiary',
            size: 'sm',
            ...addToCartProps,
          }"
          @click="$emit('click:add-to-cart')"
        >
          {{ addToCartLabel }}
        </RaButton>
      </slot>

      <!--@slot Add content to the end of the tile image container.-->
      <slot name="image-end" />
    </div>

    <!--@slot Add content before the tile details container.-->
    <slot name="tile-before-details" />

    <div
      :class="{
        'ra-product-tile__details': !isProductCard,
        'ra-product-tile__details--card': isProductCard,
      }"
    >
      <!--@slot Add content to the start of the tile details container.-->
      <slot name="details-start" />

      <!--@slot Replaces the attribute list of this tile-->
      <slot name="attribute" v-bind="{ attribute, attributeList }">
        <p
          v-for="(currentAttr, key) in attributeList"
          :key="key"
          class="ra-product-tile__attribute"
        >
          {{ currentAttr }}
        </p>
      </slot>

      <!--@slot Replaces the tile's title element-->
      <slot name="title" v-bind="{ title, link }">
        <RaLink
          tabindex="-1"
          :link="link"
          :raw="true"
          :class="[
            'ra-product-tile__name',
            { 'ra-product-tile__name--card': isProductCard },
          ]"
          v-bind="inherited.listeners"
          @click.native="$emit('click:product')"
          v-on="$listeners"
          >{{ title }}</RaLink
        >
      </slot>

      <!--@slot Replaces the tile's price element-->
      <slot name="price" v-bind="{ price, specialPrice }">
        <RaPrice
          v-if="price || specialPrice"
          class="ra-product-tile__price"
          :regular="price"
          :special="specialPrice"
        />
      </slot>

      <!--@slot Replaces the tile's rating element-->
      <slot
        v-if="!isProductCard"
        name="rating"
        v-bind="{ ratingScore, ratingProps }"
      >
        <RaRating
          v-if="ratingScore"
          class="ra-product-tile__rating"
          v-bind="{
            score: ratingScore,
            ...ratingProps,
          }"
        />
      </slot>

      <!--@slot Replaces the tile's option list-->
      <slot
        name="picker"
        v-bind="{
          ...pickerViewportProps,
          variant: pickerViewportVariant,
          ...pickerProps,
        }"
      >
        <RaSwatchPicker
          v-if="hasPicker"
          class="ra-product-tile__picker"
          v-bind="{
            ...pickerViewportProps,
            variant: pickerViewportVariant,
            ...pickerProps,
          }"
          v-on="pickerEvents"
        />
      </slot>

      <!--@slot Add content to the end of the tile details container.-->
      <slot name="details-end" />
    </div>

    <!--@slot Add content after the tile details container.-->
    <slot name="tile-after-details" />
  </div>
</template>
<script>
import { computed, ref, toRef } from 'vue-demi';
import { useInherited, useViewportProp } from '@bva/ui-vue/src/composables';

import RaPrice from '../../atoms/RaPrice/RaPrice.vue';
import RaRating from '../../atoms/RaRating/RaRating.vue';
import RaImage from '../../atoms/RaImage/RaImage.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import RaBadge from '../../atoms/RaBadge/RaBadge.vue';
import RaLink from '../../atoms/RaLink/RaLink.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaSwatchPicker from '../../molecules/RaSwatchPicker/RaSwatchPicker.vue';

export default {
  name: 'RaProductTile',
  components: {
    RaPrice,
    RaRating,
    RaImage,
    RaIconButton,
    RaBadge,
    RaLink,
    RaButton,
    RaSwatchPicker,
  },
  inheritAttrs: false,
  props: {
    /**
     * Product title
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Link to product page
     */
    link: {
      type: [String, Object],
      default: '',
    },
    /**
     * Specify one or more images to display with the product tile.
     * A `String` can be passed for single images, otherwise use an `Array`.
     */
    image: {
      type: [Array, String],
      default: '',
    },
    /**
     * Provide props to be passed to the RaImage component.
     */
    imageProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Provide one or more attributes to display as part of the description for the product tile.
     */
    attribute: {
      type: [String, Array],
      default() {
        return [];
      },
    },
    /**
     * Set a custom badge type.
     * Refer to the `RaBadge` component's `type` prop to learn about its options.
     */
    badgeVariant: {
      type: String,
      default: '',
    },
    /**
     * The label to display within the product tile's badge.
     * If left empty, badge will not display.
     */
    badgeLabel: {
      type: String,
      default: '',
    },
    /**
     * Provide props to be passed to the Picker component.
     * Refer to the `RaPicker` docs to learn about supported props.
     */
    pickerProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Provide events to pass to the Picker component.
     * Refer to the `RaPicker` docs to learn about supported props.
     */
    pickerEvents: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Provide the SwatchPicker variant configuration.
     * Object format: `{ '<breakpointName>': 'propValue', ...N }`
     * Array format: `[ {'<breakpointName>': 'propValue'}, ...N ]`.
     *
     * Arrays are applied in the provided order and have more flexibility while objects are matched against a preset ordered breakpoint list.
     */
    pickerVariant: {
      type: [String, Array, Object],
      default: 'scrollable',
    },
    /**
     * Set the rating/review score for the product tile.
     */
    ratingScore: {
      type: Number,
      default: 0,
    },
    /**
     * Provide a set of props to be passed directly to the Rating component.
     * Refer to the `RaRating` docs to learn about supported props.
     */
    ratingProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Product regular price
     */
    price: {
      type: [Number, String],
      default: null,
    },
    /**
     * Product special price
     */
    specialPrice: {
      type: [Number, String],
      default: null,
    },
    /**
     * Toggle the display of the wishlist button.
     */
    wishlist: {
      type: Boolean,
      default: false,
    },
    /**
     * Provide a set of props to be passed directly to the Wishlist button component.
     * Refer to the `RaIconButton` docs to learn about supported props.
     */
    wishlistProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Provide the icons to use for the wishlist states.
     * First item in the array is used for the "not in wishlist" state.
     * Second item in the array is used for the "in wishlist" state.
     */
    wishlistIcon: {
      type: Array,
      default() {
        return ['heart_empty', 'heart'];
      },
    },
    /**
     * Flags the product tile that the item exists in the user's wishlist.
     */
    isInWishlist: {
      type: Boolean,
      default: false,
    },
    /**
     * Toggle display of the ATC button.
     */
    addToCartButton: {
      type: Boolean,
      default: false,
    },
    /**
     * Provide a set of props to be passed directly to the Add To Cart button component.
     * Refer to the `RaButton` docs to learn about supported props.
     */
    addToCartProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set the label to display in the ATC button.
     */
    addToCartLabel: {
      type: String,
      default: 'Add To Cart',
    },
    /**
     * Determines the display of the product tile. Product Cards are more simplifed and do not display as much as a product tile
     */
    variant: {
      type: String,
      default: 'tile',
      validator(value) {
        return ['tile', 'card'].includes(value);
      },
    },
  },
  setup(props, { emit }) {
    //Refs
    const pickerViewportVariant = useViewportProp(
      toRef(props, 'pickerVariant')
    );
    const hasPicker = props.pickerProps?.options?.length > 0;

    //Holds prop configurations that apply only to specific viewports.
    const pickerViewportConfigs = {
      scrollable: {
        size: '1.875rem',
        fillSpace: false,
      },
    };
    const pickerViewportProps = computed(() => {
      return pickerViewportConfigs[pickerViewportVariant.value];
    });

    //Computed
    const stateWishlistIcon = computed(() => {
      return props.isInWishlist ? props.wishlistIcon[1] : props.wishlistIcon[0];
    });

    const stateWishlistLabel = computed(() => {
      return props.isInWishlist
        ? `Remove ${props.title} from wishlist`
        : `Add ${props.title} to wishlist`;
    });

    const imageList = computed(() => {
      return propToArray(props.image);
    });

    const imageDisplayList = computed(() => {
      return imageList.value.slice(0, 2);
    });

    const attributeList = computed(() => {
      return propToArray(props.attribute);
    });

    const isProductCard = computed(() => {
      return props.variant === 'card';
    });

    //Methods
    const handleWishlistToggle = () => {
      emit('click:wishlist', !props.isInWishlist);
    };

    const propToArray = (prop) => {
      if (Array.isArray(prop)) {
        return prop;
      }

      return prop ? [prop] : [];
    };

    return {
      hasPicker,
      pickerViewportVariant,
      pickerViewportProps,
      //Computed
      inherited: useInherited(),
      stateWishlistIcon,
      stateWishlistLabel,
      imageList,
      imageDisplayList,
      attributeList,
      isProductCard,
      //Methods
      handleWishlistToggle,
      propToArray,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaProductTile.css';
</style>
