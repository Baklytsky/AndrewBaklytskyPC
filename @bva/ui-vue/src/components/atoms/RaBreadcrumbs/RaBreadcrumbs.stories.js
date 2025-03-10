import { RaBreadcrumb, RaBreadcrumbs } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Breadcrumbs',
  component: RaBreadcrumbs,
  subcomponents: {
    RaBreadcrumb,
  },
  argTypes: {
    breadcrumbs: {
      control: 'object',
      table: {
        category: 'Props',
      },
    },
    disableLast: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaBreadcrumbs },
  props: Object.keys(argTypes),
  template: `<RaBreadcrumbs v-bind="$props" />`,
});

export const Common = Template.bind({});
Common.args = {
  breadcrumbs: [
    { text: 'Home', link: '#' },
    { text: 'Category', link: '#' },
    { text: 'Pants', link: '#' },
  ],
};

export const WithCustomDivider = Template.bind({});
WithCustomDivider.args = {
  ...Common.args,
  dividerProps: {
    divider: 'minus',
  },
};

export const UseLinkSlot = (args, { argTypes }) => ({
  components: { RaBreadcrumbs },
  props: Object.keys(argTypes),
  template: `
  <RaBreadcrumbs
    v-bind="$props">
    <template #link="{ text }">
      <span>A {{text}}!</span>
    </template>
  </RaBreadcrumbs>`,
});
UseLinkSlot.args = { ...Common.args };

export const UseCurrentSlot = (args, { argTypes }) => ({
  components: { RaBreadcrumbs },
  props: Object.keys(argTypes),
  template: `
  <RaBreadcrumbs
    v-bind="$props">
    <template #current="{ text }">
      <span>{{text}} (last item)</span>
    </template>
  </RaBreadcrumbs>`,
});

UseCurrentSlot.args = { ...Common.args };

export const UseDividerSlot = (args, { argTypes }) => ({
  components: { RaBreadcrumbs },
  props: Object.keys(argTypes),
  template: `
  <RaBreadcrumbs
    v-bind="$props">
    <template #divider>
      <span style="margin: 0 var(--spacing-xs)">|||</span>
    </template>
  </RaBreadcrumbs>`,
});

UseDividerSlot.args = { ...Common.args };
