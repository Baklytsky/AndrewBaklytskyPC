import RaContainer from './RaContainer.vue';
import * as CommonTextArgTypes from '@bva/ui-shared/storybook/argTypes/common-text';
import * as CommonStylesArgTypes from '@bva/ui-shared/storybook/argTypes/common-styles';
import * as ContainerArgsTypes from '@bva/ui-shared/storybook/argTypes/container-layout';

export default {
  title: 'Components/Molecules/Container',
  component: RaContainer,
  argTypes: {
    ...CommonTextArgTypes,
    ...CommonStylesArgTypes,
    ...ContainerArgsTypes,
    combined: {
      control: 'boolean',
      table: {
        category: 'Container Layout',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaContainer },
  props: Object.keys(argTypes),
  template: `
    <RaContainer
      v-bind="$props"
    >
      <h1>Some Content</h1>
    </RaContainer>`,
});

export const Common = Template.bind({});
Common.args = {
  backgroundColor: '#EEE',
  foregroundColor: '#777',
  spacingTop: {
    base: 'lg',
    md: '2xl',
  },
  spacingBottom: {
    base: 'lg',
    md: '2xl',
  },
  spacingEdge: {
    base: 'lg',
    lg: '2xl',
  },
};
