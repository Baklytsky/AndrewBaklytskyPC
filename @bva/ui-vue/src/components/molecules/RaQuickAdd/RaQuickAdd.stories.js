import { ref, watch } from 'vue-demi';
import { RaQuickAdd, RaImage } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Molecules/QuickAdd',
  component: RaQuickAdd,
  argTypes: {
    'change:option': {
      action: 'QuickAdd clicked',
      table: { category: 'Events' },
    },
    'close:quickadd': {
      action: 'QuickAdd closed',
      table: { category: 'Events' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaQuickAdd, RaImage },
  props: getProps(argTypes),
  setup(props) {
    const isVisible = ref(props.visible);
    const loading = ref(false);
    const buttonLabel = ref(undefined);
    const icon = ref(undefined);

    //Handlers
    const handleATC = () => {
      loading.value = true;

      setTimeout(() => (loading.value = false), 1500);
    };

    const handleDoneLoading = () => {
      icon.value = 'check';
      buttonLabel.value = 'Added!';
    };

    const handleDoneLoadingTimeout = () => {
      icon.value = undefined;
      buttonLabel.value = undefined;
    };

    const handleClose = () => {
      isVisible.value = false;
    };

    watch(
      () => props.visible,
      (newValue) => (isVisible.value = newValue)
    );

    return {
      isVisible,
      loading,
      icon,
      buttonLabel,
      //Handlers
      handleATC,
      handleDoneLoading,
      handleDoneLoadingTimeout,
      handleClose,
      actions: getActions(args),
    };
  },
  template: `
    <div class="max-width--tiny" style="position: relative;">
      <RaImage
        src="/assets/storybook/RaImage/product-216x326.jpg"
        :width="1"
        :height="1"
        useAspectRatio
        @click="() => isVisible = true"
      />

      <RaQuickAdd
        :visible="isVisible"
        :addToCartProps="{
          loading,
          icon,
          buttonLabel,
        }"
        :addToCartEvents="{
          'click': handleATC,
          'done:loading': handleDoneLoading,
          'done:loading-timeout': handleDoneLoadingTimeout,
        }"
        @close:quickadd="() => isVisible = false"
        v-bind="$props"
        v-on="actions"
      />
    </div>
  `,
});

export const Common = Template.bind({});
Common.args = {
  visible: true,
  options: {
    Color: {
      values: [
        { label: 'Sand', value: 'sand', color: '#EDCBB9' },
        { label: 'Mint', value: 'mint', color: '#ABD9D8' },
        {
          label: 'Vivid rose',
          value: 'vivid rose',
          color: '#DB5593',
          disabled: true,
        },
        { label: 'Peach', value: 'peach', color: '#F59F93' },
        { label: 'Mustard', value: 'peach-2', color: '#c59333' },
        { label: 'Sage', value: 'peach-3', color: '#c0c6b0' },
      ],
    },
    Size: {
      values: [
        { label: 'Asphalt', value: 'asphalt', color: '#c7c0b4' },
        { label: 'Forest', value: 'forest', color: '#537758' },
        { label: 'Stone', value: 'stone', color: '#86847d' },
        { label: 'Dark', value: 'dark', color: '#000000' },
        {
          label: 'Citrus',
          value: 'citrus',
          color: '#FFEE97',
        },
      ],
    },
  },
  selected: {
    Color: 'peach',
    Size: 'asphalt',
  },
  optionsProps: {
    Color: {
      pickerType: 'swatch',
      itemsPerRow: 8,
    },
    Size: {
      label: 'Select a size',
      labelSelected: 'Size selected:',
      itemsPerRow: 2,
      size: {
        height: 'var(--spacing-xl)',
      },
      limit: 4,
    },
  },
  limit: 8,
  closeButton: false,
  persistent: true,
};

export const Overlay = Template.bind({});
Overlay.args = {
  ...Common.args,
  variant: 'overlay',
  closeButton: true,
  persistent: false,
};

export const Modal = Template.bind({});
Modal.args = {
  ...Overlay.args,
  variant: 'modal',
  modalProps: {
    teleportTo: '#root',
  },
};

export const Dynamic = Template.bind({});
Dynamic.args = {
  ...Overlay.args,
  variant: {
    xs: 'modal',
    md: 'inline',
    lg: 'overlay',
  },
};
