import { RaBadge, RaIcon } from '@bva/ui-vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';

export default {
  title: 'Components/Atoms/Badge',
  component: RaBadge,
  argTypes: {
    label: {
      control: 'text',
    },
    variant: {
      control: {
        type: 'select',
        options: [].concat(UIColorNames),
      },
      table: {
        category: 'Props',
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['', 'xs', 'sm', 'md', 'lg'],
      },
      table: {
        category: 'Props',
      },
    },
    notification: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaBadge },
  props: Object.keys(argTypes),
  template: `<RaBadge v-bind="$props">{{label}}</RaBadge>`,
});

export const Primary = Template.bind({});
Primary.args = {
  label: 'Limited',
  variant: 'primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'One Time',
  variant: 'secondary',
};

export const Warning = Template.bind({});
Warning.args = {
  label: 'Warning',
  variant: 'warning',
};

export const Danger = Template.bind({});
Danger.args = {
  label: 'Danger',
  variant: 'danger',
};

export const Info = Template.bind({});
Info.args = {
  label: 'Info',
  variant: 'info',
};

export const Success = Template.bind({});
Success.args = {
  label: 'Success',
  variant: 'success',
};

export const AsNotification = Template.bind({});
AsNotification.args = {
  label: '999',
  notification: true,
};

export const WithDefaultSlot = (args, { argTypes }) => ({
  components: { RaBadge, RaIcon },
  props: Object.keys(argTypes),
  template: `<RaBadge v-bind="$props" class="inline-flex items-center">
    <RaIcon icon="home" class="ra-arrow__icon" size="16px" />
    <span>Hello</span>
  </RaBadge>`,
});
