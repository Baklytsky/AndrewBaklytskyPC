import { RaOverlay, RaImage } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Overlay',
  component: RaOverlay,
  argTypes: {
    click: { action: 'Overlay clicked!', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaOverlay, RaImage },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
    <div style="position: relative;">
      <RaImage
        :src="imageSrc"
        alt="Test Alt"
      />

      <RaOverlay
        :visible="visible"
        :transition="transition"
        v-on="actions"
      />
    </div>
  `,
});

export const Common = Template.bind({});
Common.args = {
  visible: true,
  imageSrc: '/assets/storybook/RaHeroCarousel/hero.png',
  position: 'absolute',
};

export const WithSlideTransition = Template.bind({});
WithSlideTransition.args = {
  ...Common.args,
  transition: 'ra-slide-bottom',
};
