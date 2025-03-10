import { RaTabs, RaTab, RaButton } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Tabs',
  component: RaTabs,
  subcomponents: {
    RaTab,
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaTabs, RaTab },
  props: Object.keys(argTypes),
  data() {
    return {
      tabs: [
        {
          title: 'Description',
          content:
            "The Karissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses. The Karissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses. The Karissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses. The Karissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses. The Karissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses.",
          open: true,
        },
        {
          title: 'Read reviews',
          content:
            "The Larissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses.",
        },
        {
          title: 'Additional Information',
          content:
            "The Marissa V-Neck Tee features a semi-fitted shape that's flattering for every figure. You can hit the gym with confidence while it hugs curves and hides common 'problem' areas. Find stunning women's cocktail dresses and party dresses.",
        },
      ],
    };
  },
  template: `
    <RaTabs v-bind="$props">
      <RaTab 
        v-for="tab in tabs" 
        :key="tab.title" 
        :title="tab.title"
        v-model="tab.open"
      >
        {{tab.content}}
      </RaTab>
    </RaTabs>
  `,
});

export const Common = Template.bind({});
Common.args = {};

export const AlignCenter = Template.bind({});
AlignCenter.args = {
  align: 'center',
};

export const Stacked = Template.bind({});
Stacked.args = {
  layout: 'stack',
};
