import { RaList, RaListItem } from '@bva/ui-vue';
export default {
  title: 'Components/Molecules/List',
  component: RaList,
  subcomponents: {
    RaListItem,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaList, RaListItem },
  props: Object.keys(argTypes),
  data() {
    return {
      items: [
        { label: 'All', count: '280' },
        { label: 'Skirts', count: '11' },
        { label: 'Dresses', count: '32' },
        { label: 'Belts', count: '101' },
        { label: 'Bag', count: '2' },
        { label: 'Trainers', count: '22' },
        { label: 'Sandals', count: '55' },
      ],
    };
  },
  template: `
  <RaList :style="{maxWidth: '186px'}" v-bind="$props">
    <RaListItem 
      v-for="item in items" 
      :key="item.label" 
    >
      {{item.label}}: {{item.count}}
    </RaListItem>
  </RaList>`,
});

export const Common = Template.bind({});
Common.args = {};

export const Bullets = Template.bind({});
Bullets.args = {
  bullets: true,
};

export const Ordered = Template.bind({});
Ordered.args = {
  ordered: true,
  bullets: true,
};

export const DescriptionList = (args, { argTypes }) => ({
  components: { RaList, RaListItem },
  props: Object.keys(argTypes),
  data() {
    return {
      items: [
        { label: 'All', count: '280' },
        { label: 'Skirts', count: '11' },
        { label: 'Dresses', count: '32' },
        { label: 'Belts', count: '101' },
        { label: 'Bag', count: '2' },
        { label: 'Trainers', count: '22' },
        { label: 'Sandals', count: '55' },
      ],
    };
  },
  template: `
    <RaList :style="{maxWidth: '186px'}" v-bind="$props">
     <template v-slot:default="slotProps">
        <RaListItem
          v-for="item in items" 
          :key="item.label"
          :term="item.label"
          :details="item.count"
          :as="slotProps.as"
        />
      </template>
    </RaList>
  `,
});
DescriptionList.args = {
  as: 'dl',
};
