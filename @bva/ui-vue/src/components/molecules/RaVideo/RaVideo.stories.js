import RaVideo from './RaVideo.vue';

export default {
  title: 'Components/Molecules/Video',
  component: RaVideo,
  argTypes: {
    src: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    loop: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    autoplay: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    muted: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    playButtonShowOnHover: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    playButtonPosition: {
      control: {
        type: 'select',
        options: [
          'top-left',
          'top-right',
          'middle-left',
          'middle-center',
          'middle-right',
          'bottom-left',
          'bottom-right',
        ],
      },
      table: {
        category: 'Props',
      },
    },
    playButtonSize: {
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg'],
      },
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
  components: { RaVideo },
  props: Object.keys(argTypes),
  template: `
    <RaVideo
      v-bind="$props"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
};
