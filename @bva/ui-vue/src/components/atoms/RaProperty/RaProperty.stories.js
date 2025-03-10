import { RaProperty, RaBadge } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Property',
  component: RaProperty,
  argTypes: {
    name: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    value: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    separator: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    stack: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaProperty },
  props: Object.keys(argTypes),
  template: `<RaProperty v-bind="$props" />`,
});

export const Common = Template.bind({});
Common.args = {
  name: 'Material',
  value: 'Cotton',
};

export const NoSeparator = Template.bind({});
NoSeparator.args = {
  ...Common.args,
  separator: false,
};

export const CustomSeparator = Template.bind({});
CustomSeparator.args = {
  ...Common.args,
  separator: ' -> ',
};

export const Stack = Template.bind({});
Stack.args = {
  ...Common.args,
  stack: true,
};

export const Split = Template.bind({});
Split.args = {
  ...Common.args,
  split: true,
};

export const WithNameSlot = (args, { argTypes }) => ({
  components: { RaProperty, RaBadge },
  props: Object.keys(argTypes),
  template: `
  <RaProperty v-bind="$props">
    <template #name="{props}">
      (Product) {{name}}:
    </template>
  </RaProperty>`,
});
WithNameSlot.args = {
  ...Common.args,
};

export const WithValueSlot = (args, { argTypes }) => ({
  components: { RaProperty, RaBadge },
  props: Object.keys(argTypes),
  template: `
  <RaProperty v-bind="$props">
    <template #value="{props}">
      <RaBadge>{{value}}</RaBadge>
    </template>
  </RaProperty>`,
});
WithValueSlot.args = {
  ...Common.args,
};
