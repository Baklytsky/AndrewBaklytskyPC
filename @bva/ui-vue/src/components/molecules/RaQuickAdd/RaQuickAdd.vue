<template>
  <component
    :is="containerComponent"
    v-bind="containerProps"
    v-on="containerEvents"
  >
    <div
      v-if="visible"
      ref="quickAddEl"
      v-focus-trap="isOverlay"
      v-click-outside="checkPersistence"
      :class="[
        'ra-quick-add',
        `ra-quick-add--${viewportVariant}`,
        inherited.classes,
        {
          'ra-quick-add--atc-visible': addToCart,
        },
      ]"
      tabindex="-1"
      :style="[inherited.styles]"
    >
      <div class="ra-quick-add__panel">
        <RaIconButton
          v-if="closeButton"
          class="ra-quick-add__close-button"
          v-bind="{
            icon: 'cross',
            size: 'xs',
            variant: 'tertiary',
            ...closeButtonProps,
          }"
          @click="dismiss"
        />

        <!--@slot Add additional markup at the beginning of the quickadd panel. -->
        <slot name="panel-start" />

        <div class="ra-quick-add__content">
          <!--@slot Add additional markup at the beginning of the quickadd container. -->
          <slot name="content-start" />

          <div class="ra-quick-add__pickers">
            <component
              :is="getPickerType(type, optionsProps[type])"
              v-for="(group, type) in options"
              :key="`quick-add-picker-${type}`"
              :class="['ra-quick-add__group', `ra-quick-add__group--${type}`]"
              :options="group.values"
              :selected="selected[type]"
              v-bind="{
                type,
                label: type,
                ...inherited.attrs,
                ...inherited.listeners,
                ...optionsProps[type],
              }"
              v-on="$listeners"
            />
          </div>

          <!--@slot Add additional markup after the quickadd option picker. -->
          <slot name="content-after-picker" />

          <slot name="add-to-cart">
            <transition name="ra-fade" appear>
              <RaAddToCart
                v-if="addToCart"
                class="ra-quick-add__atc"
                v-bind="{
                  qtyVisible: false,
                  ...addToCartProps,
                }"
                @click="$emit('click:add-to-cart')"
                v-on="addToCartEvents"
              />
            </transition>
          </slot>

          <!--@slot Add additional markup at the end of the quickadd container. -->
          <slot name="content-end" />
        </div>

        <!--@slot Add additional markup at the end of the quickadd panel. -->
        <slot name="panel-end" />
      </div>
    </div>
  </component>
</template>

<script>
import { computed, watch, nextTick, ref, toRef } from 'vue-demi';
import { useInherited, useViewportProp } from '@bva/ui-vue/src/composables';
import { clickOutside, focusTrap } from '@bva/ui-vue/src/directives';
import { validateViewportProp } from '@bva/ui-shared/helpers';

import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import RaAddToCart from '../RaAddToCart/RaAddToCart.vue';
import RaPicker from '../RaPicker/RaPicker.vue';
import RaOptionPicker from '../RaOptionPicker/RaOptionPicker.vue';
import RaSwatchPicker from '../RaSwatchPicker/RaSwatchPicker.vue';
import RaModal from '../RaModal/RaModal.vue';

/**
 * Displays product options for user to pick from and quickly add to cart.
 */
export default {
  name: 'RaQuickAdd',
  directives: {
    clickOutside,
    focusTrap,
  },
  components: {
    RaIconButton,
    RaAddToCart,
    RaPicker,
    RaOptionPicker,
    RaSwatchPicker,
    RaModal,
  },
  inheritAttrs: false,
  props: {
    /**
     * Controls visibility of the quickadd component.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * When set to `true`, the quickadd component does not close
     * after clicking outside of its container.
     */
    persistent: {
      type: Boolean,
      default: true,
    },
    /**
     * Provide an object or an array of product options to display.
     */
    options: {
      type: [Array, Object],
      default() {
        return {};
      },
    },
    /**
     * Configure the look and feel of each option group,
     * by specifying props on a per-option group basis.
     */
    optionsProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set the selected state object. The structure is an object
     * where the keys are the option types, and the values are the selected value:
     * `{ Size: 'm', Color: 'red' }`
     */
    selected: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Specificy how the quickadd container should look.
     * Display may be configured per-viewport.
     */
    variant: {
      type: [String, Array, Object],
      default() {
        return 'inline';
      },
      validator(prop) {
        return validateViewportProp(prop, ['inline', 'overlay', 'modal']);
      },
    },
    /**
     * Pass props to the RaModal component (when using the "modal" variant).
     */
    modalProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Pass events to the RaModal component (when using the "modal" variant).
     */
    modalEvents: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Controls display of the Add To Cart component
     */
    addToCart: {
      type: Boolean,
      default: true,
    },
    /**
     * Pass props to the RaAddToCart component.
     */
    addToCartProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Pass events to the RaAddToCart component.
     */
    addToCartEvents: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set visibility for the close button functionality.
     */
    closeButton: {
      type: Boolean,
      default: true,
    },
    /**
     * Pass props to the RaIconButton (close button) component.
     */
    closeButtonProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set a transition on a per-viewport basis.
     * Specifying an "expand" transition will use `RaExpand` instead of the regular `transition` component.
     */
    transition: {
      type: [String, Array, Object],
      default() {
        return 'ra-fade';
      },
    },
  },
  setup(props, { emit }) {
    const viewportVariant = useViewportProp(toRef(props, 'variant'));
    const viewportTransition = useViewportProp(toRef(props, 'transition'));

    const quickAddEl = ref(null);

    const isOverlay = computed(() => viewportVariant.value === 'overlay');
    const isModal = computed(() => viewportVariant.value === 'modal');

    //Set the container type based on the `viewportVariant` value.
    const containerComponent = computed(() => {
      return isModal.value ? 'RaModal' : 'transition';
    });

    //Group props that pertain only to a specific type of container.
    const containerProps = computed(() => {
      switch (viewportVariant.value) {
        case 'modal':
          return {
            class: 'ra-quick-add-container--modal',
            visible: props.visible,
            persistent: props.persistent,
            verticalAlign: 'bottom',
            transitionContent: 'ra-slide-bottom',
            closeButton: false,
            ...props.modalProps,
          };
        default:
          return {
            name: viewportTransition.value,
          };
      }
    });

    //Group event handlers that pertain only to a specific type of container.
    const containerEvents = computed(() => {
      switch (viewportVariant.value) {
        case 'modal':
          return {
            'close:modal': dismiss,
            ...props.modalEvents,
          };
        default:
          return {};
      }
    });

    //Methods
    const dismiss = () => {
      emit('close:quickadd');
    };

    const getPickerType = (type) => {
      const pickerType = props.optionsProps[type]?.pickerType;

      switch (pickerType) {
        case 'swatch':
          return 'RaSwatchPicker';
        case 'custom':
          return 'RaPicker';
        default:
          return 'RaOptionPicker';
      }
    };

    const checkPersistence = () => {
      return props.persistent ? false : dismiss();
    };

    watch(
      () => props.visible,
      (newVal) => {
        if (newVal && !isModal.value) {
          nextTick(() => {
            quickAddEl.value.focus();
          });
        }
      }
    );

    return {
      quickAddEl,
      viewportVariant,
      isOverlay,
      //Container props
      containerComponent,
      containerProps,
      containerEvents,
      inherited: useInherited(),
      //Methods
      dismiss,
      getPickerType,
      checkPersistence,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaQuickAdd.css';
</style>
