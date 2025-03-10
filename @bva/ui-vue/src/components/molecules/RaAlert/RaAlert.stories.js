import { RaAlert } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Alert',
  component: RaAlert,
  argTypes: {
    message: {
      control: 'text',
      table: {
        category: 'Props',
      },
      defaultValue: '',
    },
    variant: {
      control: {
        type: 'select',
        options: ['', 'secondary', 'info', 'success', 'warning', 'danger'],
      },
      table: {
        category: 'Props',
      },
      defaultValue: 'secondary',
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaAlert },
  props: Object.keys(argTypes),
  template: `<RaAlert :message="message" :variant="variant" />`,
});

export const Default = Template.bind({});
Default.args = {
  message: 'Low in stock',
};

export const Secondary = Template.bind({});
Secondary.args = {
  ...Default.args,
  variant: 'secondary',
};
export const Info = Template.bind({});
Info.args = {
  ...Default.args,
  variant: 'info',
};

export const Success = Template.bind({});
Success.args = {
  ...Default.args,
  variant: 'success',
};

export const Warning = Template.bind({});
Warning.args = {
  ...Default.args,
  variant: 'warning',
};

export const Danger = Template.bind({});
Danger.args = {
  ...Default.args,
  variant: 'danger',
};

export const WithMessageSlot = (args, { argTypes }) => ({
  components: { RaAlert },
  props: Object.keys(argTypes),
  template: `
  <RaAlert
    :message="message"
    :variant="variant">
    <template #message="{message}">
      CUSTOM MESSAGE
    </template>  
  </RaAlert>`,
});

export const WithIconSlot = (args, { argTypes }) => ({
  components: { RaAlert },
  props: Object.keys(argTypes),
  template: `
  <RaAlert
    :message="message"
    :variant="variant">
    <template #icon="{icon}">
      ❤️
    </template>  
  </RaAlert>`,
});

WithIconSlot.args = { ...Default.args };
