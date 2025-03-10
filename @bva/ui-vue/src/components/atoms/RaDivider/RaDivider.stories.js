import { RaDivider } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Divider',
  component: RaDivider,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['', 'dark', 'light', 'dark-50', 'light-50'],
      },
      table: {
        category: 'HTML Attributes',
      },
    },
    textPosition: {
      control: {
        type: 'select',
        options: ['center', 'left', 'right'],
      },
      table: {
        category: 'Props',
      },
    },
    text: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    bgClass: {
      control: 'text',
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaDivider },
  props: Object.keys(argTypes),
  template: `
  <div :class="bgClass" style="padding: 2rem">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>

    <RaDivider :variant="variant" :text="text" />

    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
  </div>`,
});

export const Common = Template.bind({});
Common.args = {};

export const Dark = Template.bind({});
Dark.args = {
  variant: 'dark',
  bgClass: 'bg-highlight text-contrast',
};

export const Light = Template.bind({});
Light.args = {
  variant: 'light',
  bgClass: 'bg-contrast text-highlight',
};

export const WithText = Template.bind({});
WithText.args = {
  text: 'Divider Text',
};
