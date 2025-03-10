import { RaQuantitySelector } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Input Elements/QuantitySelector',
  component: RaQuantitySelector,
  argTypes: {
    qty: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    disabled: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    variant: {
      control: {
        type: 'select',
        options: ['input', 'dropdown'],
      },
      table: {
        category: 'Props',
      },
    },
    min: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    max: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    step: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaQuantitySelector },
  props: Object.keys(argTypes),
  data() {
    return {
      inputValue: this.qty,
    };
  },
  template: `
  <RaQuantitySelector
    v-model="inputValue"
    v-bind="$props"
    aria-label="Quantity"
  />`,
});

export const Common = Template.bind({});

export const WithSteps = Template.bind({});
WithSteps.args = {
  min: 2,
  step: 2,
  qty: 2,
};

export const AsDropdown = Template.bind({});
AsDropdown.args = {
  variant: 'dropdown',
  max: 10,
};

export const AsDropdownWithSteps = Template.bind({});
AsDropdownWithSteps.args = {
  ...AsDropdown.args,
  qty: 4,
  min: 4,
  step: 4,
  max: 40,
};

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };
