import { RaGrid, RaGridItem, RaContentTile } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Grid',
  component: RaGrid,
  subcomponents: { RaGridItem },
  argTypes: {
    gap: {
      control: {
        type: 'text',
      },
      table: {
        category: 'Props',
      },
    },
    columns: {
      control: {
        type: 'array',
      },
      table: {
        category: 'Props',
      },
      defaultValue: {
        base: 1,
        md: 2,
        lg: 3,
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaGrid, RaGridItem, RaContentTile },
  props: Object.keys(argTypes),
  template: `
    <RaGrid v-bind="$props">
      <RaGridItem>
        <RaContentTile v-bind="$props.banners[0]" />
      </RaGridItem>

      <RaGridItem>
        <RaContentTile v-bind="$props.banners[1]" />
      </RaGridItem>

      <RaGridItem :columnSpan="[1, 2, 1]">
        <RaGrid :columns="[2, 2, 1]" :inheritGap="true">
          <RaGridItem>
            <RaContentTile v-bind="$props.banners[2]" />
          </RaGridItem>

          <RaGridItem>
            <RaContentTile v-bind="$props.banners[3]" />
          </RaGridItem>
        </RaGrid>
      </RaGridItem>
    </RaGrid>`,
});

export const Common = Template.bind({});
Common.args = {
  banners: [
    {
      subtitle: 'Dresses',
      title: 'Cocktail & Party',
      description:
        "Find stunning women's cocktail dresses and party dresses. Stand out in lace and metallic cocktail dresses from all your favorite brands.",
      imageSrc: '/assets/storybook/Home/bannerF.jpg',
      detailsLocation: 'overlay',
      aspectRatio: 'fill-space',
      verticalAlign: 'middle',
      horizontalAlign: 'center',
    },
    {
      subtitle: 'Dresses',
      title: 'Linen Dresses',
      description:
        "Find stunning women's cocktail dresses and party dresses. Stand out in lace and metallic cocktail dresses from all your favorite brands.",
      imageSrc: '/assets/storybook/Home/bannerE.jpg',
      detailsLocation: 'overlay',
      aspectRatio: 'fill-space',
      verticalAlign: 'middle',
      horizontalAlign: 'center',
    },
    {
      subtitle: 'T-Shirts',
      title: 'The Office Life',
      imageSrc: '/assets/storybook/Home/bannerC.jpg',
      detailsLocation: 'overlay',
      aspectRatio: 'fill-space',
    },
    {
      subtitle: 'Summer Sandals',
      title: 'Eco Sandals',
      imageSrc: '/assets/storybook/Home/bannerG.jpg',
      detailsLocation: 'overlay',
      aspectRatio: 'fill-space',
    },
  ],
};
