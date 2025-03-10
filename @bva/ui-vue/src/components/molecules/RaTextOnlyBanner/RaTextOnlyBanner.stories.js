import RaTextOnlyBanner from './RaTextOnlyBanner.vue';
import * as CommonTextArgTypes from '@bva/ui-shared/storybook/argTypes/common-text';
import * as CommonLinksArgTypes from '@bva/ui-shared/storybook/argTypes/common-links';
import * as CommonLayoutArgTypes from '@bva/ui-shared/storybook/argTypes/common-layout';
import * as CommonStylesArgTypes from '@bva/ui-shared/storybook/argTypes/common-styles';
import * as ContainerArgsTypes from '@bva/ui-shared/storybook/argTypes/container-layout';

export default {
  title: 'Components/Molecules/CMS/TextOnlyBanner',
  component: RaTextOnlyBanner,
  argTypes: {
    ...CommonTextArgTypes,
    ...CommonLinksArgTypes,
    ...CommonLayoutArgTypes,
    ...CommonStylesArgTypes,
    ...ContainerArgsTypes,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaTextOnlyBanner },
  props: Object.keys(argTypes),
  template: `
    <RaTextOnlyBanner
      v-bind="$props"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  subtitle: 'LOREM IPSUM DOLOR SIT AMET',
  // title: "This is a title",
  // titleLevel: 1,
  // titleAs: 2,
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi imperdiet porttitor mauris sit amet interdum. Donec pellentesque ligula odio.',
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
