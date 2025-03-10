import { RaScrollable, RaList, RaListItem } from '@bva/ui-vue';

const options = [
  {
    color: 'red',
    label: 'Red',
  },
  {
    color: 'blue',
    label: 'Blue',
  },
  {
    color: 'green',
    label: 'Green',
  },
  {
    color: 'black',
    label: 'Black',
  },
  {
    color: 'navy',
    label: 'Navy',
  },
  {
    color: 'pink',
    label: 'Pink',
  },
];

export default {
  title: 'Components/Molecules/Scrollable',
  component: RaScrollable,
};

const Template = (args, { argTypes }) => ({
  components: { RaScrollable, RaList, RaListItem },
  props: Object.keys(argTypes),
  data() {
    return {
      options,
      isExpanded: this.expanded,
    };
  },
  template: `
  <RaScrollable 
    v-model="isExpanded"
    v-bind="$props"
    style="max-width: 13.75rem"
  >
    <RaList>
      <RaListItem
        v-for="(option, key) in options" 
        :key="option.color" 
      >
        {{ option.label }}
      </RaListItem>
    </RaList>
  </RaScrollable>`,
});

export const Common = Template.bind({});
Common.args = {
  customStyle: '',
  maxContentHeight: '6.875rem',
};

export const WithCSSHeight = Template.bind({});
WithCSSHeight.args = {
  customStyle: '--max-height: 6.875rem;',
};
