import { RaRadioGroup } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Input Elements/Choice/RadioGroup',
  component: RaRadioGroup,
  argTypes: {
    customProp: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    click: {
      action: 'RadioGroup clicked',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaRadioGroup },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
    <RaRadioGroup
      v-bind="$props"
      :radioItems="radioItems"
      :legend="legend"
      v-on="actions"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  legend: 'Shipping Methods',
  radioItems: [
    {
      name: 'usps',
      label: 'Select USPS',
      checked: true,
      message: 'A description',
    },
    {
      name: 'fedex',
      label: 'Select Fedex',
      checked: false,
      message: 'A description',
    },
    {
      name: 'UPS',
      label: 'Select UPS',
      checked: false,
      message: 'A description',
    },
  ],
};

export const WithExtraMessage = Template.bind({});
WithExtraMessage.args = {
  ...Common.args,
  radioItems: [
    {
      name: 'usps',
      label: 'Select USPS',
      checked: true,
      message: 'A description',
      extraMessage: 'Free',
    },
    {
      name: 'fedex',
      label: 'Select Fedex',
      checked: false,
      message: 'A description',
      extraMessage: 'Free',
    },
    {
      name: 'UPS',
      label: 'Select UPS',
      checked: false,
      message: 'A description',
      extraMessage: 'Free',
    },
  ],
};

export const Separated = Template.bind({});
Separated.args = {
  ...Common.args,
  variant: 'separate',
};
