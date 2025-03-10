import { RaAddToCart } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/AddToCart',
  component: RaAddToCart,
  decorators: [
    () => ({ template: '<div style="max-width: 25rem"><story /></div>' }),
  ],
  argTypes: {
    disabled: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
      defaultValue: false,
    },
    qty: {
      control: 'number',
      defaultValue: 1,
      table: {
        category: 'Props',
      },
    },
    click: { action: 'Added to cart clicked', table: { category: 'Events' } },
    input: { action: 'Quantity changed', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaAddToCart },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  data() {
    return {
      quantity: this.qty,
    };
  },
  template: `
    <RaAddToCart
      v-model="quantity"
      v-bind="$props"
      v-on="actions"
    />
  `,
});

export const Common = Template.bind({});
Common.args = {
  qtyVisible: true,
};

export const Disabled = Template.bind({});
Disabled.args = { ...Common.args, disabled: true };

export const WithAddToCartSlot = (args, { argTypes }) => ({
  components: { RaAddToCart },
  ...Template(args, { argTypes }),
  template: `
  <RaAddToCart 
    :disabled="disabled"
    :qty="qty"
    v-bind="$props"
    v-on="actions"
  >
    <template #input="{qty}">
      <select v-model="qty">
        <option value="1">1</option>
        <option value="5">5</option>
        <option value="25">25</option>
      </select>
    </template>
  </RaAddToCart>`,
});
WithAddToCartSlot.args = {
  ...Common.args,
  qty: 5,
};
