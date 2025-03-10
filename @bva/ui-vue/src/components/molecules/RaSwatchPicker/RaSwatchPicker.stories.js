import { RaSwatchPicker, RaPicker } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/SwatchPicker',
  component: RaSwatchPicker,
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
    displaySelected: {
      control: 'boolean',
    },
    displayBadge: {
      control: 'boolean',
    },
    itemsPerRow: {
      control: 'number',
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['', 'xs', 'sm', 'lg'],
    },
    shape: {
      control: {
        type: 'select',
      },
      options: ['', 'square', 'rounded'],
    },
    variant: {
      control: {
        type: 'select',
      },
      options: ['', 'grid', 'scrollable'],
    },
    fillSpace: {
      control: 'boolean',
    },
  },
};

const colorOptions = [
  { label: 'Sand', value: 'sand', color: '#EDCBB9' },
  { label: 'Mint', value: 'mint', color: '#ABD9D8' },
  { label: 'Allports', value: 'allports', color: '#0076A3' },
  { label: 'Chablis', value: 'chablis', color: '#FFF4F3' },
  { label: 'Disco', value: 'disco', color: '#871550' },
  { label: 'Gigas', value: 'gigas', color: '#523C94' },
  {
    label: 'Light Gray',
    value: 'light gray',
    color: '#F1F2F3',
  },
  {
    label: 'Vivid rose',
    value: 'vivid rose',
    color: '#DB5593',
  },
  {
    label: 'Peach',
    value: 'peach',
    color: '#F59F93',
    disabled: true,
  },
  {
    label: 'Citrus',
    value: 'citrus',
    color: '#FFEE97',
  },
];

const Template = (args, { argTypes }) => ({
  components: { RaSwatchPicker },
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
    <RaSwatchPicker
      v-bind="$props"
      :selected="selectionData"
      @change:option="handleOptionChange"
    />
  `,
});

export const Common = Template.bind({});
Common.args = {
  type: 'Color',
  label: 'Color',
  selected: 'citrus',
  size: 'lg',
  options: colorOptions,
  fillSpace: false,
};

export const SelectMultiple = Template.bind({});
SelectMultiple.args = {
  ...Common.args,
  selected: ['sand', 'citrus'],
  multiple: true,
};

export const Scrollable = Template.bind({});
Scrollable.args = {
  ...Common.args,
  variant: 'scrollable',
  shape: 'square',
  size: {
    width: '5rem',
    height: '50%',
  },
};
