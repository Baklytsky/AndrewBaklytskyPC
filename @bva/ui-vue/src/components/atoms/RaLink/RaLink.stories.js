import { RaLink, RaIcon } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Link',
  component: RaLink,
  argTypes: {
    link: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    raw: {
      control: 'boolean',
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
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaLink },
  props: Object.keys(argTypes),
  template: `
  <RaLink
    v-bind="$props"
  >
    Check this out!
  </RaLink>
`,
});

export const Common = Template.bind({});
Common.args = {
  link: '#',
};

export const WithDefaultSlot = (args, { argTypes }) => ({
  components: { RaLink, RaIcon },
  props: Object.keys(argTypes),
  template: `
  <RaLink
    v-bind="$props"
    class="ra-link--flex ra-link--icon-right"
  >
    <template>
      <span>{{ text }}</span>
      <RaIcon :icon="icon" />
    </template>
  </RaLink>`,
});

WithDefaultSlot.args = {
  icon: 'chevron_right',
  text: 'Default Slot',
  link: '#',
};
