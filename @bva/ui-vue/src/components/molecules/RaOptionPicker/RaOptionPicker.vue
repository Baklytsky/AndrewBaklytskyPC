<template>
  <RaPicker
    :class="['ra-option-picker', modifierClass(variant)]"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
      <slot :name="slotName" v-bind="data"></slot>
    </template>

    <template #default="provided">
      <slot v-bind="provided">
        <component
          :is="isDropdown ? 'RaSelect' : 'RaGrid'"
          :class="[
            {
              'ra-option-picker__items': !isDropdown,
            },
          ]"
          v-bind="{ ...getPickerProps(provided) }"
          v-on="isDropdown ? { input: provided.handleDropdownChange } : {}"
        >
          <RaOption
            v-for="option in provided.limitedOptions"
            :key="provided.getKeyValue(option, 'value')"
            :label="provided.getKeyValue(option, 'label')"
            :value="provided.getKeyValue(option, 'value')"
            :size="provided.size"
            :variant="variant"
            :selected="provided.isOptionSelected(option)"
            :disabled="provided.getKeyValue(option, 'disabled')"
            @change="
              (selected) => provided.handleOptionChange(selected, option)
            "
          />
        </component>
      </slot>
    </template>
  </RaPicker>
</template>

<script>
import { computed } from 'vue-demi';
import { formatModifier } from '@bva/ui-shared/helpers';

import RaPicker from '../RaPicker/RaPicker.vue';
import RaGrid from '../../atoms/RaGrid/RaGrid.vue';
import RaSelect from '../../atoms/RaSelect/RaSelect.vue';
import RaOption from './_internal/RaOption.vue';

export default {
  name: 'RaOptionPicker',
  components: {
    RaPicker,
    RaGrid,
    RaSelect,
    RaOption,
  },
  inheritAttrs: false,
  props: {
    /**
     * Label for the first option in the dropdown.
     * This option remains valueless.
     */
    placeholderLabel: {
      type: String,
      default: '',
    },
    /**
     * Modify the option's look and feel by using one of the preset modifiers.
     * Accepted values: `grid`, `dropdown`.
     */
    variant: {
      type: String,
      default: 'grid',
    },
  },
  setup(props, { slots }) {
    const isDropdown = computed(() => {
      return props.variant === 'dropdown';
    });

    const modifierClass = formatModifier.bind(this, 'ra-option-picker');

    const getPickerProps = (options) => {
      if (isDropdown.value) {
        return {
          value: options.multiple ? undefined : options.selected,
          multiple: options.multiple && 'multiple',
          placeholder: props.placeholderLabel,
        };
      } else {
        return {
          gap: options.gap,
          columns: options.itemsPerRow,
          repeatTracks: options.fillSpace ? '1fr' : '0fr',
        };
      }
    };

    return {
      slots,
      isDropdown,
      modifierClass,
      getPickerProps,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaOptionPicker.css';
</style>
