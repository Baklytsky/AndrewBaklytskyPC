import { RaRow, RaCol } from '@bva/ui-vue';
import * as ColumnArgTypes from '@bva/ui-shared/storybook/argTypes/column-layout';

export default {
  title: 'Components/Atoms/Flex/Row',
  component: RaRow,
  subcomponents: {
    RaCol,
  },
  argTypes: {
    ...ColumnArgTypes,
    alignItems: {
      control: {
        type: 'select',
      },
      options: ['', 'start', 'center', 'end', 'baseline', 'stretch'],
    },
    justifyContent: {
      control: {
        type: 'select',
      },
      options: ['', 'start', 'center', 'end', 'around', 'between'],
    },
    count: {
      control: 'number',
      defaultValue: 3,
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaRow, RaCol },
  props: Object.keys(argTypes),
  computed: {
    columnCount() {
      return Array.from(Array(this.count));
    },
  },
  methods: {
    getSubTemplate(count, useUnevenHeight) {
      return `
        <div
            class="set--w-100 bg-secondary text-white font-size-h3 flex flex-grow-1 items-center justify-center"
            style="min-height: ${
              (useUnevenHeight ? count : 2) * 100
            }px; border-radius: .25rem;">
            ${count}
        </div>
      `;
    },
  },
  template: `
    <RaRow
      :alignItems="alignItems"
      :justifyContent="justifyContent"
      :gap="gap">
      <RaCol
        v-for="(currentCol, index) in columnCount"
        :key="index"
        :size="size"
        :md="md"
        :lg="lg"
        v-html="getSubTemplate(index + 1, useUnevenHeight)">
      </RaCol>
    </RaRow>`,
});

export const Common = Template.bind({});
Common.args = {
  size: '12',
  md: '5',
  lg: '4',
  useUnevenHeight: false,
};

export const WithUnevenHeight = Template.bind({});
WithUnevenHeight.args = {
  ...Common.args,
  useUnevenHeight: true,
};

export const LeftAligned = Template.bind({});
LeftAligned.args = {
  ...Common.args,
  justifyContent: 'start',
};

export const RightAligned = Template.bind({});
RightAligned.args = {
  ...Common.args,
  justifyContent: 'end',
};
