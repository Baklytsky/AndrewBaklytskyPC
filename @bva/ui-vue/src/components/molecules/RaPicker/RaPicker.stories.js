import { RaPicker, RaButton } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Picker',
  component: RaPicker,
  decorators: [
    () => ({
      template: `<div style="max-width: 26.25rem"><story /></div>`,
    }),
  ],
  argTypes: {},
};

export const Common = (args, { argTypes }) => ({
  components: { RaPicker, RaButton },
  props: Object.keys(argTypes),
  data() {
    return {
      option: {
        value: 'option-1',
        label: 'option 1',
        selected: false,
      },
      selectedValue: '',
    };
  },
  computed: {
    btnVariant() {
      return this.option.selected ? 'primary' : 'secondary';
    },
  },
  methods: {
    handleChange(selected, option) {
      this.option.selected = selected;
      this.selectedValue = selected ? option.label : '';
    },
  },
  template: `
    <RaPicker 
      v-bind="$props"
      :selected="selectedValue"
      @change:option="handleChange"
    >
      <template #default="provided">
        <RaButton
          :variant="btnVariant"
          @click="provided.handleOptionChange(!option.selected, option)"
        >
          {{option.label}}
        </RaButton>
      </template>
    </RaPicker>
  `,
});
Common.args = {
  label: 'Select an option',
  labelSelected: 'Selected: ',
};

export const WithSeparator = (args, { argTypes }) => ({
  components: { RaPicker, RaButton },
  props: Object.keys(argTypes),
  data() {
    return {
      pickerOptions: [
        {
          value: 'option-1',
          label: 'option 1',
          selected: false,
        },
        {
          value: 'option-2',
          label: 'option 2',
          selected: false,
        },
        {
          value: 'option-3',
          label: 'option 3',
          selected: false,
        },
      ],
      selectedValue: [],
    };
  },
  methods: {
    handleChange(selected, selectedOption) {
      this.pickerOptions.forEach((option) => {
        if (option === selectedOption) {
          if (this.selectedValue.indexOf(option.value) === -1) {
            option.selected = selected;
            this.selectedValue.push(option.value);
          } else {
            this.selectedValue = this.selectedValue.filter(
              (optVal) => optVal !== option.value
            );
            option.selected = selected;
          }
        }
      });
    },
    btnVariant(option) {
      return option.selected ? 'primary' : 'secondary';
    },
  },
  template: `
    <RaPicker 
      v-bind="$props"
      :selected="selectedValue"
      @change:option="handleChange"
    >
      <template #default="provided">
        <RaButton
          v-for="option in pickerOptions"
          :variant="btnVariant(option)"
          @click="provided.handleOptionChange(!option.selected, option)"
        >
          {{option.label}}
        </RaButton>
      </template>
    </RaPicker>
  `,
});

WithSeparator.args = {
  ...Common.args,
  selectedSeparator: '/',
};
