import { RaNotification, RaIcon } from '@bva/ui-vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/Notification',
  component: RaNotification,
  argTypes: {
    variant: {
      options: [''].concat(UIColorNames),
    },
    'click:action': { action: 'Action clicked', table: { category: 'Events' } },
    'click:close': {
      action: 'Close notification clicked',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaNotification },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaNotification
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  message: 'This is an information message',
  visible: true,
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...Common.args,
  variant: 'secondary',
};

export const Tertiary = Template.bind({});
Tertiary.args = {
  ...Common.args,
  variant: 'tertiary',
};

export const Success = Template.bind({});
Success.args = {
  ...Common.args,
  variant: 'success',
};

export const Warning = Template.bind({});
Warning.args = {
  ...Common.args,
  variant: 'warning',
};

export const Danger = Template.bind({});
Danger.args = {
  ...Common.args,
  variant: 'danger',
};

export const WithTitle = Template.bind({});
WithTitle.args = {
  ...Common.args,
  title: 'Added to Cart',
};

export const WithAction = Template.bind({});
WithAction.args = {
  ...Common.args,
  action: 'View cart',
};
