import { RaImage, RaEditorial } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Image',
  component: RaImage,
  argTypes: {
    srcset: {
      control: 'object',
      table: {
        category: 'Props',
      },
    },
    src: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    width: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    height: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    placeholder: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    alt: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    loading: {
      control: {
        type: 'select',
        options: ['', 'lazy', 'eager'],
      },
      table: {
        category: 'Props',
      },
    },
    useAspectRatio: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    useAsBackground: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaImage },
  props: Object.keys(argTypes),
  template: `
      <RaImage
        v-bind="$props"
      />
  `,
});

export const Common = Template.bind({});
Common.args = {
  src: '/assets/storybook/RaImage/product-216x326.jpg',
  alt: 'Vila stripe maxi shirt dress',
  srcset: [
    {
      src: '/assets/storybook/RaImage/product-109x164.webp',
      width: 109,
      breakpoint: 480,
    },
    {
      src: '/assets/storybook/RaImage/product-216x326.jpg',
      width: 1200,
      breakpoint: 1200,
    },
    {
      src: '/assets/storybook/RaImage/product-109x164.webp',
      width: '400px',
      breakpoint: 768,
    },
  ],
  width: 216,
  height: 326,
};

export const WithSrcOnly = Template.bind({});
WithSrcOnly.args = {
  ...Common.args,
  width: '',
  height: '',
  srcset: [],
};
WithSrcOnly.decorators = [
  () => ({
    template: `
    <div class="row">
      <div class="col-12 col-md-6">
        <story />
      </div>
    </div>
  `,
  }),
];

export const WithPicture = Template.bind({});
WithPicture.args = {
  ...Common.args,
  srcset: [
    {
      src: '/assets/storybook/RaImage/product-216x326.jpg',
      breakpoint: 'small',
    },
    {
      src: '/assets/storybook/RaImage/product-109x164.webp',
    },
  ],
  height: '',
};
WithPicture.decorators = [
  () => ({
    template: `<div>
    <p>
      Different images are shown on a per breakpoint basis.
    </p>
    <p>This renders a picture tag for art direction purposes.</p>
    <story />
  </div>`,
  }),
];

export const WithResolutions = Template.bind({});
WithResolutions.args = {
  ...WithSrcOnly.args,
  width: 216,
  srcset: [
    {
      src: '/assets/storybook/RaImage/product-109x164.webp',
      resolution: 2,
    },
    {
      src: '/assets/storybook/RaImage/product-216x326.jpg',
      resolution: 1,
    },
  ],
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  ...WithSrcOnly.args,
  width: 216,
  placeholder:
    'https://res.cloudinary.com/mayashavin/image/upload/e_pixelate/v1607977495/StorefrontUI/product-216x326.jpg',
};

export const WithAccessibility = Template.bind({});
WithAccessibility.args = {
  ...WithSrcOnly.args,
  width: 216,
  alt: '',
};
WithAccessibility.decorators = [
  () => ({
    template: `<div>
    <p>
      <span style="color:#b40e01">Red</span> highlight when no Alt text found.
    </p>
    <story />
  </div>`,
  }),
];
