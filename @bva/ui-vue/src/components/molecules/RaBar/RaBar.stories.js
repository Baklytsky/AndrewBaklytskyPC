import { RaBar } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/Bar',
  component: RaBar,
  argTypes: {
    title: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    back: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    close: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    'click:back': { action: 'Back clicked', table: { category: 'Events' } },
    'click:close': { action: 'Close clicked', table: { category: 'Events' } },
  },
  args: {
    title: 'Dresses',
    back: false,
    close: false,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaBar },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
    <RaBar
      :title="title"
      :back="back"
      :close="close"
      v-on="actions"
    />
  `,
});

export const Common = Template.bind({});
export const WithBackBtn = Template.bind({});
WithBackBtn.args = {
  back: true,
};

export const WithCloseBtn = Template.bind({});
WithCloseBtn.args = {
  close: true,
};

export const UseTitleSlot = (args, { argTypes }) => ({
  components: { RaBar },
  ...Template(args, { argTypes }),
  template: `
  <RaBar
    :title="title"
    :back="back"
    :close="close"
    v-on="actions"
  >
    <template #title="{title}">CUSTOM TITLE</template>
  </RaBar>`,
});
UseTitleSlot.args = { ...WithBackBtn.args };

export const UseBackSlot = (args, { argTypes }) => ({
  components: { RaBar },
  ...Template(args, { argTypes }),
  template: `
  <RaBar
    :title="title"
    :close="close"
    v-on="actions"
  >
    <template #back><button>CUSTOM BACK</button></template>
  </RaBar>`,
});
UseBackSlot.args = { ...WithCloseBtn.args };

export const UseCloseSlot = (args, { argTypes }) => ({
  components: { RaBar },
  ...Template(args, { argTypes }),
  template: `
  <RaBar
    :title="title"
    :back="back"
    :close="close"
    v-on="actions"
  >
    <template #close><button>CUSTOM CLOSE</button></template>
  </RaBar>`,
});
UseCloseSlot.args = { ...WithCloseBtn.args };
