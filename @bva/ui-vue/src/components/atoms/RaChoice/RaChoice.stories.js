import { RaChoice } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Input Elements/Choice/Choice',
  component: RaChoice,
  argTypes: {
    checked: {
      type: 'boolean',
    },
    change: { action: 'Selected items changed' },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaChoice },
  props: getProps(argTypes),
  data() {
    return {
      isChecked: this.checked,
    };
  },
  watch: {
    checked(value) {
      this.isChecked = value;
    },
  },
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaChoice 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  name: 'shipping',
  label: 'I want to create an account',
};

export const Checked = Template.bind({});
Checked.args = {
  ...Common.args,
  checked: true,
};

export const Toggle = Template.bind({});
Toggle.args = {
  ...Common.args,
  variant: 'toggle',
};

export const ToggleChecked = Template.bind({});
ToggleChecked.args = {
  ...Checked.args,
  variant: 'toggle',
};

export const Box = Template.bind({});
Box.args = {
  ...Common.args,
  variant: 'box',
};

export const BoxChecked = Template.bind({});
BoxChecked.args = {
  ...Checked.args,
  variant: 'box',
};
