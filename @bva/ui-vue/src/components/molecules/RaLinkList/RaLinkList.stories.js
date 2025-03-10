import RaLinkList from './RaLinkList.vue';

export default {
  title: 'Components/Molecules/LinkList',
  component: RaLinkList,
  argTypes: {
    linkList: {
      control: 'object',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaLinkList },
  props: Object.keys(argTypes),
  template: `
    <RaLinkList
      :linkList="linkList"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  linkList: [
    {
      label: 'Default',
      title: 'please click me',
      'aria-label': 'please click me, navigate out',
      link: '#',
    },
    {
      label: 'Secondary',
      title: 'please click me',
      'aria-label': 'please click me, navigate out',
      link: '#',
      variant: 'secondary',
    },
    {
      label: 'Tertiary',
      title: 'please click me',
      'aria-label': 'please click me, navigate out',
      link: '#',
      variant: 'tertiary',
    },
  ],
};

export const WithSingleCTA = Template.bind({});
WithSingleCTA.args = {
  linkList: {
    label: 'Single CTA',
    title: 'please click me',
    'aria-label': 'please click me, navigate out',
    link: '#',
  },
};
