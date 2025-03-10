<template>
  <div
    :class="[
      'ra-choice',
      {
        'is-active': checked,
        'is-invalid': !valid,
        'is-required': required,
        'is-disabled': disabled,
      },
      modifierClass(type),
      modifierClass(variant),
      modifierClass(variant, type),
      inherited.classes,
    ]"
    :style="inherited.styles"
    :data-testid="inputID"
  >
    <input
      :id="inputID"
      v-focus
      :type="type"
      :name="name"
      :value="value"
      :checked="checked"
      :disabled="disabled"
      class="ra-choice__input"
      v-bind="{ ...inherited.attrs, ...inherited.listeners }"
      v-on="{
        ...$listeners,
        change: handleChange,
      }"
    />

    <RaInputLabel
      class="ra-choice__label-container ra-choice__container"
      :for="inputID"
      raw
      data-focus="deep-sibling"
    >
      <!-- @slot Custom check mark markup -->
      <slot name="checkmark" v-bind="{ checked, disabled }">
        <div
          class="ra-choice__checkmark"
          :class="{ 'is-active': checked }"
          data-focus
        >
          <span
            v-if="variant === 'toggle'"
            class="ra-choice__checkmark-icon"
          ></span>
          <RaIcon
            v-else-if="type === 'checkbox' && checked"
            icon="check"
            size="sm"
            class="ra-choice__checkmark-icon"
          />
        </div>
      </slot>

      <!-- @slot Custom choice label markup -->
      <slot name="label" v-bind="{ label }">
        <span class="ra-choice__label">
          {{ label }}
        </span>
      </slot>
    </RaInputLabel>

    <RaInputMessage :visible="showMessage" :message="message">
      <!-- @slot Custom choice message markup -->
      <slot name="message" v-bind="{ message }" />
    </RaInputMessage>

    <RaInputError :visible="!valid" :message="errorMessage">
      <!-- @slot Custom choice error message markup -->
      <slot name="error-message" v-bind="{ errorMessage }" />
    </RaInputError>
  </div>
</template>
<script>
import { computed, ref } from 'vue-demi';

import { useInherited } from '@bva/ui-vue/src/composables';
import { focus } from '@bva/ui-vue/src/directives';

import RaIcon from '../RaIcon/RaIcon.vue';
import RaInputLabel from '../../atoms/RaInput/_internal/RaInputLabel.vue';
import RaInputError from '../../atoms/RaInput/_internal/RaInputError.vue';
import RaInputMessage from '../../atoms/RaInput/_internal/RaInputMessage.vue';

/**
 * Renders a "choice" input field (`radio` or `checkbox`).
 *
 * The component can be rendered in a variety of options, including toggle, box, and the classic checkbox or radio.
 */
export default {
  name: 'RaChoice',
  directives: {
    focus,
  },
  components: {
    RaIcon,
    RaInputLabel,
    RaInputError,
    RaInputMessage,
  },
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    type: {
      type: String,
      default: 'checkbox',
      validator(value) {
        return ['checkbox', 'radio'].includes(value);
      },
    },
    id: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Boolean],
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    variant: {
      type: String,
      default: 'classic',
      validator(value) {
        return ['classic', 'toggle', 'box'].includes(value);
      },
    },
    required: {
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
     * Error message value of select. It will be appeared if `valid` is `true`.
     */
    errorMessage: {
      type: String,
      default: 'This field is not correct.',
    },
    valid: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    checked: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const inputID = ref(props.id || props.name);

    const handleChange = () => {
      emit('change', !props.checked);
    };

    const modifierClass = (modifier, prefix) => {
      return modifier
        ? `ra-choice--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    };

    return {
      inherited: useInherited({ filter: 'change' }),
      inputID,
      handleChange,
      modifierClass,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/atoms/RaChoice.css';
</style>
