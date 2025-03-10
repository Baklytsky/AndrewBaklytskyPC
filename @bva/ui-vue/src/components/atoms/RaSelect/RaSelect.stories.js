import { RaSelect, RaSelectOption } from '@bva/ui-vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

const options = [
  { value: '', label: 'Please Select' },
  { value: 'amaranth', color: '#E52B50', label: 'Amaranth' },
  { value: 'amber', color: '#FFBF00', label: 'Amber' },
  { value: 'arctic-lime', color: '#D0FF14', label: 'Arctic lime' },
  { value: 'bluetiful', color: '#3C69E7', label: 'Bluetiful' },
  { value: 'buff', color: '#F0DC82', label: 'Buff' },
];

export default {
  title: 'Components/Atoms/Input Elements/Select',
  component: RaSelect,
  subcomponents: {
    RaSelectOption,
  },
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['', 'ghost'].concat(UIColorNames),
      },
      table: {
        category: 'props',
        defaultValue: {
          summary: '',
        },
      },
    },
    label: {
      control: 'text',
      table: {
        category: 'Props',
        defaultValue: {
          summary: '',
        },
      },
      description: 'Select field label',
    },
    value: {
      control: 'text',
      table: {
        category: 'Props',
        defaultValue: {
          summary: '',
        },
      },
      description: 'Value selected',
    },
    placeholder: {
      control: 'text',
      table: {
        category: 'Props',
        defaultValue: {
          summary: '',
        },
      },
      description: 'Placeholder',
    },
    errorMessage: {
      control: 'text',
      table: {
        category: 'Props',
        defaultValue: {
          summary: 'This field is not correct.',
        },
      },
      description:
        'Error message value of form select. It will be appeared if `valid` is `true`.',
    },
    required: {
      control: 'boolean',
      table: {
        category: 'Props',
        defaultValue: {
          summary: false,
        },
      },
      description: 'Required field?',
    },
    disabled: {
      control: 'boolean',
      table: {
        category: 'Props',
        defaultValue: {
          summary: false,
        },
      },
      description: 'Disabled status of form select',
    },
    valid: {
      control: 'boolean',
      table: {
        category: 'Props',
        defaultValue: {
          summary: true,
        },
      },
      description: 'Validate value of form select',
    },
    input: { action: 'Selected', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSelect, RaSelectOption },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  data() {
    return {
      options,
      selectedValue: this.value,
    };
  },
  template: `
  <RaSelect
    v-bind="$props"
    v-model="selectedValue"
    v-on="actions"
  >
    <RaSelectOption v-for="(option, key) in options" :key="key" :value="option.value">
      {{option.label}}
    </RaSelectOption>
  </RaSelect>`,
});

export const Common = Template.bind({});
Common.args = {
  label: 'Color',
};

export const Invalid = Template.bind({});
Invalid.args = {
  ...Common.args,
  valid: false,
};

export const Required = Template.bind({});
Required.args = {
  ...Common.args,
  required: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  disabled: true,
};

export const HasSelectedValue = Template.bind({});
HasSelectedValue.args = {
  ...Common.args,
  value: 'amber',
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  ...Common.args,
  placeholder: 'Select something',
};

export const WithInlineLabel = Template.bind({});
WithInlineLabel.args = {
  label: 'Color',
  inlineLabel: true,
};

export const WithInlineLabelHasSelectedValue = (args, { argTypes }) => ({
  components: { RaSelect, RaSelectOption },
  props: Object.keys(argTypes),
  data() {
    return {
      options,
      selectedValue: 'buff',
    };
  },
  template: `
  <RaSelect
    v-bind="$props"
    v-model="selectedValue"
    @input="input"
  >
    <RaSelectOption v-for="(option, key) in options" :key="key" :value="option.value">
      {{option.label}}
    </RaSelectOption>
  </RaSelect>`,
});
WithInlineLabelHasSelectedValue.args = {
  ...WithInlineLabel.args,
};

export const WithCustomInlineLabel = (args, { argTypes }) => ({
  components: { RaSelect, RaSelectOption },
  ...Template(args, { argTypes }),
  template: `
  <RaSelect
    v-bind="$props"
    v-model="selectedValue"
    v-on="actions"
  >
    <RaSelectOption v-for="(option, key) in options" :key="key" :value="option.value">
      {{option.label}}
    </RaSelectOption>

    <template #label="{selectedOptionLabel}">
      <div>{{ label }} // {{ selectedOptionLabel }} //</div>
    </template>
  </RaSelect>`,
});
WithCustomInlineLabel.args = {
  ...WithInlineLabel.args,
};
