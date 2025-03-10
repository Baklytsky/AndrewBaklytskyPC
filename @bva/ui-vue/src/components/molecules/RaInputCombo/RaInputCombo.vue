<template>
  <RaInput
    v-bind="{ ...inputProps }"
    v-model="inputValue"
    :class="['ra-input-combo', formatModifier('ra-input-combo', variant)]"
    :input-class="[
      'ra-input-combo__input',
      formatModifier('ra-input-combo__input', variant),
    ]"
    :value="inputValue"
    @input="$emit('input', inputValue)"
  >
    <template #label>
      <slot name="label"></slot>
    </template>
    <template #input-action>
      <div
        v-if="hasBeforeActionSlot"
        :class="formatModifier('ra-input-combo__before', variant)"
      >
        <slot name="action-before"></slot>
      </div>
      <RaButton
        class="ra-input-combo__button"
        v-bind="{ ...buttonProps }"
        @click="$emit('click:button', inputValue)"
      >
        <slot>
          {{ buttonText }}
        </slot>
      </RaButton>
    </template>
  </RaInput>
</template>

<script>
import { RaInput, RaButton } from '@bva/ui-vue';
import { computed, ref } from 'vue-demi';
import { formatModifier } from '@bva/ui-shared/helpers';
export default {
  name: 'RaInputCombo',
  components: {
    RaInput,
    RaButton,
  },
  props: {
    /**
     * The text content of the button
     */
    buttonText: {
      type: String,
      default: '',
    },
    /**
     * The input value
     */
    value: {
      type: String,
      default: '',
    },
    /**
     * Object of props to pass to RaButton
     */
    buttonProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Object of props to pass to RaInput
     */
    inputProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Styling of input combo
     */
    variant: {
      type: String,
      default: 'combo',
      validator: (value) => ['combo', 'split', 'stacked'],
    },
  },
  setup(props, { slots }) {
    const hasBeforeActionSlot = computed(() => !!slots['action-before']);
    const inputValue = ref(props.value);

    return {
      hasBeforeActionSlot,
      inputValue,
      formatModifier,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaInputCombo.css';
</style>
