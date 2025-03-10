<template>
  <div
    :class="[
      'ra-input ra-select',
      {
        'is-selected': value || placeholder,
        'is-invalid': !valid,
        'is-required': required,
        'is-disabled': disabled,
        'ra-select--inline-label': inlineLabel,
      },
      modifierClass(variant),
      inherited.classes,
    ]"
    :style="[inherited.styles]"
  >
    <RaInputLabel v-if="!inlineLabel" :for="inputID" :label="label">
      <slot name="label" v-bind="{ label, selectedOptionLabel }" />
    </RaInputLabel>

    <div class="ra-input__wrapper">
      <select
        :id="inputID"
        ref="dropdown"
        v-focus
        :name="name"
        :value="value"
        :disabled="disabled"
        class="ra-input__control ra-select__control"
        v-bind="{ ...inherited.attrs, ...inherited.listeners }"
        v-on="{
          ...$listeners,
          input: handleInput,
        }"
      >
        <!-- empty option by default, may be used as placeholder -->
        <option
          v-if="placeholder"
          class="ra-select__placeholder ra-select__option"
          :disabled="placeholderDisabled"
          :selected="!!placeholder"
          value
        >
          <slot name="placeholder" v-bind="{ placeholder }">
            {{ placeholder }}
          </slot>
        </option>
        <slot />
      </select>

      <RaInputLabel
        v-if="inlineLabel"
        :for="inputID"
        :label="label"
        raw
        class="ra-input__control ra-select__label--inline set--sibling-focus"
      >
        <slot
          name="label"
          v-bind="{ label, selectedOptionLabel, formattedInlineLabel }"
        >
          {{ formattedInlineLabel }}
        </slot>
      </RaInputLabel>

      <RaIcon :icon="icon" :size="iconSize" class="ra-select__arrow" />
    </div>

    <RaInputMessage :visible="showMessage" :message="message">
      <slot name="message" v-bind="{ message }" />
    </RaInputMessage>

    <RaInputError :visible="!valid" :message="errorMessage">
      <slot name="error-message" v-bind="{ errorMessage }" />
    </RaInputError>
  </div>
</template>
<script>
import { computed, ref, onMounted, nextTick } from 'vue-demi';

import { formatModifier } from '@bva/ui-shared/helpers';
import { useInherited } from '@bva/ui-vue/src/composables';
import { focus } from '@bva/ui-vue/src/directives';

import RaInputLabel from '../../atoms/RaInput/_internal/RaInputLabel.vue';
import RaInputError from '../../atoms/RaInput/_internal/RaInputError.vue';
import RaInputMessage from '../../atoms/RaInput/_internal/RaInputMessage.vue';
import RaIcon from '../../atoms/RaIcon/RaIcon.vue';

export default {
  name: 'RaSelect',
  directives: { focus },
  components: {
    RaInputLabel,
    RaInputMessage,
    RaInputError,
    RaIcon,
  },
  inheritAttrs: false,
  props: {
    /**
     * Value selected.
     */
    value: {
      type: [Number, String],
      default: '',
    },
    /**
     * Select field label
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Form input ID
     */
    id: {
      type: String,
      default: '',
    },
    /**
     * Form input name
     */
    name: {
      type: String,
      default: '',
    },
    /**
     * Required attribute
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * Validate value of form select
     */
    valid: {
      type: Boolean,
      default: true,
    },
    /**
     * Disabled status of form select
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Message to display with the input.
     */
    message: {
      type: String,
      default: '',
    },
    /**
     * Controls visibility for the input message.
     */
    showMessage: {
      type: Boolean,
      default: true,
    },
    /**
     * Error message value of form select. It will be appeared if `valid` is `true`.
     */
    errorMessage: {
      type: String,
      default: 'This field is not correct.',
    },
    /**
     * Adds placeholder
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Displays the placeholder option disabled.
     * This prevents selecting it again once a different option has been selected.
     */
    placeholderDisabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Control which icon to display as the "carat" for the dropdown.
     */
    icon: {
      type: String,
      default: 'chevron_down',
    },
    /**
     * Control the icon size for the dropdown.
     */
    iconSize: {
      type: String,
      default: 'md',
    },
    /**
     * Modify the Select's main look and feel by using one of the preset modifiers:
     * `primary`, `secondary`, `tertiary`, `success`, `warning`, `danger`, `ghost`.
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Displays the dropdown's label within the same box as the options.
     */
    inlineLabel: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit, listeners }) {
    //Holds the currently-selected option's display text.
    const selectedOptionLabel = ref(null);
    const inputID = ref(props.id || props.name);
    const dropdown = ref(null);

    //Computed
    const formattedInlineLabel = computed(() => {
      return `${props.label}: ${
        selectedOptionLabel.value || props.placeholder
      }`;
    });

    //Methods
    const getSelectedOptionLabel = (target) => {
      if (target && target.options && target.options.length > 0) {
        return target.selectedOptions && target.selectedOptions[0]
          ? target.selectedOptions[0].label
          : target.options[0].label;
      }

      return null;
    };

    const updateSelectedOptionLabel = (target) => {
      return (selectedOptionLabel.value = getSelectedOptionLabel(target));
    };

    const handleInput = (event) => {
      emit(
        'input',
        event.target.value,
        updateSelectedOptionLabel(event.target)
      );
    };

    const modifierClass = formatModifier.bind(this, 'ra-select');

    onMounted(() => {
      nextTick(() => {
        updateSelectedOptionLabel(dropdown.value);
      });
    });

    return {
      //Refs
      selectedOptionLabel,
      inputID,
      dropdown,
      //Computed
      inherited: useInherited({ filter: 'input' }),
      formattedInlineLabel,
      //Methods
      getSelectedOptionLabel,
      updateSelectedOptionLabel,
      handleInput,
      modifierClass,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaSelect.css';
</style>
