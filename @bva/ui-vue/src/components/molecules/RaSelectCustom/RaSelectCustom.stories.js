import { RaSelectCustom, RaSelectCustomOption } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/SelectCustom',
  component: RaSelectCustom,
  subcomponents: {
    RaSelectCustomOption,
  },
  argTypes: {
    label: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    selected: {
      control: 'object',
      table: {
        category: 'Props',
      },
    },
    size: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    required: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    valid: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    disabled: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    errorMessage: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    persistent: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const optionsList = [
  { value: 'amaranth', color: '#E52B50', label: 'Amaranth' },
  { value: 'amber', color: '#FFBF00', label: 'Amber' },
  { value: 'arctic-lime', color: '#D0FF14', label: 'Arctic lime' },
  { value: 'bluetiful', color: '#3C69E7', label: 'Bluetiful' },
  { value: 'buff', color: '#F0DC82', label: 'Buff' },
];

const Template = (args, { argTypes }) => ({
  components: { RaSelectCustom, RaSelectCustomOption },
  props: Object.keys(argTypes),
  data() {
    return {
      options: optionsList,
      currentValue: this.value,
    };
  },
  template: `
  <RaSelectCustom
    style="max-width: 30rem"
    v-bind="$props"
    v-model="currentValue"
  >
    <RaSelectCustomOption v-for="(option, key) in options" :key="key" :value="option.value">
      {{option.label}}
    </RaSelectCustomOption>
  </RaSelectCustom>`,
});

export const Common = Template.bind({});
Common.args = {
  id: 'Test',
  label: 'Color',
};

export const Selected = Template.bind({});
Selected.args = {
  ...Common.args,
  value: optionsList[2].value,
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  required: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
  ...Common.args,
  valid: false,
  value: optionsList[0].value,
};

export const Persistent = Template.bind({});
Persistent.args = {
  ...Common.args,
  persistent: true,
};

export const FetchOptions = (args, { argTypes }) => ({
  components: { RaSelectCustom, RaSelectCustomOption },
  props: Object.keys(argTypes),
  data() {
    return {
      options: [],
      isLoading: true,
      currentValue: this.value,
    };
  },
  methods: {
    fetchOptions() {
      if (this.isLoading) {
        setTimeout(() => {
          this.isLoading = false;

          this.options = optionsList;
        }, 2000);
      }
    },
  },
  template: `
  <RaSelectCustom
    style="max-width: 30rem"
    :loading="isLoading"
    drawerMinHeight="12rem"
    drawerMaxHeight="12rem"
    v-bind="$props"
    v-model="currentValue"
    @open="fetchOptions"
  >
    <RaSelectCustomOption v-for="(option, key) in options" :key="key" :value="option.value">
      {{option.label}}
    </RaSelectCustomOption>
  </RaSelectCustom>`,
});
FetchOptions.args = {
  ...Common.args,
};
