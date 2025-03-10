import {
  RaGallery,
  RaGalleryGrid,
  RaGalleryCarousel,
  RaVideo,
} from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Gallery',
  component: RaGallery,
  subcomponents: { RaGalleryGrid, RaGalleryCarousel },
  decorators: [
    () => ({
      template:
        '<div style="max-width: 46.25rem; padding-top: 2rem;"><story /></div>',
    }),
  ],
  argTypes: {
    media: {
      control: 'object',
      table: {
        category: 'Props',
      },
    },
    imageWidth: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    imageHeight: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    zoom: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaGallery },
  props: Object.keys(argTypes),
  template: `
    <RaGallery
      v-bind="$props"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  media: [
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
  ],
};

export const UseZoom = Template.bind({});
UseZoom.args = {
  ...Common.args,
  zoom: true,
};

export const UseCarousel = Template.bind({});
UseCarousel.args = {
  ...Common.args,
  isGrid: false,
};

export const UseCarouselWithThumbs = Template.bind({});
UseCarouselWithThumbs.args = {
  ...UseCarousel.args,
  thumbnails: true,
};

export const WithVideo = (args, { argTypes }) => ({
  components: { RaGallery, RaVideo },
  props: Object.keys(argTypes),
  template: `
    <RaGallery
      v-bind="$props"
    >
      <template #media-2="{isGallery, index, image, handleClick, handleLoad}">
        <RaVideo
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm"
          useAspectRatio
          :width="1"
          :height="1"
          :pauseOnClick="!isGallery"
          @load:video="handleLoad({disableFullScreen: true})"
          @click="isGallery ? handleClick(index, image) : () => {}"
        />
      </template>
    </RaGallery>`,
});
WithVideo.args = {
  ...Common.args,
  zoom: true,
  zoomFullScreen: true,
};
