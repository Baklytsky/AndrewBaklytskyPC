import { RaSearchBar } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/SearchBar',
  component: RaSearchBar,
  argTypes: {
    classes: {
      control: {
        type: 'select',
        options: [
          '',
          'ra-search-bar--position-center',
          'ra-search-bar--no-icon',
        ],
      },
    },
    placeholder: {
      control: 'text',
      table: {
        category: 'Props',
        defaultValue: {
          summary: '',
        },
      },
      description: 'Text for placeholder',
    },
    value: {
      control: 'number',
      table: {
        category: 'Props',
        defaultValue: {
          summary: null,
        },
      },
      description: 'Value that will be displayed in search bar',
    },
    iconSize: {
      control: 'text',
      table: {
        category: 'Props',
      },
      name: 'icon.size',
      description: 'Define size of the search icon',
    },
    iconColor: {
      control: 'color',
      table: {
        category: 'Props',
      },
      name: 'icon.color',
      description: 'Define color of the search icon',
    },
    input: { action: 'Input changed', table: { category: 'Events' } },
    blur: { action: 'Not focus anymore', table: { category: 'Events' } },
    focus: { action: 'Focus', table: { category: 'Events' } },
    'click:search-action': {
      action: 'Action click',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSearchBar },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  data() {
    return {
      searchValue: this.value,
    };
  },
  template: `
  <RaSearchBar
  :class="classes"
  v-bind="$props"
  v-on="actions"
  v-model="searchValue"/>`,
});

export const Common = Template.bind({});
Common.args = {
  placeholder: 'Search for items',
};

export const WithValue = Template.bind({});
WithValue.args = {
  ...Common.args,
  value: 'hello',
};

export const UseIconSlot = (args, { argTypes }) => ({
  components: { RaSearchBar },
  ...Template(args, { argTypes }),
  template: `
  <RaSearchBar
    v-bind="$props"
    v-on="actions"
    v-model="searchValue">
    <template #search-action>
      <span class="ra-search-bar__button">
        👀
      </span>
    </template>
  </RaSearchBar>`,
});
UseIconSlot.args = { ...Common.args };
