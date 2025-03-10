import {
  RaTable,
  RaTableRow,
  RaTableData,
  RaTableHeader,
  RaTableHeading,
  RaButton,
} from '@bva/ui-vue';

export default {
  title: 'Components/Organisms/Table',
  component: RaTable,
  subcomponents: {
    RaTableRow,
    RaTableData,
    RaTableHeader,
    RaTableHeading,
  },
  argTypes: {
    classes: {
      control: {
        type: 'select',
        options: ['', 'ra-table--no-border'],
      },
      table: {
        category: 'HTML Attributes',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: {
    RaTable,
    RaTableRow,
    RaTableData,
    RaTableHeader,
    RaTableHeading,
    RaButton,
  },
  props: Object.keys(argTypes),
  data() {
    return {
      tableHeaders: [
        'Order ID',
        'Pay. date',
        'Pay. method',
        'Amount',
        'Status',
      ],
      tableRows: [
        ['#35767', '4th Nov', 'Paypal', '12.00$', 'Finalise'],
        ['#35767', '4th Nov', 'Visa', '15.00$', 'In process'],
        ['#35767', '4th Nov', 'Paypal', '12.00$', 'Finalise'],
      ],
      status: {
        Finalise: 'text-success',
        'In process': 'text-warning',
      },
    };
  },
  template: `
  <RaTable :class="classes">
    <RaTableHeading>
      <RaTableHeader 
          v-for="header in tableHeaders" 
          :key="header"
      >{{header}}</RaTableHeader>
      <RaTableHeader><RaButton :as-text="true">Download all</RaButton></RaTableHeader>
    </RaTableHeading>
    <RaTableRow 
      v-for="(row, key) in tableRows"
      :key="key"
    > 
      <RaTableData
        v-for="data in row"
        :key="data"
        :class="status[data]">{{data}}</RaTableData>
        <RaTableData><RaButton :as-text="true">View details</RaButton></RaTableData>
    </RaTableRow>
  </RaTable>`,
});

export const Common = Template.bind({});
Common.args = {};

export const WithoutBorder = Template.bind({});
WithoutBorder.args = {
  classes: 'ra-table--no-border',
};
