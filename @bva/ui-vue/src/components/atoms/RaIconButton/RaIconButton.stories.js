import { RaIconButton } from '@bva/ui-vue';
import { UIColorNames, iconsNames } from '@bva/ui-shared/tokens';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/IconButton',
  component: RaIconButton,
  argTypes: {
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
        options: ['', 'xs', 'sm', 'md', 'lg', 'xl'],
      },
      table: {
        category: 'Props',
      },
    },
    shape: {
      control: {
        type: 'select',
        options: ['rounded', 'square'],
      },
      table: {
        category: 'Props',
      },
    },
    icon: {
      control: {
        type: 'select',
        options: iconsNames,
      },
      table: {
        category: 'Props',
      },
      description: 'Icon to use',
    },
    iconSize: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    iconColor: {
      control: 'color',
      table: {
        category: 'Props',
      },
    },
    hasBadge: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    badgeSize: {
      control: {
        type: 'select',
        options: ['', 'xs', 'sm', 'md', 'lg'],
      },
      table: {
        category: 'Props',
      },
    },
    badgeVariant: {
      control: {
        type: 'select',
        options: [''].concat(UIColorNames),
      },
      table: {
        category: 'Props',
      },
    },
    badgeLabel: {
      control: 'text',
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
    click: {
      action: 'Interactive icon clicked',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaIconButton },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaIconButton
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Primary = Template.bind({});
Primary.args = {
  icon: 'home',
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

export const Warning = Template.bind({});
Warning.args = {
  ...Primary.args,
  variant: 'warning',
};

export const Danger = Template.bind({});
Danger.args = {
  ...Primary.args,
  variant: 'danger',
};

export const Success = Template.bind({});
Success.args = {
  ...Primary.args,
  variant: 'success',
};

export const Ghost = Template.bind({});
Ghost.args = {
  ...Primary.args,
  variant: 'ghost',
};

export const AsSquare = Template.bind({});
AsSquare.args = {
  ...Primary.args,
  shape: 'square',
};

export const Small = Template.bind({});
Small.args = {
  ...Primary.args,
  size: 'sm',
};

export const Large = Template.bind({});
Large.args = {
  ...Primary.args,
  size: 'lg',
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Primary.args,
  disabled: true,
};

export const WithDefaultSlot = (args, { argTypes }) => ({
  components: { RaIconButton },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaIconButton
    v-bind="$props"
    v-on="actions"
  >
    <span>
      Home
    </span>
  </RaIconButton>`,
});

WithDefaultSlot.args = {
  ...Primary.args,
  iconSize: '20px',
};
