import { RaTooltip, RaButton } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Tooltip',
  component: RaTooltip,
  argTypes: {
    vPos: {
      control: {
        type: 'select',
        options: ['top', 'middle', 'bottom'],
      },
      table: {
        category: 'Props',
      },
    },
    hPos: {
      control: {
        type: 'select',
        options: ['left', 'center', 'right'],
      },
      table: {
        category: 'Props',
      },
    },
    content: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
  },
  decorators: [
    () => ({
      template:
        '<div class="flex items-center justify-center" style="min-height: 15rem; position: relative;"><story /></div>',
    }),
  ],
};

const Template = (args, { argTypes }) => ({
  components: { RaTooltip, RaButton },
  props: Object.keys(argTypes),
  data() {
    return {
      tooltipShown: this.visible,
    };
  },
  watch: {
    visible(newValue) {
      this.tooltipShown = newValue;
    },
  },
  template: `
    <RaTooltip
      v-model="tooltipShown"
      v-bind="$props"
    >
      <RaButton @click="tooltipShown = !tooltipShown">{{ ctaLabel }}</RaButton>
    </RaTooltip>`,
});

export const Common = Template.bind({});
Common.args = {
  description: "Hello, I'm a tooltip!",
  visible: true,
  ctaLabel: 'Click Me!',
};

export const WithBottomPosition = Template.bind({});
WithBottomPosition.args = {
  ...Common.args,
  vPos: 'bottom',
};

export const WithMiddleLeftPosition = Template.bind({});
WithMiddleLeftPosition.args = {
  ...Common.args,
  vPos: 'middle',
  hPos: 'left',
};

export const WithMiddleRightPosition = Template.bind({});
WithMiddleRightPosition.args = {
  ...Common.args,
  vPos: 'middle',
  hPos: 'right',
};

export const WithPersistence = Template.bind({});
WithPersistence.args = {
  ...Common.args,
  persistent: true,
  description: 'Click CTA again to dismiss',
};

export const WithTimeout = Template.bind({});
WithTimeout.args = {
  ...Common.args,
  visible: false,
  timeout: 2000,
  description: 'Will dismiss in 2 seconds',
};
