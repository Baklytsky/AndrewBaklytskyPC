import { RaTopBar, RaLink, RaImage } from '@bva/ui-vue';
import * as CommonStylesArgTypes from '@bva/ui-shared/storybook/argTypes/common-styles';
import * as ContainerArgsTypes from '@bva/ui-shared/storybook/argTypes/container-layout';

export default {
  title: 'Components/Molecules/TopBar',
  component: RaTopBar,
  argTypes: {
    ...CommonStylesArgTypes,
    ...ContainerArgsTypes,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaTopBar, RaImage, RaLink },
  props: Object.keys(argTypes),
  template: `
  <RaTopBar v-bind="$props">
    <template #center>
      <div class="text-align--center" v-html="customContent"></div>
    </template>
    <template #left>
      <RaLink inheritColor>Help & FAQs</RaLink>
    </template>
    <template #right>
      <RaImage src="/assets/storybook/RaTopBar/flag.png" alt="flag of the USA"/>
    </template>
  </RaTopBar>`,
});

export const Common = Template.bind({});
Common.args = {
  customContent: 'Download our application.',
};

export const WithSecondLine = Template.bind({});
WithSecondLine.args = {
  customContent: 'Download our application. <br /> <a>Find out more</a> ',
};
