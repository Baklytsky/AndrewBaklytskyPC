import { RaInputCombo, RaButton } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/InputCombo',
  component: RaInputCombo,
  argTypes: {
    value: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    buttonText: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    'click:button': {
      action: 'InputCombo clicked',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaInputCombo },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
    <RaInputCombo
      v-bind="$props"
      v-on="actions"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  value: 'Test',
  buttonText: 'Click Here',
};

export const UseBeforeActionSlot = (args, { argTypes }) => ({
  components: { RaInputCombo, RaButton },
  props: getProps(argTypes),
  template: `
    <RaInputCombo v-bind="$props">
      <template #action-before>
        <RaButton variant="ghost">extra control</RaButton>
      </template>
    </RaInputCombo>
  `,
});

UseBeforeActionSlot.args = {
  ...Common.args,
};

export const Split = Template.bind({});
Split.args = {
  ...Common.args,
  variant: 'split',
};

export const Stacked = Template.bind({});
Stacked.args = {
  ...Common.args,
  variant: 'stacked',
};
