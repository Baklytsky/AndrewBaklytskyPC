import { RaIconTile, RaIcon } from '@bva/ui-vue';
import * as CommonArgsTypes from '@bva/ui-shared/storybook/argTypes/common';

export default {
  title: 'Components/Molecules/CMS/IconTile',
  component: RaIconTile,
  decorators: [
    () => ({ template: '<div class="max-width--tiny"><story /></div>' }),
  ],
  argTypes: {
    ...CommonArgsTypes,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaIconTile },
  props: Object.keys(argTypes),
  template: `
      <RaIconTile
        v-bind="$props"
      />
    `,
});

export const Common = Template.bind({});
Common.args = {
  title: 'This is a title',
  description: "I'm not thinking about anything when I'm climbing.",
  imageSrc: 'assets/storybook/RaGallery/productA.png',
  imageAlt: 'A content tile image',
  linkList: [
    {
      label: 'Default',
      title: 'Click Me',
      'aria-label': 'Click Me, navigate out',
      link: '#',
      asText: true,
    },
  ],
};

export const UseMediaSlot = (args, { argTypes }) => ({
  components: { RaIconTile, RaIcon },
  props: Object.keys(argTypes),
  template: `
      <RaIconTile
        v-bind="$props"
      >
        <template #media>
          <RaIcon
            :icon="'home'"
            :size="'3.5rem'"
          />
        </template>
      </RaIconTile>
    `,
});
UseMediaSlot.args = {
  ...Common.args,
};
