import RaSplitButton from './RaSplitButton.vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';

export default {
  title: 'Components/Atoms/SplitButton',
  component: RaSplitButton,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: [''].concat(UIColorNames),
      },
      table: {
        category: 'Props',
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['', 'xs', 'sm', 'lg'],
      },
      table: {
        category: 'Props',
      },
    },
    content: {
      control: 'text',
      table: {
        category: 'Slots',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSplitButton },
  props: Object.keys(argTypes),
  template: `
    <RaSplitButton
      v-bind="$props"
    >
      {{ content }}
    </RaSplitButton>`,
});

export const Common = Template.bind({});
Common.args = {
  content: 'Split Button',
};
