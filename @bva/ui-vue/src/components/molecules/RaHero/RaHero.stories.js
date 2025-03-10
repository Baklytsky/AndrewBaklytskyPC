import RaHero from './RaHero.vue';
import * as CommonArgTypes from '@bva/ui-shared/storybook/argTypes/common';

export default {
  title: 'Components/Molecules/CMS/Hero',
  component: RaHero,
  argTypes: {
    ...CommonArgTypes,
    aspectRatio: {
      control: {
        type: 'select',
      },
      options: ['short', 'main', 'tall', 'respect-media'],
      table: {
        category: 'Media',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaHero },
  props: Object.keys(argTypes),
  template: `
    <div class="max-width--large">
      <RaHero
        v-bind="$props"
      />
    </div>`,
});

export const Common = Template.bind({});
Common.args = {
  subtitle: 'A SUBHEADING',
  title: 'THIS IS A TITLE',
  titleLevel: 1,
  titleAs: 2,
  description:
    "I'm not thinking about anything when I'm climbing, which is part of the appeal. I'm focused on executing what's in front of me.",
  imageSrc: '/assets/storybook/banners/eternal.jpg',
  imageAlt: 'A hero image',
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
  backgroundColor: 'rgba(255,255,255,.25)',
};

export const WithSeveralCTAs = Template.bind({});
WithSeveralCTAs.args = {
  ...Common.args,
  foregroundColor: '#FFF',
  backgroundColor: 'rgba(0,0,0,.5)',
  verticalAlign: 'bottom',
  horizontalAlign: 'left',
  linkList: [
    {
      label: 'One',
      title: 'One',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      variant: 'tertiary',
      style: {
        '--button-border-radius': '.5rem 0 0 .5rem',
      },
    },
    {
      label: 'Two',
      title: 'Two',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      variant: 'secondary',
    },
    {
      label: 'Three',
      title: 'Three!',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      variant: 'tertiary',
      style: {
        '--button-border-radius': '0 .5rem .5rem 0',
      },
    },
  ],
};

export const WithCustomFont = Template.bind({});
WithCustomFont.args = {
  ...WithSeveralCTAs.args,
  imageSrc: '/assets/storybook/banners/runway.jpg',
  description: 'Hello, this is a description.',
  titleAs: 1,
  linkList: [
    {
      label: 'A larger button',
      title: 'One',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      size: 'lg',
      icon: 'arrow_right',
      iconPosition: 'trailing',
      iconSize: 'var(--font-size-md20-to-lg)',
    },
  ],
  verticalAlign: 'middle',
  horizontalAlign: 'center',
  backgroundColor: null,
  foregroundColor: '#000',
  style: {
    '--button-border-radius': '40px',
    '--button-height': '4rem',
    '--button-background': '#000',
    '--button-font-size': 'var(--font-size-md-to-md20)',
    '--component-title-font-family': 'Times',
    '--component-description-font-family': 'Cursive',
    '--media-focus-y': '10%',
  },
};

export const WithCopyBackground = Template.bind({});
WithCopyBackground.args = {
  ...Common.args,
  verticalAlign: 'bottom',
  horizontalAlign: 'center',
  horizontalAlignMD: 'right',
  backgroundColor: 'rgba(0,0,0,.25)',
  linkList: [
    {
      label: 'Default',
      title: 'Click Me',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      variant: 'warning',
      size: 'sm',
    },
    {
      label: 'Secondary',
      title: 'Click Me',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      variant: 'danger',
      size: 'sm',
    },
  ],
  style: {
    '--component-copy-max-width': '36rem',
    '--component-media-border-radius': '.5rem',
    '--component-copy-background': '#FFF',
    '--component-copy-padding': '2rem',
    '--component-copy-border-radius': '.25rem',
  },
};

export const WithVideo = Template.bind({});
WithVideo.args = {
  ...Common.args,
  imageSrc: null,
  videoSrc:
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
  foregroundColor: '#FFF',
  backgroundColor: 'rgba(0,0,0,0.25)',
};
