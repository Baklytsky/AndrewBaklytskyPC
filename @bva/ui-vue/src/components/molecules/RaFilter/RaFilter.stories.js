import { RaFilter } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/Filter',
  component: RaFilter,
  decorators: [
    () => ({ template: '<div style="max-width: 22.875rem"><story/></div>' }),
  ],
  argTypes: {
    change: { action: 'Change color', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaFilter },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  data() {
    return {
      isSelected: this.selected,
    };
  },
  watch: {
    selected(newValue) {
      this.isSelected = newValue;
    },
  },
  template: `
  <RaFilter
    v-bind="$props"
    v-on="actions"
    :selected="isSelected"
    @change="isSelected = !isSelected"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  label: 'Red',
  count: 30,
};

export const Selected = Template.bind({});
Selected.args = {
  ...Common.args,
  selected: true,
};

export const AsColorFilter = Template.bind({});
AsColorFilter.args = {
  ...Common.args,
  color: '#E69494',
};

export const UseLabelSlot = (args, { argTypes }) => ({
  components: { RaFilter },
  ...Template(args, { argTypes }),
  template: `
  <RaFilter
    v-bind="$props"
    v-on="actions"
    :selected="isSelected"
    @change="isSelected = !isSelected"
  >
  <template #filter-label="{label}">CUSTOM LABEL</template>
  </RaFilter>`,
});
UseLabelSlot.args = { ...Common.args };

export const UseCountSlot = (args, { argTypes }) => ({
  components: { RaFilter },
  ...Template(args, { argTypes }),
  template: `
  <RaFilter
    v-bind="$props"
    v-on="actions"
    :selected="isSelected"
    @change="isSelected = !isSelected"
  >
  <template #filter-count="{count}">CUSTOM COUNT</template>
  </RaFilter>`,
});
UseCountSlot.args = { ...Common.args };
