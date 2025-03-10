import { RaProductTile } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/ProductTile',
  component: RaProductTile,
  decorators: [
    () => ({
      template: '<div style="max-width: 22.875rem"><story/></div>',
    }),
  ],
  argTypes: {
    'click:add-to-cart': {
      action: 'Add-to-cart clicked',
      table: { category: 'Events' },
    },
    'click:wishlist': {
      action: 'Wishlist clicked',
      table: { category: 'Events' },
    },
    'click:product': {
      action: 'Card clicked',
      table: { category: 'Events' },
    },
    'click:swatch': {
      action: 'Swatch clicked',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaProductTile },
  props: getProps(argTypes),
  methods: {
    handleSelectOption(selectedOption) {
      this.options.forEach((option) => (option.selected = false));
      this.selectedOptions = selectedOption.value;
    },
  },
  data() {
    return {
      selectedOptions: this.selected,
    };
  },
  watch: {
    selected(newValue) {
      this.selectedOptions = newValue;
    },
  },
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaProductTile
    v-bind="$props"
    v-on="actions"
    :pickerProps="{
      options,
      selected: selectedOptions,
    }"
    :pickerEvents="{
      'select:option': handleSelectOption,
    }"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  image: '/assets/storybook/Home/productB.jpg',
  title: 'Cotton Sweater',
  price: '$3.99',
  addToCartButton: true,
  options: [],
};

export const WithRating = Template.bind({});
WithRating.args = {
  ...Common.args,
  ratingScore: 4.5,
};

export const WithAttribute = Template.bind({});
WithAttribute.args = {
  ...Common.args,
  attribute: 'Some attribute',
};

export const WithSwatches = Template.bind({});
WithSwatches.args = {
  ...Common.args,
  options: [
    { label: 'Sand', value: 'sand', color: '#EDCBB9', selected: false },
    { label: 'Mint', value: 'mint', color: '#ABD9D8', selected: true },
    {
      label: 'Vivid rose',
      value: 'vivid rose',
      color: '#DB5593',
      selected: false,
      disabled: true,
    },
    { label: 'Peach', value: 'peach', color: '#F59F93', selected: false },
    { label: 'Mustard', value: 'peach-2', color: '#c59333', selected: false },
    { label: 'Sage', value: 'peach-3', color: '#c0c6b0', selected: false },
    { label: 'Asphalt', value: 'peach-4', color: '#c7c0b4', selected: false },
    { label: 'Forest', value: 'peach-5', color: '#537758', selected: false },
    { label: 'Stone', value: 'peach-6', color: '#86847d', selected: false },
    { label: 'Dark', value: 'peach-7', color: '#000000', selected: false },
    {
      label: 'Citrus',
      value: 'citrus',
      color: '#FFEE97',
      selected: false,
    },
  ],
};

export const WithBadge = Template.bind({});
WithBadge.args = {
  ...Common.args,
  badgeVariant: 'danger',
  badgeLabel: '-50%',
};

export const WithWishlist = Template.bind({});
WithWishlist.args = {
  ...Common.args,
  wishlist: true,
};

export const AddedToWishlist = Template.bind({});
AddedToWishlist.args = {
  ...WithWishlist.args,
  isInWishlist: true,
};

export const WithMultipleImages = Template.bind({
  argTypes: {
    image: {
      control: 'object',
    },
  },
});
WithMultipleImages.args = {
  ...Common.args,
  image: [
    '/assets/storybook/Home/productB.jpg',
    '/assets/storybook/Home/productA.jpg',
  ],
};

export const WithAllFeatures = Template.bind({});
WithAllFeatures.args = {
  ...WithBadge.args,
  ...WithWishlist.args,
  ...WithAttribute.args,
  ...WithRating.args,
  ...WithMultipleImages.args,
  ...WithSwatches.args,
};

export const Card = Template.bind({});
Card.args = {
  ...WithAllFeatures.args,
  wishlist: false,
  variant: 'card',
};

export const CardNoSwatches = Template.bind({});
CardNoSwatches.args = {
  ...Card.args,
  options: [],
};

export const CardNoImage = Template.bind({});
CardNoImage.args = {
  ...Card.args,
  image: '',
};

export const CardNoImageNoSwatches = Template.bind({});
CardNoImageNoSwatches.args = {
  ...CardNoSwatches.args,
  image: '',
};
