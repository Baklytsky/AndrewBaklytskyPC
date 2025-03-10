import { RaPrice, RaBadge } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Price',
  component: RaPrice,
  argTypes: {
    regular: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    special: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaPrice },
  props: Object.keys(argTypes),
  template: `<RaPrice :special="special" :regular="regular" />`,
});

export const Common = Template.bind({});
Common.args = {
  regular: '$200.00',
};

export const UseSpecial = Template.bind({});
UseSpecial.args = {
  ...Common.args,
  special: '$100.00',
};

export const WithSpecialSlot = (args, { argTypes }) => ({
  components: { RaPrice, RaBadge },
  props: Object.keys(argTypes),
  template: `
  <RaPrice
    :regular="regular"
    :special="special">
    <template #special="{props}">
      <RaBadge variant="warning">{{special}}</RaBadge>
    </template>  
  </RaPrice>`,
});
WithSpecialSlot.args = {
  ...UseSpecial.args,
};

export const WithOldSlot = (args, { argTypes }) => ({
  components: { RaPrice, RaBadge },
  props: Object.keys(argTypes),
  template: `
  <RaPrice
    :regular="regular"
    :special="special">
    <template #old="{props}">
      <RaBadge variant="warning">{{regular}}</RaBadge>
    </template>
  </RaPrice>`,
});
WithOldSlot.args = {
  ...WithSpecialSlot.args,
};

export const WithRegularSlot = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { RaPrice, RaBadge },
  template: `
  <RaPrice
    :regular="regular"
    :special="special">
    <template #regular="{props}">
      <RaBadge>{{regular}}</RaBadge>
    </template>
  </RaPrice>`,
});
WithRegularSlot.args = {
  ...Common.args,
};
