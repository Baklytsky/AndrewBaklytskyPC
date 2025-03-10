import { RaButton } from '@bva/ui-vue';

export default {
  title: 'Transitions/Common',
  argTypes: {
    effect: {
      control: {
        type: 'select',
        options: [
          'ra-fade',
          'ra-slide-left',
          'ra-slide-right',
          'ra-slide-top',
          'ra-slide-bottom',
        ],
      },
      table: {
        category: 'Class',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaButton },
  props: Object.keys(argTypes),
  data() {
    return { show: false };
  },
  template: `
  <div>
    <RaButton v-on:click="show = !show" style="margin-bottom: var(--spacing-sm);">
      Click to see effect
    </RaButton>

    <transition :name="effect">
      <p v-if="show" class="inline-flex">hello</p>
    </transition>
  </div>`,
});

export const FadeInOut = Template.bind({});
FadeInOut.args = {
  effect: 'ra-fade',
};

export const SlideLeft = Template.bind({});
SlideLeft.args = {
  effect: 'ra-slide-left',
};

export const SlideRight = Template.bind({});
SlideRight.args = {
  effect: 'ra-slide-right',
};

export const SlideTop = Template.bind({});
SlideTop.args = {
  effect: 'ra-slide-top',
};

export const SlideBottom = Template.bind({});
SlideBottom.args = {
  effect: 'ra-slide-bottom',
};
