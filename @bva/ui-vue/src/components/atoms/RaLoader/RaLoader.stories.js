import { RaLoader, RaImage } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Loader',
  component: RaLoader,
  decorators: [
    () => ({
      template:
        '<div style="position: relative; min-height: 95vh; padding: 5rem;" class="bg-gray-300"><story /></div>',
    }),
  ],
  argTypes: {
    loading: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaLoader, RaImage },
  props: Object.keys(argTypes),
  template: `<RaLoader v-bind="$props"><RaImage src="/assets/storybook/RaImage/product-216x326.jpg" alt="dress" /></RaLoader>`,
});

export const Common = Template.bind({});
Common.args = {
  loading: true,
};

export const UseOverlay = Template.bind({});
UseOverlay.args = {
  loading: true,
  overlay: true,
  loaderBackground: 'rgba(0,0,0,0.5)',
};

export const WithLoaderSlot = (args, { argTypes }) => ({
  components: { RaLoader, RaImage },
  props: Object.keys(argTypes),
  template: `
  <RaLoader
    v-bind="$props">
    <template #loader>
      loading...
    </template>
  </RaLoader>`,
});
WithLoaderSlot.args = {
  ...UseOverlay.args,
};
