import { RaPagination } from '@bva/ui-vue';
export default {
  title: 'Components/Molecules/Pagination',
  component: RaPagination,
  argTypes: {
    total: {
      control: 'number',
      table: {
        category: 'Props',
      },
      defaultValue: 0,
    },
    current: {
      control: 'number',
      defaultValue: 1,
      table: {
        category: 'Props',
      },
    },
    visible: {
      control: 'number',
      defaultValue: 5,
      table: {
        category: 'Props',
      },
    },
    hasArrows: {
      control: 'boolean',
      defaultValue: true,
      table: {
        category: 'Props',
      },
    },
    pageParamName: {
      control: 'text',
      defaultValue: 'page',
      table: {
        category: 'Props',
      },
    },
    click: { action: 'Go to page clicked', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaPagination },
  props: Object.keys(argTypes),
  data() {
    return {
      currentPage: this.current,
    };
  },
  template: `
  <RaPagination
  v-model="currentPage"
  :visible="visible"
  :total="total"
  :has-arrows="hasArrows"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  total: 5,
};

export const WithoutArrows = Template.bind({});
WithoutArrows.args = { ...Common.args, hasArrows: false };

export const UsePointsSlot = (args, { argTypes }) => ({
  components: { RaPagination },
  props: Object.keys(argTypes),
  template: `
  <RaPagination
  :current="current"
  :visible="visible"
  :total="total"
  :has-arrows="hasArrows"
  @click="click"
  >
    <template #dots >🎉</template>
  </RaPagination>`,
});
UsePointsSlot.args = {
  ...Common.args,
  visible: 2,
};

export const UsePrevSlot = (args, { argTypes }) => ({
  components: { RaPagination },
  props: Object.keys(argTypes),
  template: `
  <RaPagination
  :current="current"
  :visible="visible"
  :total="total"
  :has-arrows="hasArrows"
  @click="click"
  >
    <template #prev="{isDisabled, go, prev}">
      <button @click="go(prev)">prev</button>
    </template>
  </RaPagination>`,
});
UsePrevSlot.args = { ...Common.args };

export const UseNextSlot = (args, { argTypes }) => ({
  components: { RaPagination },
  props: Object.keys(argTypes),
  template: `
  <RaPagination
  :current="current"
  :visible="visible"
  :total="total"
  :has-arrows="hasArrows"
  @click="click"
  >
    <template #next="{isDisabled, go, next}">
      <button @click="go(next)">next</button>
    </template>
  </RaPagination>`,
});
UseNextSlot.args = { ...Common.args };

export const UseNumberSlot = (args, { argTypes }) => ({
  components: { RaPagination },
  props: Object.keys(argTypes),
  template: `
  <RaPagination
  :current="current"
  :visible="visible"
  :total="total"
  :has-arrows="hasArrows"
  @click="click"
  >
    <template #number="{page}">
      <button 
        class="ra-pagination__item"
        :class="{'current': current === page}">{{page}}</button>
    </template>
  </RaPagination>`,
});
UseNumberSlot.args = { ...Common.args };
