import RaContentTile from './RaContentTile.vue';
import * as CommonArgTypes from '@bva/ui-shared/storybook/argTypes/common';

export default {
  title: 'Components/Molecules/CMS/ContentTile',
  component: RaContentTile,
  decorators: [
    () => ({ template: '<div class="max-width--tiny"><story /></div>' }),
  ],
  argTypes: {
    ...CommonArgTypes,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaContentTile },
  props: Object.keys(argTypes),
  template: `
      <RaContentTile
        v-bind="$props"
      />
    `,
});

export const Common = Template.bind({});
Common.args = {
  title: 'This is a title',
  titleLevel: 3,
  description: "I'm not thinking about anything when I'm climbing.",
  imageSrc: 'assets/storybook/RaContentTile/Banner2.jpg',
  imageAlt: 'A content tile image',
  imageWidth: '400px',
  imageHeight: '480px',
  linkList: [
    {
      label: 'Default',
      title: 'Click Me',
      'aria-label': 'Click Me, navigate out',
      link: '#',
    },
    {
      label: 'Secondary',
      title: 'Click Me',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      variant: 'tertiary',
    },
  ],
};

export const WithVideo = Template.bind({});
WithVideo.args = {
  ...Common.args,
  imageSrc: null,
  videoSrc:
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
};
