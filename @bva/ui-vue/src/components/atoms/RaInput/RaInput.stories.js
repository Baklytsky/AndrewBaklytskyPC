import {
  RaInput,
  RaInputLabel,
  RaInputMessage,
  RaInputError,
  RaIcon,
} from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Input Elements/Input',
  component: RaInput,
  subcomponents: {
    RaInputLabel,
    RaInputMessage,
    RaInputError,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['', 'lg', 'xl'],
    },
    change: { action: 'input changed!', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaInput },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  data() {
    return {
      inputValue: this.value,
    };
  },
  template: `
  <RaInput
    v-model="inputValue"
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  type: 'text',
  label: 'First name',
  name: 'name',
};

export const Invalid = Template.bind({});
Invalid.args = {
  ...Common.args,
  errorMessage: 'Please fill this input',
  valid: false,
};

export const WithMessage = Template.bind({});
WithMessage.args = {
  ...Common.args,
  message: 'This is a custom message',
};

export const AsRequired = Template.bind({});
AsRequired.args = {
  ...Common.args,
  required: true,
  message: 'Required',
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  disabled: true,
};

export const ShowPassword = Template.bind({});
ShowPassword.args = {
  ...Common.args,
  type: 'password',
  hasShowPassword: true,
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  ...Common.args,
  placeholder: "I'm a placeholder",
};

export const WithLabelSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  components: { RaInput, RaIcon },
  template: `
  <RaInput
    v-model="inputValue"
    v-bind="$props"
    v-on="actions"
    >
    <template #label="{label}">
      <div class="flex items-center">
        <RaIcon icon="heart" size="10px" right="4px" />
        {{label}}
      </div>
    </template>
  </RaInput>`,
});

WithLabelSlot.args = {
  ...Common.args,
};

export const WithErrorSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  components: { RaInput, RaIcon },
  template: `
  <RaInput
    v-model="inputValue"
    v-bind="$props"
    :showMessage="valid"
  >
    <template #error-message>
      <div class="flex items-center">
        <RaIcon icon="info_shield" size="10px" right="4px" />
        CUSTOM ERROR MESSAGE
      </div>
    </template>
  </RaInput>`,
});

WithErrorSlot.args = {
  ...Invalid.args,
};
