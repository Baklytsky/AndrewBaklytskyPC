import { RaSwatch } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Swatch',
  component: RaSwatch,
  argTypes: {
    color: {
      control: 'color',
      table: {
        category: 'Props',
      },
    },
    displayBadge: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    selected: {
      control: 'boolean',
      defaultValue: false,
      table: {
        category: 'Props',
      },
    },
    size: {
      control: 'text',
      defaultValue: '2rem',
      table: {
        category: 'Props',
      },
    },
    shape: {
      control: {
        type: 'select',
        options: ['', 'rounded'],
      },
      table: {
        category: 'Props',
      },
    },
    change: { action: 'toggle selected', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSwatch },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  methods: {
    toggleSelected(newData) {
      this.isSelected = !this.isSelected;
    },
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
  <RaSwatch
    :selected="isSelected"
    v-bind="$props"
    @change="toggleSelected"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  color: 'black',
};

export const Selected = Template.bind({});
Selected.args = {
  ...Common.args,
  selected: true,
};

export const DisplayBadge = Template.bind({});
DisplayBadge.args = {
  ...Selected.args,
  displayBadge: true,
};

export const Rounded = Template.bind({});
Rounded.args = {
  ...Common.args,
  shape: 'rounded',
};

export const WithColor = Template.bind({});
WithColor.args = {
  color: 'red',
};
