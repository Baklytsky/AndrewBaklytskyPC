<template>
  <div
    :class="[
      'ra-input ra-textarea',
      {
        'is-filled': !!value,
        'is-invalid': !valid,
        'is-required': !!required,
        'is-disabled': !!disabled,
      },
      inherited.classes,
    ]"
    :style="[inherited.styles]"
  >
    <RaInputLabel :for="inputID" :label="label">
      <slot name="label" v-bind="{ label }" />
    </RaInputLabel>

    <textarea
      :id="inputID"
      class="ra-textarea__control"
      :value="value"
      :name="name"
      :placeholder="placeholder"
      :cols="cols"
      :rows="rows"
      :wrap="wrap"
      :disabled="disabled"
      :required="required"
      :maxlength="maxlength"
      :minlength="minlength"
      v-bind="{ ...inherited.attrs, ...inherited.listeners }"
      v-on="{
        ...$listeners,
        input: handleInput,
      }"
    />

    <RaInputMessage :visible="showMessage" :message="message">
      <slot name="message" v-bind="{ message }" />
    </RaInputMessage>

    <RaInputError :visible="!valid" :message="errorMessage">
      <slot name="error-message" v-bind="{ errorMessage }" />
    </RaInputError>

    <RaButton
      v-if="buttonLabel"
      :full-width="true"
      :size="'lg'"
      :variant="'primary'"
      class="ra-textarea__button"
      @click="$emit('click:button')"
    >
      {{ buttonLabel }}
    </RaButton>
  </div>
</template>
<script>
import { computed, ref } from 'vue-demi';
import { useInherited } from '@bva/ui-vue/src/composables';
import { focus } from '@bva/ui-vue/src/directives';

import RaInputLabel from '../RaInput/_internal/RaInputLabel.vue';
import RaInputError from '../RaInput/_internal/RaInputError.vue';
import RaInputMessage from '../RaInput/_internal/RaInputMessage.vue';
import RaButton from '../RaButton/RaButton.vue';

export default {
  name: 'RaTextarea',
  directives: {
    focus,
  },
  components: { RaInputLabel, RaInputMessage, RaInputError, RaButton },
  props: {
    /**
     * Current textarea value (`v-model`).
     */
    value: {
      type: [String, Number],
      default: '',
    },
    /**
     * Textarea label.
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
     * Textarea name.
     */
    name: {
      type: String,
      default: '',
    },
    /**
     * The visible width of the text control. It must be a positive integer.
     * If it is not specified, the default value is 20.
     */
    cols: {
      type: [String, Number],
      default: '32',
    },
    /**
     * The number of visible text lines for the control.
     */
    rows: {
      type: [String, Number],
      default: '4',
    },
    /**
     * The maximum number of characters that the user can enter.
     * If this value isn't specified, the user can enter an unlimited number of characters.
     */
    maxlength: {
      type: [String, Number],
      default: '',
    },
    /**
     * The minimum number of characters required that the user should enter.
     */
    minlength: {
      type: [String, Number],
      default: '',
    },
    /**
     * Indicates how the control wraps text. Possible values are soft, hard, off.
     * Default value is soft.
     */
    wrap: {
      type: String,
      default: 'soft',
      validator: (value) => {
        return ['soft', 'hard', 'off'].includes(value);
      },
    },
    /**
     * Validate value of textarea.
     */
    valid: {
      type: Boolean,
      default: true,
    },
    /**
     * Message to display with the textarea.
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
     * Native textarea required attribute.
     */
    required: {
      type: Boolean,
      default: false,
      description: 'Native textarea required attribute',
    },
    /**
     * Placeholder for textarea.
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Native textarea disabled attribute.
     */
    disabled: {
      type: Boolean,
      default: false,
      description: 'Native input disabled attribute',
    },
    /**
     * Label to display in the textarea's button.
     * If this prop is empty the button is not rendered.
     */
    buttonLabel: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const inputID = ref(props.id || props.name);

    const handleInput = (event) => {
      emit('input', event.target.value);
    };

    return {
      //Refs
      inputID,
      //Computed
      inherited: useInherited({ filter: 'input' }),
      //Methods
      handleInput,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaTextarea.css';
</style>
