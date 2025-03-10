<template>
  <RaPicker
    :class="[
      'ra-swatch-picker',
      modifierClass(variant),
      {
        'ra-swatch-picker--scrollable-hidden': hideScroll,
        'ra-swatch-picker--client-wait': waitForClient,
      },
    ]"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
      <slot :name="slotName" v-bind="data"></slot>
    </template>

    <template #default="provided">
      <slot v-bind="provided">
        <RaCarousel
          v-if="variant === 'carousel'"
          :settings="{
            slidesPerView: 7,
            spaceBetween: 8,
            loop: false,
            rewind: true,
            freeMode: true,
            ...carouselSettings,
          }"
          v-bind="{
            navVariant: 'ghost',
            ...carouselProps,
          }"
        >
          <RaCarouselItem
            v-for="option in provided.limitedOptions"
            :key="provided.getKeyValue(option, 'value')"
          >
            <RaSwatch
              v-bind="{ ...getOptionConfig(option, provided) }"
              @change="
                (selected) => provided.handleOptionChange(selected, option)
              "
              @mouseenter="$emit('mouseenter:option', option)"
              @mouseleave="$emit('mouseleave:option', option)"
            />
          </RaCarouselItem>
        </RaCarousel>

        <RaGrid
          v-else
          ref="pickerListEl"
          class="ra-swatch-picker__colors"
          :gap="provided.gap"
          :columns="provided.itemsPerRow"
          :repeat-tracks="provided.fillSpace ? '1fr' : '0fr'"
        >
          <RaSwatch
            v-for="(option, i) in provided.limitedOptions"
            :key="provided.getKeyValue(option, 'value')"
            v-bind="{ ...getOptionConfig(option, provided) }"
            :invisible="getIsInvisible(i, provided.limitedOptions)"
            @change="
              (selected) => provided.handleOptionChange(selected, option)
            "
            @mouseenter="$emit('mouseenter:option', option)"
            @mouseleave="$emit('mouseleave:option', option)"
          />
        </RaGrid>
      </slot>

      <!-- @slot Place a custom hidden swatches counter -->
      <slot
        name="swatch-hidden-count"
        v-bind="{
          hiddenCount,
          showMore,
          isScrollable,
          hasScroll,
          handleToggleShowMore,
        }"
      >
        <RaButton
          v-if="isScrollable && hasScroll"
          class="ra-swatch-picker__hidden-count"
          as-text
          @click="handleToggleShowMore"
        >
          <template v-if="showMore"> + {{ hiddenCount }} More </template>
          <template v-else> Show less </template>
        </RaButton>
      </slot>
    </template>
  </RaPicker>
</template>

<script>
import { ref, computed } from 'vue-demi';

import { useOverflowToggle } from '@bva/ui-vue/src/composables';

import RaGrid from '../../atoms/RaGrid/RaGrid.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaSwatch from '../../atoms/RaSwatch/RaSwatch.vue';
import RaPicker from '../RaPicker/RaPicker.vue';
import RaCarousel from '../RaCarousel/RaCarousel.vue';
import RaCarouselItem from '../RaCarousel/_internal/RaCarouselItem.vue';

export default {
  name: 'RaSwatchPicker',
  components: {
    RaPicker,
    RaGrid,
    RaCarousel,
    RaCarouselItem,
    RaButton,
    RaSwatch,
  },
  inheritAttrs: false,
  props: {
    /**
     * Whether or not to display a selection marker.
     */
    displayBadge: {
      type: Boolean,
      default: false,
    },
    /**
     * Modify the Swatch's look and feel by using one of the preset modifiers.
     */
    shape: {
      type: String,
      default: 'rounded',
    },
    /**
     * Use a different layout for the swatch picker.
     * `grid`:
     * Displays the swatches in a grid, which can be customized
     * using the `itemsPerRow`, `fillSpace`, and `gap` props.
     *
     * `scrollable`:
     * Enables scrolling within a single row instead of stacking.
     * When using this option you MUST set a non-percent `size`.
     *
     * `carousel`:
     * Renders the swatches as a RaCarousel.
     * Use the `carouselSettings` and `carouselProps` props
     * to configure the look and feel for the carousel.
     */
    variant: {
      type: String,
      default: 'grid',
    },
    /**
     * Configurations to be passed directly to the carousel plugin.
     */
    carouselSettings: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Prop object to be passed to the carousel component.
     */
    carouselProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  setup(props, { root, slots, emit }) {
    const modifierClass = (modifier, prefix) => {
      return modifier
        ? `ra-swatch-picker--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    };
    const isScrollable = computed(() => {
      return props.variant === 'scrollable';
    });
    const isCarousel = computed(() => {
      return props.variant === 'carousel';
    });
    const isGrid = computed(() => {
      return props.variant === 'grid';
    });

    const pickerListEl = ref(null);

    const {
      hasScroll,
      hiddenCount,
      hideScroll,
      showMore,
      getIsInvisible,
      toggleShowMore,
    } = useOverflowToggle(pickerListEl, { enabled: isScrollable });

    //Prevents unstiled flash while swatche layout is being calculated.
    const waitForClient = computed(
      () => root && root.$isServer && !isGrid.value
    );

    /**
     * Returns a standard option/swatch prop configuration object.
     */
    const getOptionConfig = (option, provided) => {
      return {
        label: provided.getKeyValue(option, 'label'),
        value: provided.getKeyValue(option, 'value'),
        color: provided.getKeyValue(option, 'color'),
        image: provided.getKeyValue(option, 'image'),
        size: provided.size,
        shape: props.shape,
        displayBadge: props.displayBadge,
        selected: provided.isOptionSelected(option),
        disabled: option.disabled,
      };
    };

    const handleToggleShowMore = () => {
      toggleShowMore();

      emit('click:hidden-count-toggle');
    };

    return {
      waitForClient,
      pickerListEl,
      hasScroll,
      hiddenCount,
      showMore,
      hideScroll,

      isScrollable,
      slots,
      modifierClass,

      getOptionConfig,
      getIsInvisible,

      handleToggleShowMore,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaSwatchPicker.css';
</style>
