import { RaComponentAnchorOverlay, RaRow, RaCol } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/ComponentAnchorOverlay',
  component: RaComponentAnchorOverlay,
};

const Template = (args, { argTypes }) => ({
  components: { RaComponentAnchorOverlay, RaRow, RaCol },
  props: Object.keys(argTypes),
  template: `
    <RaRow :style="{'position': 'relative'}">
      <RaCol size="50%" :style="{'position': 'relative', 'background': '#989F85'}">
        <RaComponentAnchorOverlay v-bind="$props" />

        Add a link prop and this section will become clickable!
      </RaCol>
      <RaCol size="50%" :style="{'background': '#EFD089'}">
        This section is not a link
      </RaCol>
    </RaRow>
  `,
});

export const Common = Template.bind({});
Common.args = {
  link: '#',
};
