import { RaChevron } from '@bva/ui-vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';

export default {
  title: 'Components/Atoms/Chevron',
  component: RaChevron,
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
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaChevron },
  props: Object.keys(argTypes),
  template: `<RaChevron v-bind="$props" />`,
});

export const Common = Template.bind({});

export const Interactive = Template.bind({});
Interactive.args = {
  interact: true,
};

export const WithDefaultSlot = (args, { argTypes }) => ({
  components: { RaChevron },
  props: Object.keys(argTypes),
  template: `
  <RaChevron v-bind="$props">
    <span class="ra-chevron__icon">
      Hi!
    </span>
  </RaChevron>`,
});
