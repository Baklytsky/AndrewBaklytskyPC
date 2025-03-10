import { RaRating, RaIcon } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Rating',
  component: RaRating,
  argTypes: {
    max: {
      control: {
        type: 'number',
        range: {
          min: 0,
        },
      },
      defaultValue: 5,
      table: {
        category: 'Props',
      },
    },
    score: {
      control: {
        type: 'number',
        range: {
          min: 0,
        },
      },
      defaultValue: 1,
      table: {
        category: 'Props',
      },
    },
    icon: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaRating },
  props: Object.keys(argTypes),
  template: `<RaRating v-bind="$props" />`,
});

export const Common = Template.bind({});
Common.args = {
  score: 3.5,
};

export const WithVisibleScore = Template.bind({});
WithVisibleScore.args = {
  score: 4.5,
  displayScore: true,
};

export const AsButton = Template.bind({});
AsButton.args = {
  score: 3.5,
  asButton: true,
  displayScore: true,
};

export const WithHigherMax = Template.bind({});
WithHigherMax.args = {
  ...Common.args,
  max: 10,
  score: 7.5,
};

export const WithCustomIcon = Template.bind({});
WithCustomIcon.args = {
  ...Common.args,
  icon: 'heart',
};

export const WithIconPositiveSlot = (args, { argTypes }) => ({
  components: { RaRating, RaIcon },
  props: Object.keys(argTypes),
  template: `
  <RaRating
    :max="max"
    :score="score"
    :icon="icon">
    <template #icon-positive="slotProps">
      <RaIcon size="sm" :coverage="slotProps.coverage" icon="check_circle" />
    </template>  
  </RaRating>`,
});
WithIconPositiveSlot.args = { ...Common.args };

export const WithIconNegativeSlot = (args, { argTypes }) => ({
  components: { RaRating, RaIcon },
  props: Object.keys(argTypes),
  template: `
  <RaRating
    :max="max"
    :score="score"
    :icon="icon">
    <template #icon-negative>
      <RaIcon size="sm" icon="check_circle" />
    </template>
  </RaRating>`,
});

WithIconNegativeSlot.args = { ...Common.args };
