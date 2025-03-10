<template>
  <fieldset class="ra-radio-group">
    <legend :class="['ra-radio-group__legend', legendClass]">
      <slot name="legend">
        {{ legend }}
      </slot>
    </legend>
    <RaList
      :class="[
        'ra-radio-group__container',
        formatModifier('ra-radio-group__container', variant),
        containerClass,
      ]"
    >
      <RaListItem
        v-for="radioItem in reactiveRadioOptions"
        :key="radioItem.name"
        :class="[
          'ra-radio-group__item',
          formatModifier('ra-radio-group__item', variant),
          itemClass,
        ]"
      >
        <RaRadio
          v-bind="{ ...radioProps }"
          :name="radioItem.name"
          :label="radioItem.label"
          :message="radioItem.message"
          :checked="radioItem.checked"
          :value="radioItem.value || radioItem.name"
          @change="() => changeSelected(radioItem)"
        >
          <template #label>
            <slot name="radio-label" v-bind="radioItem"> </slot>
          </template>
        </RaRadio>
        <slot name="extra-message">
          <span>{{ radioItem.extraMessage }}</span>
        </slot>
      </RaListItem>
    </RaList>
  </fieldset>
</template>

<script>
import RaRadio from '../RaRadio/RaRadio.vue';
import RaList from '../../molecules/RaList/RaList.vue';
import RaListItem from '../../molecules/RaList/_internal/RaListItem.vue';
import {
  updateSelectedRadioOption,
  formatModifier,
} from '@bva/ui-shared/helpers';
import { ref, watch } from 'vue-demi';

/**
 * Grouped radio buttons where only one can have a "checked" state
 */
export default {
  name: 'RaRadioGroup',
  components: {
    RaRadio,
    RaList,
    RaListItem,
  },
  props: {
    /**
     * Config options for each RaRadio component
     */
    radioItems: {
      type: Array,
      default: () => [],
    },
    /**
     * The legend of the fieldset text
     */
    legend: {
      type: String,
      default: '',
    },
    /**
     * Class name for each radio button
     */
    itemClass: {
      type: String,
      default: '',
    },
    /**
     * Class to style the container of the radio buttons
     */
    containerClass: {
      type: String,
      default: '',
    },
    /**
     * Class to style the legend html tag
     */
    legendClass: {
      type: String,
      default: '',
    },
    /**
     * Props for RaRadio
     */
    radioProps: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Styling if radio buttons are grouped
     */
    variant: {
      type: String,
      default: 'combo',
      validator(value) {
        return ['combo', 'separate'].includes(value);
      },
    },
  },
  setup(props, { emit }) {
    const reactiveRadioOptions = ref(props.radioItems);

    const changeSelected = (selectedRadioOption) => {
      reactiveRadioOptions.value = updateSelectedRadioOption(
        selectedRadioOption,
        reactiveRadioOptions.value
      );
      emit('change', selectedRadioOption);
    };

    watch(
      () => props.radioItems,
      (newVal) => {
        reactiveRadioOptions.value = newVal;
      }
    );

    return {
      reactiveRadioOptions,
      changeSelected,
      formatModifier,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaRadioGroup.css';
</style>
