import { ref } from 'vue-demi';
import { RaSidebar, RaButton } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/Sidebar',
  component: RaSidebar,
  argTypes: {
    position: {
      control: {
        type: 'select',
        options: ['left', 'right'],
      },
    },
    close: { action: 'Close sidebar clicked', table: { category: 'Events' } },
  },
  parameters: {
    docs: {
      inlineStories: false,
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaSidebar, RaButton },
  props: getProps(argTypes),
  setup() {
    const triggerEl = ref(null);

    return {
      triggerEl,
      actions: getActions(args),
    };
  },
  data() {
    return {
      isVisible: this.visible,
    };
  },
  watch: {
    visible(newValue) {
      this.isVisible = newValue;
    },
  },
  methods: {
    handleOpenSidebar() {
      this.isVisible = true;
    },
  },
  template: `
    <div>
      <RaButton ref="triggerEl" @click="handleOpenSidebar">
        Click to Show Sidebar
      </RaButton>

      <RaSidebar
        v-bind="$props"
        v-model="isVisible"
        v-on="actions"
        teleportTo="#root"
        :trigger="triggerEl"
      >
        <p v-for="(_, index) in Array.from(Array(40))" :key="index">
          Line item #{{ index + 1 }}
        </p>
      </RaSidebar>
    </div>
  `,
});

export const Common = Template.bind({});
Common.args = {
  visible: true,
  title: 'My Cart',
};

export const OnTheRight = Template.bind({});
OnTheRight.args = {
  ...Common.args,
  position: 'right',
};

export const NoOverlay = Template.bind({});
NoOverlay.args = {
  ...Common.args,
  overlay: false,
};

export const Persistent = Template.bind({});
Persistent.args = {
  ...Common.args,
  persistent: true,
};

export const UseTopSlot = (args, { argTypes }) => ({
  components: { RaSidebar },
  ...Template(args, { argTypes }),
  template: `
  <RaSidebar
    v-bind="$props"
    v-model="isVisible"
    v-on="actions"
    teleportTo="#root"
  >
    <p v-for="(_, index) in Array.from(Array(40))" :key="index">
      Line item #{{ index + 1 }}
    </p>

    <template #top>
      TOP CONTENT
    </template>
  </RaSidebar>`,
});
UseTopSlot.args = {
  ...Common.args,
};

export const UseBottomSlot = (args, { argTypes }) => ({
  components: { RaSidebar },
  ...Template(args, { argTypes }),
  template: `
  <RaSidebar
    v-bind="$props"
    v-model="isVisible"
    v-on="actions"
    teleportTo="#root"
  >
    <p v-for="(_, index) in Array.from(Array(40))" :key="index">
      Line item #{{ index + 1 }}
    </p>

    <template #bottom>
      BOTTOM CONTENT
    </template>
  </RaSidebar>`,
});
UseBottomSlot.args = {
  ...Common.args,
};
