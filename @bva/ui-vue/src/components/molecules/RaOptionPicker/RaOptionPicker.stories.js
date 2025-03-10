import { RaOptionPicker, RaPicker, RaButton } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/OptionPicker',
  component: RaOptionPicker,
  subcomponents: {
    RaPicker,
  },
  decorators: [
    () => ({
      template: `<div style="max-width: 26.25rem"><story /></div>`,
    }),
  ],
  argTypes: {
    options: {
      control: 'object',
    },
    label: {
      control: 'text',
    },
    selected: {
      control: 'text',
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['', 'sm', 'lg'],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: ['', 'grid', 'dropdown'],
    },
    itemsPerRow: {
      control: 'number',
    },
    displaySelected: {
      control: 'boolean',
    },
  },
};

const sizeOptions = [
  {
    label: '8',
    value: '8',
  },
  {
    label: '8.5',
    value: '8.5',
  },
  {
    label: '9',
    value: '9',
  },
  {
    label: '9.5',
    value: '9.5',
    disabled: true,
  },
  {
    label: '10',
    value: '10',
  },
  {
    label: '10.5',
    value: '10.5',
  },
  {
    label: '11',
    value: '11',
    disabled: true,
  },
  {
    label: '11.5',
    value: '11.5',
  },
  {
    label: '12',
    value: '12',
    disabled: true,
  },
  {
    label: '12.5',
    value: '12.5',
  },
];

const Template = (args, { argTypes }) => ({
  components: { RaOptionPicker },
  props: Object.keys(argTypes),
  methods: {
    handleOptionChange(selected, option) {
      if (this.multiple) {
        this.handleMulti(selected, option);
      } else {
        this.handleSingle(selected, option);
      }
    },
    handleMulti(selected, option) {
      this.selectionData = Array.isArray(this.selectionData)
        ? this.selectionData
        : [this.selectionData];

      if (selected) {
        this.selectionData.push(option.value);
      } else {
        this.selectionData = this.selectionData.filter(
          (item) => item !== option.value
        );
      }
    },
    handleSingle(selected, option) {
      this.selectionData = selected ? option.value : null;
    },
  },
  data() {
    return {
      selectionData: this.selected,
    };
  },
  watch: {
    selected() {
      this.selectionData = this.selected;
    },
  },
  template: `
    <RaOptionPicker
      v-bind="$props"
      :selected="selectionData"
      @change:option="handleOptionChange"
    >
      <template #message>
        Your size out of stock? Select your size above and get notified when it’s available.
      </template>
    </RaOptionPicker>
  `,
});

export const Common = Template.bind({});
Common.args = {
  type: 'Size',
  label: 'Size',
  selected: '10',
  options: sizeOptions,
};

export const SelectMultiple = Template.bind({});
SelectMultiple.args = {
  ...Common.args,
  selected: ['8', '10', '12.5'],
  multiple: true,
};

export const AsDropdown = Template.bind({});
AsDropdown.args = {
  ...Common.args,
  selected: '8',
  variant: 'dropdown',
};

export const WithOptionSlot = (args, { argTypes }) => ({
  components: { RaOptionPicker, RaButton },
  props: Object.keys(argTypes),
  methods: {
    updateSelection(selected, option) {
      this.selectionData = selected ? option : null;
    },
  },
  data() {
    return {
      sizeOptions,
      selectionData: this.selected,
    };
  },
  template: `
  <RaOptionPicker
    v-bind="$props"
    :selected="selectionData"
  >
    <template v-slot:default="slotProps">
      <div class="flex">
        <RaButton
          v-for="(option) in sizeOptions"
          :key="option.value"
          :disabled="option.disabled"
          :variant="slotProps.isOptionSelected(option) ? 'tertiary' : 'secondary'"
          :size="'xs'"
          :icon="slotProps.isOptionSelected(option) ? 'check' : ''"
          @click="() => updateSelection(true, option)"
        >
          {{ option.label || option.value }}
        </RaButton>
      </div>
    </template>
  </RaOptionPicker>`,
});
WithOptionSlot.args = {
  ...Common.args,
  label: 'Custom Picker (with slot)',
  selected: '9',
  displaySelected: false,
};
