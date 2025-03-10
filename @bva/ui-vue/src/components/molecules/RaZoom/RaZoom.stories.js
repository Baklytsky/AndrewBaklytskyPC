import { RaZoom, RaButton, RaImage } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Zoom',
  component: RaZoom,
  decorators: [
    () => ({ template: '<div style="max-width: 46.25rem"><story /></div>' }),
  ],
  argTypes: {
    media: {
      control: 'object',
      table: {
        category: 'Props',
      },
    },
  },
};

const media = [
  {
    src: 'assets/storybook/RaGallery/productA.png',
    zoom: 'assets/storybook/RaGallery/productA.png',
    alt: 'Product A',
  },
  {
    src: 'assets/storybook/RaGallery/productB.jpg',
    zoom: 'assets/storybook/RaGallery/productB.jpg',
    alt: 'Product B',
  },
  {
    src: 'assets/storybook/RaGallery/productA.png',
    zoom: 'assets/storybook/RaGallery/productA.png',
    alt: 'Product A',
  },
  {
    src: 'assets/storybook/RaGallery/productB.jpg',
    zoom: 'assets/storybook/RaGallery/productB.jpg',
    alt: 'Product B',
  },
];

const Template = (args, { argTypes }) => ({
  components: { RaZoom, RaButton, RaImage },
  props: Object.keys(argTypes),
  data() {
    return {
      show: false,
    };
  },
  template: `
    <div>
      <RaButton @click="() => show = !show" raw>
        <RaImage
          src="assets/storybook/RaGallery/productA.png"
        />
      </RaButton>

      <RaZoom
        v-bind="$props"
        :visible="show"
        @close:zoom="() => show = false"
      />
    </div>
  `,
});

export const Common = Template.bind({});
Common.args = {
  media: media[0],
};

export const FullScreen = Template.bind({});
FullScreen.args = {
  media: media[0],
  fullScreen: true,
};

export const MultipleImages = Template.bind({});
MultipleImages.args = {
  media: media,
};
