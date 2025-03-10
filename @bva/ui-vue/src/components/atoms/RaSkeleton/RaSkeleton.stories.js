import {
  RaSkeleton,
  RaBone,
  RaSkeletonProductTile,
  RaSkeletonProductDetails,
} from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Skeleton',
  component: RaSkeleton,
  subcomponents: {
    RaBone,
    RaSkeletonProductTile,
    RaSkeletonProductDetails,
  },
  decorators: [
    () => ({
      template: `<div style="max-width: 400px;"><story /></div>`,
    }),
  ],
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: [
          'paragraph',
          'image',
          'productTile',
          'productDetails',
          'productLineItem',
        ],
      },
      table: {
        category: 'Props',
      },
    },
    animation: {
      control: {
        type: 'select',
        options: ['linear', 'fade', 'pulsate', 'none'],
      },
      table: {
        category: 'Props',
      },
    },
    itemCount: {
      control: {
        type: 'number',
      },
      table: {
        category: 'Props',
      },
    },
    columns: {
      control: {
        type: 'number',
      },
      table: {
        category: 'Props',
      },
    },
    gap: {
      control: {
        type: 'text',
      },
      table: {
        category: 'Props',
      },
    },
    itemsWidth: {
      control: {
        type: 'array',
      },
      table: {
        category: 'Props',
      },
    },
    itemsHeight: {
      control: {
        type: 'array',
      },
      table: {
        category: 'Props',
      },
    },
    align: {
      control: {
        type: 'select',
        options: ['left', 'center', 'right'],
      },
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSkeleton, RaBone },
  props: Object.keys(argTypes),
  template: `<RaSkeleton v-bind="$props" />`,
});

export const Common = Template.bind({});

export const WithCustomWidth = Template.bind({});
WithCustomWidth.args = {
  itemCount: 8,
  itemsWidth: [0.5, 1, 0.75],
};

export const Image = Template.bind({});
Image.args = {
  variant: 'image',
  itemsHeight: '125%',
};

export const CustomParagrapAndInput = (args, { argTypes }) => ({
  components: { RaSkeleton, RaBone },
  props: Object.keys(argTypes),
  template: `
    <RaSkeleton v-bind="$props">
      <RaBone variant="paragraph" :animation="animation" />
      <RaBone variant="input" :animation="animation" />
      <RaBone variant="button" :animation="animation" />
    </RaSkeleton>
  `,
});
CustomParagrapAndInput.args = { ...Common.args };

export const CustomAvatarAndParagraphs = (args, { argTypes }) => ({
  components: { RaSkeleton, RaBone },
  props: Object.keys(argTypes),
  template: `
    <RaSkeleton v-bind="$props">
      <RaBone variant="avatar" :animation="animation" />
      <RaBone variant="paragraph" :animation="animation" width="50%" />
      <RaBone variant="paragraph" :animation="animation" />
      <RaBone variant="paragraph" :animation="animation" width="75%" />
    </RaSkeleton>
  `,
});
CustomAvatarAndParagraphs.args = {
  ...Common.args,
  align: 'center',
};
