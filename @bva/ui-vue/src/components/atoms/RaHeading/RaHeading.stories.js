import { RaHeading, RaIcon } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Heading',
  component: RaHeading,
  argTypes: {
    align: {
      control: {
        type: 'select',
        options: ['center', 'left', 'right'],
      },
      table: {
        category: 'Props',
      },
    },
    title: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    level: {
      control: {
        type: 'number',
        range: {
          min: 1,
          max: 6,
        },
      },
      table: {
        category: 'Props',
      },
    },
    as: {
      control: {
        type: 'number',
        range: {
          min: 1,
          max: 6,
        },
      },
      table: {
        category: 'Props',
      },
    },
    description: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaHeading },
  props: Object.keys(argTypes),
  template: `
  <RaHeading
    v-bind="$props"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  level: 1,
  as: 3,
  title: 'A Great Title',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
};

export const CommonH1 = Template.bind({});
CommonH1.args = {
  ...Common.args,
  level: 1,
  as: 1,
};

export const CommonH2 = Template.bind({});
CommonH2.args = {
  ...Common.args,
  level: 2,
  as: 2,
};

export const CommonH3 = Template.bind({});
CommonH3.args = {
  ...Common.args,
  level: 3,
  as: 3,
};

export const CommonH4 = Template.bind({});
CommonH4.args = {
  ...Common.args,
  level: 4,
  as: 4,
};

export const CommonH5 = Template.bind({});
CommonH5.args = {
  ...Common.args,
  level: 5,
  as: 5,
};

export const CommonH6 = Template.bind({});
CommonH6.args = {
  ...Common.args,
  level: 6,
  as: 6,
};

export const WithLabelSlot = (args, { argTypes }) => ({
  components: { RaHeading, RaIcon },
  props: Object.keys(argTypes),
  template: `
  <RaHeading
    v-bind="$props">
    <template #title="{title}">
      <h2 style="display: flex; align-items: center">
        <RaIcon icon="heart" size="sm" style="margin-right: 1rem"/> {{title}}
      </h2>
    </template>
  </RaHeading>`,
});
WithLabelSlot.args = { ...Common.args };

export const WithDescriptionSlot = (args, { argTypes }) => ({
  components: { RaHeading, RaIcon },
  props: Object.keys(argTypes),
  template: `
  <RaHeading
    v-bind="$props">
    <template #description="{description}">
      <div style="display: flex; align-items: center">
        {{description}} <RaIcon icon="gift" size="sm" style="margin-left: 1rem"/>
      </div>
    </template>
  </RaHeading>`,
});
WithDescriptionSlot.args = { ...Common.args };
