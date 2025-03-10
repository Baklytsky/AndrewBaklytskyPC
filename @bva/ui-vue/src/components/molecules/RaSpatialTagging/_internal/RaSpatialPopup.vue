<template>
  <Transition :name="transition" @enter="getBounds">
    <div
      v-if="active"
      :class="[
        'ra-spatial-popup ra-spatial-overlay',
        {
          [invertedClass]: !isMobile,
        },
      ]"
      :style="popupOffset"
    >
      <RaIconButton
        class="ra-spatial-popup__close"
        shape="square"
        icon="cross"
        variant="ghost"
        size="sm"
        v-bind="{
          ...closeButtonProps,
        }"
        @click="$emit('close:popup')"
      />

      <slot :name="`item-${index}`" v-bind="{ variant: 'card' }">
        <RaSpatialProductTile
          :product="config.product"
          variant="card"
          v-bind="{
            ...productTileProps,
          }"
        />
      </slot>
    </div>
  </Transition>
</template>

<script>
import { computed, ref, inject } from 'vue-demi';

import RaIconButton from '../../../atoms/RaIconButton/RaIconButton.vue';
import RaSpatialProductTile from './RaSpatialProductTile.vue';

import { getInvertedClass } from '@bva/ui-shared/helpers';
import { getSpatialPopupOffset } from '@bva/ui-shared/helpers/spatial-tagging';

export default {
  name: 'RaSpatialPopup',
  components: {
    RaIconButton,
    RaSpatialProductTile,
  },
  props: {
    /**
     * A spatial tag configuration object which should include positioning and (product) data.
     */
    config: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Controls the tag's active state.
     */
    active: {
      type: Boolean,
      default: false,
    },
    /**
     * The index at which this spatial popup renders.
     * Used for slot configurations.
     */
    index: {
      type: Number,
      default: 0,
    },
    /**
     * Focal point used to determine the distance actice product info overlay should be from tag.
     */
    offset: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Width and Height measures for the tag this popup pertains to.
     * Used to calculate offsetting values between the tag and the popup.
     */
    tagDimensions: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Additional properties to pass to the product tile component directly.
     * Refer to RaProductTile docs to learn more.
     */
    productTileProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Additional properties to pass to the popup close button component directly.
     * Refer to RaIconButton docs to learn more.
     */
    closeButtonProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * The transition name to use for the popup show/hide animation.
     */
    transition: {
      type: String,
      default: '',
    },
  },
  setup(props, context) {
    const { container, isMobile } = inject('spatialScope', {});

    const invertedClass = ref('');

    const popupOffset = computed(() => {
      if (Object.keys(props.config).length && !isMobile.value) {
        return getSpatialPopupOffset({
          offset: props.offset,
          tagDimensions: props.tagDimensions,
          position: props.config.position,
        });
      }

      return {};
    });

    const getBounds = (el) => {
      const newInvertClass = getInvertedClass(container?.value, el);

      if (newInvertClass) {
        invertedClass.value = newInvertClass;
      }
    };

    return {
      isMobile,
      invertedClass,
      popupOffset,
      //Methods
      getBounds,
    };
  },
};
</script>
