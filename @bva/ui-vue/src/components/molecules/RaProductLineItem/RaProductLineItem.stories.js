import { RaProductLineItem, RaButton } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/ProductLineItem',
  component: RaProductLineItem,
  argTypes: {
    input: { action: 'Quantity changed', table: { category: 'Events' } },
    'click:remove': {
      action: 'Remove product clicked',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaProductLineItem },
  props: getProps(argTypes),
  data() {
    return {
      qty: 1,
    };
  },
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
    <RaProductLineItem
      v-bind="$props"
      v-on="actions"
      v-model="qty"
    >
      <slot />
    </RaProductLineItem>
  `,
});

export const Common = Template.bind({});
Common.args = {
  image: '/assets/storybook/Home/productB.jpg',
  title: 'Cotton Sweater Modern Style',
  priceRegular: '$10.99',
  attributes: [
    {
      name: 'Size',
      value: 'XS',
    },
    {
      name: 'Color',
      value: 'Beige',
    },
  ],
};

export const WithSpecialPrice = Template.bind({});
WithSpecialPrice.args = {
  ...Common.args,
  priceSpecial: '$6.99',
};

export const WithLink = Template.bind({});
WithLink.args = {
  ...Common.args,
  link: '#',
};

export const WithHiddenActions = Template.bind({});
WithHiddenActions.args = {
  ...Common.args,
  hideActions: true,
};

export const UseActionsSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaProductLineItem
    v-bind="$props"
    v-model="qty"
  >
    <template #actions>
      CUSTOM ACTIONS
    </template>
  </RaProductLineItem>`,
});
UseActionsSlot.args = { ...Common.args };

export const UseAttributesSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaProductLineItem
    v-bind="$props"
    v-model="qty"
  >
    <template #attributes>
      CUSTOM ATTRIBUTES
    </template>
  </RaProductLineItem>`,
});
UseAttributesSlot.args = { ...Common.args };

export const UseImageSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaProductLineItem
    v-bind="$props"
    v-model="qty"
  >
    <template #image>
      CUSTOM IMAGE
    </template>
  </RaProductLineItem>`,
});
UseImageSlot.args = { ...Common.args };

export const UseInputSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaProductLineItem
    v-bind="$props"
    v-model="qty"
  >
    <template #qty-selector>
      CUSTOM INPUT
    </template>
  </RaProductLineItem>`,
});
UseInputSlot.args = { ...Common.args };

export const UseTitleSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaProductLineItem
    v-bind="$props"
    v-model="qty"
  >
    <template #title>
      CUSTOM TITLE
    </template>
  </RaProductLineItem>`,
});
UseTitleSlot.args = { ...Common.args };

export const UsePriceSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaProductLineItem
    v-bind="$props"
    v-model="qty"
  >
    <template #price>
      CUSTOM PRICE
    </template>
  </RaProductLineItem>`,
});
UsePriceSlot.args = { ...Common.args };
