import { RaCheckbox } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Input Elements/Choice/Checkbox',
  component: RaCheckbox,
  argTypes: {
    variant: {
      control: 'select',
      options: ['', 'classic', 'toggle'],
    },
    change: { action: 'Selected items changed', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaCheckbox },
  props: getProps(argTypes),
  data() {
    return {
      isChecked: this.checked,
    };
  },
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaCheckbox 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  name: 'shipping',
  label: 'I want to create an account',
  variant: 'classic',
};

export const Checked = Template.bind({});
Checked.args = {
  ...Common.args,
  checked: true,
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  required: true,
};

export const WithInfo = Template.bind({});
WithInfo.args = {
  ...Common.args,
  message: 'This is an info message',
};

export const WithCustomError = Template.bind({});
WithCustomError.args = {
  ...Common.args,
  errorMessage: 'Something is wrong',
  valid: false,
};

export const Invalid = Template.bind({});
Invalid.args = {
  ...Common.args,
  valid: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  disabled: true,
};

export const UseCheckmarkSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaCheckbox 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  >
    <template #checkmark="{checked, disabled}">
      <span v-if="checked">👍🏻</span>
      <span v-else>👎🏻</span>
    </template>
  </RaCheckbox>`,
});
UseCheckmarkSlot.args = {
  ...Common.args,
  checked: true,
};

export const UseErrorMessageSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaCheckbox 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  >
    <template #error-message="{ errorMessage }">
      <span> CUSTOM ERROR MESSAGE 👈</span>
    </template>
  </RaCheckbox>`,
});
UseErrorMessageSlot.args = { ...Invalid.args };
