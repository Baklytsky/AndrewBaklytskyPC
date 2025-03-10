import RaTitle from './RaTitle.vue';

export default {
  title: 'Components/Atoms/Title',
  component: RaTitle,
  argTypes: {
    title: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaTitle },
  props: Object.keys(argTypes),
  template: `
    <RaTitle v-bind="$props">
    </RaTitle>`,
});

export const Common = Template.bind({});
Common.args = {
  title: 'This is a title',
};
