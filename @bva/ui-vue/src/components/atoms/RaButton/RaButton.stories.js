import { RaButton, RaIcon } from '@bva/ui-vue';
import { UIColorNames, iconsNames } from '@bva/ui-shared/tokens';

export default {
  title: 'Components/Atoms/Button',
  component: RaButton,
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: {
        type: 'select',
        options: ['', 'ghost'].concat(UIColorNames),
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
    disabled: {
      control: 'boolean',
      defaultValue: false,
      table: {
        category: 'Props',
      },
    },
    link: {
      control: 'text',
      defaultValue: '',
      table: {
        category: 'Props',
      },
    },
    asText: {
      control: 'boolean',
      defaultValue: false,
      table: {
        category: 'Props',
      },
    },
    icon: {
      control: {
        type: 'select',
        options: [''].concat(iconsNames),
      },
      table: {
        category: 'Props',
      },
    },
    iconPosition: {
      control: {
        type: 'select',
        options: ['', 'leading', 'trailing'],
      },
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaButton },
  props: Object.keys(argTypes),
  template: `
  <RaButton
    v-bind="$props">
      {{label}}
  </RaButton>`,
});

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  label: 'Shop Now',
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...Primary.args,
  variant: 'secondary',
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  ...Primary.args,
  variant: 'tertiary',
};

export const Ghost = Template.bind({});
Ghost.args = {
  ...Primary.args,
  variant: 'ghost',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  ...Primary.args,
};

export const Loading = Template.bind({});
Loading.args = {
  ...Primary.args,
  loading: true,
};

export const AsText = Template.bind({});
AsText.args = {
  ...Primary.args,
  asText: true,
  link: '#',
};

export const WithDefaultSlot = (args, { argTypes }) => ({
  components: { RaButton, RaIcon },
  props: Object.keys(argTypes),
  template: `
  <RaButton
    :iconPosition="iconPosition">
    <template>
      <RaIcon :icon="icon" />
      <span>{{ label }}</span>
    </template>
  </RaButton>`,
});

WithDefaultSlot.args = {
  icon: 'error',
  label: 'Default Slot',
  iconPosition: 'left',
};
