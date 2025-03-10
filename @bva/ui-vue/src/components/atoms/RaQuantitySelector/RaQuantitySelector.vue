<template>
  <RaGrid
    :class="['ra-quantity-selector', modifierClass(variant), inherited.classes]"
    :gap="gap"
    :style="[inherited.styles]"
  >
    <RaSelect
      v-if="variant === 'dropdown'"
      :value="qty"
      :disabled="isDisabled"
      :icon="'chevron_up'"
      class="ra-quantity-selector__dropdown"
      data-testid="ra-quantity-selector dropdown"
      v-bind="{ ...inherited.attrs, ...inherited.listeners }"
      v-on="{
        ...$listeners,
        input: handleInput,
      }"
    >
      <!--@slot Use the default slot to add custom options to the dropdown.-->
      <slot>
        <RaSelectOption v-for="item in optionList" :key="item" :value="item">
          {{ item }}
        </RaSelectOption>
      </slot>
    </RaSelect>

    <template v-else>
      <RaIconButton
        class="ra-quantity-selector__button ra-quantity-selector__button--minus"
        v-bind="{
          disabled: isDisabledDecrease,
          variant: 'tertiary',
          icon: 'minus',
          iconSize: 'sm',
          shape: 'square',
          ...qtyControlProps,
          ...qtyDecreaseProps,
        }"
        @click="handleInput(qty - step)"
      />

      <RaInput
        v-bind="{
          ...inherited.attrs,
          ...inherited.listeners,
        }"
        :value="qty"
        type="number"
        :disabled="isDisabled"
        class="ra-quantity-selector__input"
        :min="min"
        :max="max"
        data-testid="ra-quantity-selector input"
        v-on="{
          ...$listeners,
          input: handleInput,
        }"
      />

      <RaIconButton
        class="ra-quantity-selector__button ra-quantity-selector__button--plus"
        v-bind="{
          disabled: isDisabledIncrease,
          variant: 'tertiary',
          icon: 'plus',
          iconSize: 'sm',
          shape: 'square',
          ...qtyControlProps,
          ...qtyIncreaseProps,
        }"
        @click="handleInput(parseInt(qty) + step)"
      />
    </template>
  </RaGrid>
</template>
<script>
import { computed, ref, watch } from 'vue-demi';
import { useInherited } from '@bva/ui-vue/src/composables';
import { watchDebounced } from '@vueuse/core';
import {
  getNumberedList,
  getConstrainedValue,
  formatModifier,
} from '@bva/ui-shared/helpers';

import RaGrid from '../../atoms/RaGrid/RaGrid.vue';
import RaInput from '../../atoms/RaInput/RaInput.vue';
import RaSelect from '../../atoms/RaSelect/RaSelect.vue';
import RaSelectOption from '../../atoms/RaSelect/_internal/RaSelectOption.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';

export default {
  name: 'RaQuantitySelector',
  components: {
    RaGrid,
    RaInput,
    RaIconButton,
    RaSelect,
    RaSelectOption,
  },
  inheritAttrs: false,
  model: {
    prop: 'qty',
    event: 'input',
  },
  props: {
    /**
     * The numeric value to set on the quantity selector.
     */
    qty: {
      type: [Number, String],
      default: 1,
    },
    /**
     * Controls the disabled state.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Automatically disables the "plus" and "minus" controls when the
     * `max` or `min` values are reached, respectively.
     */
    disableControlsOnLimit: {
      type: Boolean,
      default: false,
    },
    /**
     * Choose which quantity selector view type to use.
     * Currently supported values: `dropdown`, `input`.
     */
    variant: {
      type: String,
      default: 'input',
    },
    /**
     * The minimum allowed value supported.
     */
    min: {
      type: Number,
      default: 1,
    },
    /**
     * The maximum allowed value supported.
     */
    max: {
      type: Number,
      default: 999,
    },
    /**
     * How many digits to increment or decrement when using the +/- buttons.
     * Also used to generate the option list by every `step` between the `min` and `max` props.
     */
    step: {
      type: Number,
      default: 1,
    },
    /**
     * Specify one or more gap values to use within the grid.
     * Supported formats:
     * * Single global value in the form of a string or integer.
     * * Object literal with individual values for `sm`, `md`, and/or `lg` viewports.
     * * Array of Strings which are parsed in the order they're set.
     *   The first item in the array is used for the global viewport, the second for medium viewports, and so forth.
     * * Boolean which when set to `false` removes the gaps.
     */
    gap: {
      type: [Object, Array, String, Boolean],
      default() {
        return '';
      },
    },
    /**
     * Props to pass to both "plus" and "minus" RaIconButton components.
     */
    qtyControlProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Props to pass to the "plus" RaIconButton component.
     */
    qtyIncreaseProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Props to pass to the "minus" RaIconButton component.
     */
    qtyDecreaseProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Set the wait timeout for when to fire the debounced change event.
     */
    debounceWait: {
      type: Number,
      default: 1500,
    },
    /**
     * Display a loading state on the quantity selector.
     * This also disables the inputs.
     */
    loading: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const inputValue = ref(props.qty);

    //Computed
    const optionList = computed(() => {
      return getNumberedList(props.min, props.max, props.step);
    });

    const isDisabled = computed(() => props.disabled || props.loading);
    const isDisabledIncrease = computed(
      () =>
        isDisabled.value ||
        (props.disableControlsOnLimit && props.qty >= props.max)
    );
    const isDisabledDecrease = computed(
      () =>
        isDisabled.value ||
        (props.disableControlsOnLimit && props.qty <= props.min)
    );

    const handleInput = (qty) => {
      inputValue.value = getConstrainedValue(qty, props.min, props.max);
    };

    const modifierClass = formatModifier.bind(this, 'ra-quantity-selector');

    watch(inputValue, (newVal) => {
      //`input` event deprecated. Use `change` instead.
      emit('input', newVal);

      emit('change', newVal);

      if (newVal >= props.max) {
        emit('reach:max', newVal);
      }

      if (newVal <= props.min) {
        emit('reach:min', newVal);
      }
    });

    watchDebounced(
      inputValue,
      (newVal) => {
        emit('change:debounced', newVal);
      },
      { debounce: props.debounceWait }
    );

    return {
      //Computed
      isDisabled,
      isDisabledIncrease,
      isDisabledDecrease,
      inherited: useInherited({ filter: 'input' }),
      optionList,
      //Methods
      handleInput,
      modifierClass,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaQuantitySelector.css';
</style>
