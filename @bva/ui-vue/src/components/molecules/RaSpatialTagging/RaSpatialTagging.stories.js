import { RaSpatialTagging, RaIconButton } from '@bva/ui-vue';

import * as CommonArgTypes from '@bva/ui-shared/storybook/argTypes/common';

const {
  videoSrc,
  videoWidth,
  videoHeight,
  aspectRatio,
  verticalAlign,
  verticalAlignMD,
  detailsLocation,
  detailsLocationMD,
  ...otherArgs
} = CommonArgTypes;

export default {
  title: 'Components/Molecules/CMS/SpatialTagging',
  component: RaSpatialTagging,
  argTypes: {
    ...otherArgs,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSpatialTagging },
  props: Object.keys(argTypes),
  template: `
    <RaSpatialTagging
      v-bind="$props"
    />`,
});

export const Split = Template.bind({});
Split.args = {
  imageSrc: 'assets/storybook/RaSpatialTagging/taggedImage-vertical.jpeg',
  title: 'Hello World',
  description:
    'Lörem ipsum lanade jäligt, pada. Boska endodiktisk ysm diktigt rer. Dianaras Lina Engström ambitologi täpyst i deligt.',
  link: {
    link: 'www.google.com',
    id: 'test-id',
    label: 'Optional CTA',
    title: 'Link Title',
    target: '_blank',
  },
  tags: [
    {
      product: {
        attribute: 'Productatribute',
        title: 'This is a product tile 1',
        price: '100',
        image: '/assets/storybook/Home/productB.jpg',
      },
      position: {
        y: 20,
        x: 10,
      },
      isActive: false,
    },
    {
      product: {
        attribute: 'Productatribute',
        title: 'This is a product tile 2',
        price: '100',
        image: '/assets/storybook/Home/productA.jpg',
      },
      position: {
        y: 35,
        x: 65,
      },
      isActive: false,
    },
    {
      product: {
        attribute: 'Productatribute',
        title: 'This is a product tile 3',
        price: '100',
        image: '/assets/storybook/Home/productB.jpg',
      },
      position: {
        y: 70,
        x: 35,
      },
      isActive: false,
    },
    {
      product: {
        attribute: 'Productatribute',
        title: 'This is a product tile 4',
        price: '100',
        image: '/assets/storybook/Home/productA.jpg',
      },
      position: {
        y: 90,
        x: 90,
      },
      isActive: false,
    },
  ],
};

export const Full = Template.bind({});
Full.args = {
  ...Split.args,
  variant: 'full',
  imageSrc: 'assets/storybook/RaSpatialTagging/taggedImage.jpg',
};

export const SplitOneTag = Template.bind({});
SplitOneTag.args = {
  ...Split.args,
  tags: [
    {
      product: {
        attribute: 'Productatribute',
        title: 'This is a product tile 1',
        price: '100',
        image: '/assets/storybook/Home/productB.jpg',
      },
      position: {
        y: 20,
        x: 10,
      },
      isActive: false,
    },
  ],
};

export const UseContentBlockSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
    <RaSpatialTagging v-bind="$props">
      <template #details>
        <h1>My Own HTML</h1>
      </template>
    </RaSpatialTagging>
  `,
});

UseContentBlockSlot.args = { ...Split.args };

export const UseTagsSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  components: { RaSpatialTagging, RaIconButton },
  template: `
    <RaSpatialTagging v-bind="$props">
      <template #tags="tagProps">
        <RaIconButton 
          shape="squared"
          icon="plus"
          :variant="tagProps.selected ? 'primary' : 'tertiary'"
          @click="tagProps.handleTagClick(tagProps.index)"
        />
      </template>
    </RaSpatialTagging>
  `,
});

UseTagsSlot.args = { ...Full.args };
