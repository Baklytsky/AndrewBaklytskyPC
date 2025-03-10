<template>
  <div
    :class="[
      'ra-input',
      {
        'is-filled': !!value,
        'is-invalid': !valid,
        'is-required': !!required,
        'is-disabled': !!disabled,
      },
      modifierClass(size),
      inherited.classes,
    ]"
    :data-testid="inputID"
    :style="[inherited.styles]"
  >
    <RaInputLabel :for="inputID" :label="label" :class="labelClass">
      <slot name="label" v-bind="{ label }" />
    </RaInputLabel>

    <div class="ra-input__wrapper">
      <input
        :id="inputID"
        v-bind="{ ...inherited.attrs, ...inherited.listeners }"
        v-model="inputValue"
        v-focus
        :class="[
          'ra-input__control ra-input__control--text',
          {
            'ra-input--password': isPassword,
          },
          inputClass,
        ]"
        :type="inputType"
        :name="name"
        :required="required"
        :disabled="disabled"
        :placeholder="placeholder"
        v-on="{
          ...$listeners,
          input: handleInput,
        }"
      />

      <slot v-bind="inputActionSlotScope" name="input-action">
        <RaIconButton
          v-if="isPassword"
          :class="[
            'ra-input__password-button',
            {
              'ra-input__password-button--password-visible': isPasswordVisible,
            },
          ]"
          type="button"
          aria-label="switch-visibility-password"
          :aria-pressed="isPasswordVisible.toString()"
          :variant="'ghost'"
          :size="'xs'"
          :icon-size="'sm'"
          :icon="'show_password'"
          @click="togglePasswordVisibility"
        />
      </slot>
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
import { computed, ref, watch } from 'vue-demi';
import { formatModifier, getConstrainedValue } from '@bva/ui-shared/helpers';
import { useInherited } from '@bva/ui-vue/src/composables';
import { focus } from '@bva/ui-vue/src/directives';

import RaInputLabel from './_internal/RaInputLabel.vue';
import RaInputError from './_internal/RaInputError.vue';
import RaInputMessage from './_internal/RaInputMessage.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';

export default {
  name: 'RaInput',
  directives: {
    focus,
  },
  components: { RaIconButton, RaInputLabel, RaInputMessage, RaInputError },
  inheritAttrs: false,
  props: {
    /**
     * Current input value (`v-model`)
     */
    value: {
      type: [String, Number],
      default: '',
    },
    /**
     * Form input label
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
     * Form input type
     */
    type: {
      type: String,
      default: 'text',
    },
    /**
     * Validation state for the input.
     */
    valid: {
      type: Boolean,
      default: true,
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
     * Error message to display in validation fails. Renders when the `valid` prop is falsey.
     */
    errorMessage: {
      type: String,
      default: '',
    },
    /**
     * Native input required attribute
     */
    required: {
      type: Boolean,
      default: false,
      description: 'Native input required attribute',
    },
    /**
     * Native input disabled attribute
     */
    disabled: {
      type: Boolean,
      default: false,
      description: 'Native input disabled attribute',
    },
    /**
     * Status of show password icon display
     */
    hasShowPassword: {
      type: Boolean,
      default: false,
    },
    /**
     * Add one or more custom classes directly into the `<input>` element.
     */
    inputClass: {
      type: [String, Array],
      default: '',
    },
    /**
     * Sets the placeholder label for the input.
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Control the overall size for the input.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Class for label element
     */
    labelClass: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit, attrs }) {
    const inputID = ref(props.id || props.name);
    const inputType = ref(props.type);
    const inputValue = ref(props.value);
    const isPasswordVisible = ref(false);

    const isPassword = computed(() => {
      return props.type === 'password' && props.hasShowPassword;
    });

    const inputActionSlotScope = computed(() => {
      return isPassword.value
        ? {
            isPasswordVisible: isPasswordVisible.value,
            togglePasswordVisibility,
          }
        : {};
    });

    const togglePasswordVisibility = () => {
      isPasswordVisible.value = !isPasswordVisible.value;
      inputType.value = isPasswordVisible.value ? 'text' : 'password';
    };

    const modifierClass = formatModifier.bind(this, 'ra-input');

    const handleInput = (event) => {
      if (props.type === 'number' && (attrs.min || attrs.max)) {
        inputValue.value = getConstrainedValue(
          event.target.value,
          attrs.min,
          attrs.max
        );
      } else {
        inputValue.value = event.target.value;
      }

      emit('input', inputValue.value);
    };

    //Watch for value prop changes coming from parent components.
    watch(
      () => props.value,
      (newVal) => {
        inputValue.value = newVal;
      }
    );

    return {
      //Refs
      inputID,
      inputType,
      inputValue,
      isPasswordVisible,
      //Computed
      inherited: useInherited({ filter: 'input' }),
      isPassword,
      inputActionSlotScope,
      //Methods
      modifierClass,
      handleInput,
      togglePasswordVisibility,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaInput.css';
</style>
