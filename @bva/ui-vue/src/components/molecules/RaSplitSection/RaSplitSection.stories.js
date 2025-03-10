import RaSplitSection from './RaSplitSection.vue';
import * as CommonArgTypes from '@bva/ui-shared/storybook/argTypes/common';
import * as WidthArgTypes from '@bva/ui-shared/storybook/argTypes/dimension-width';

export default {
  title: 'Components/Molecules/CMS/SplitSection',
  component: RaSplitSection,
  argTypes: {
    ...CommonArgTypes,
    ...WidthArgTypes,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSplitSection },
  props: Object.keys(argTypes),
  template: `
    <div class="max-width--large">
      <RaSplitSection v-bind="$props" />
    </div>`,
});

export const Common = Template.bind({});
Common.args = {
  title: 'Well hello there',
  titleLevel: 1,
  titleAs: 4,
  description:
    'I don’t want to fall off and die either, but there’s a satisfaction to challenging yourself and doing something well. That feeling is heightened when you’re for sure facing death. If you’re seeking perfection, free-soloing is as close as you can get.',
  imageSrc: 'assets/storybook/RaContentTile/Banner2.jpg',
  imageAlt: 'A split section image',
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
      variant: 'secondary',
    },
  ],
};

export const DetailsBefore = Template.bind({});
DetailsBefore.args = {
  ...Common.args,
  detailsLocation: 'before',
};

export const WithVideo = Template.bind({});
WithVideo.args = {
  ...Common.args,
  imageSrc: null,
  videoSrc:
    'https://videos.ctfassets.net/vrtxntfdif7n/5nWuB5A6fw3pHB8m8R9rgd/2952fa3b3bd7858fb137691732372981/cnv-1.mp4',
};
