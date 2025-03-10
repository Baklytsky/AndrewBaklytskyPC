import { RaReview } from '@bva/ui-vue';
export default {
  title: 'Components/Molecules/Review',
  component: RaReview,
  argTypes: {
    author: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    date: {
      control: 'date',
      table: {
        category: 'Props',
      },
    },
    body: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    rating: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    truncate: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaReview },
  props: Object.keys(argTypes),
  template: `<RaReview v-bind="$props" />`,
});

export const Common = Template.bind({});
Common.args = {
  author: 'Jane D.Smith',
  date: '4 April 2019',
  title: 'Hello! Here to post an awesome review!',
  body: 'I was looking for a bright light for the kitchen but wanted some item more modern than a strip light. this one is perfect, very bright and looks great. I can comment on interlation as I had an electrition instal it. Would recommend.',
  rating: 4,
};

export const WithTruncate = Template.bind({});
WithTruncate.args = {
  ...Common.args,
  truncate: 100,
};

export const WithVoting = Template.bind({});
WithVoting.args = {
  ...Common.args,
  voting: true,
};
