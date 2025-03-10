import { ref } from 'vue-demi';
import { RaModal, RaRow, RaCol, RaTitle, RaInput, RaButton } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/Modal',
  component: RaModal,
  argTypes: {
    'close:modal': {
      action: 'Close modal clicked',
      table: { category: 'Events' },
    },
  },
  decorators: [
    (story) =>
      `<div>
        <p v-for="item in Array.from(Array(3))">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>

        <story />

        <p v-for="item in Array.from(Array(9))">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>`,
  ],
  parameters: {
    docs: {
      inlineStories: false,
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaModal, RaRow, RaCol, RaTitle, RaInput, RaButton },
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
    handleOpenModal() {
      this.isVisible = true;
    },
  },
  template: `
    <div style="margin-top: 4rem; margin-bottom: 4rem;">
      <RaButton ref="triggerEl" style="margin: auto;" @click="handleOpenModal">
        Click to Open Modal
      </RaButton>

      <RaModal
        :trigger="triggerEl"
        v-bind="$props"
        v-model="isVisible"
        v-on="actions"
        teleportTo="#root"
      >
        <RaTitle :as="5">Modal Title</RaTitle>
        <form action="" style="marginTop: 1rem">
          <RaRow>
            <RaCol :md="12">
              <RaInput type="text" label="First Name" />
            </RaCol>

            <RaCol :md="12">
              <RaInput type="text" label="Last Name" />
            </RaCol>
          </RaRow>

          <RaButton variant="secondary" fullWidth style="marginTop: 2rem">Confirm</RaButton>
        </form>
      </RaModal>
    </div>
  `,
});

export const Common = Template.bind({});
Common.args = {
  title: 'My title',
  visible: true,
};

export const WithoutOverlay = Template.bind({});
WithoutOverlay.args = {
  ...Common.args,
  overlay: false,
};

export const Persistent = Template.bind({});
Persistent.args = {
  ...Common.args,
  persistent: true,
};

export const WithClosingDisabled = Template.bind({});
WithClosingDisabled.args = {
  ...Common.args,
  closeButton: false,
  persistent: true,
  escKeyClose: false,
};

export const FullScreen = Template.bind({});
FullScreen.args = {
  ...Common.args,
  fullScreen: true,
};
