import { RaAccordion, RaAccordionItem } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Accordion',
  component: RaAccordion,
  subcomponents: {
    RaAccordionItem,
  },
  argTypes: {
    openList: {
      control: 'array',
    },
    multiple: {
      control: 'boolean',
    },
    variant: {
      control: 'text',
    },
    size: {
      control: {
        type: 'select',
      },
      options: ['', 'base', 'lg'],
    },
    toggleIcons: {
      control: 'boolean',
    },
    columns: {
      control: 'array',
    },
    gap: {
      control: 'text',
    },
    transition: {
      control: 'text',
    },
    logParentToggle: {
      action: 'Parent: One or more items toggled',
      table: { category: 'Events' },
    },
    logItemToggle: {
      action: 'Child: Item toggled',
      table: { category: 'Events' },
    },
  },
};

const accordions = [
  {
    title: 'Clothing',
    subtitle: 'This is a subtitle',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec nisl vel felis ullamcorper feugiat. Ut vel tellus in ante placerat sollicitudin. Aliquam nibh massa, convallis molestie nisl nec, aliquet ultricies nulla. Praesent dignissim leo sit amet augue ultricies.',
    open: true,
  },
  {
    title: 'Accessories',
    subtitle: 'Another subtitle',
    content:
      'Aliquam nibh massa, convallis molestie nisl nec, aliquet ultricies nulla. Praesent dignissim leo sit amet augue ultricies.',
    open: false,
  },
  {
    title: 'Shoes',
    content:
      'Example with no subtitle. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec nisl vel felis ullamcorper feugiat. Ut vel tellus in ante placerat sollicitudin.',
    open: false,
  },
];

const Template = (args, { argTypes }) => ({
  components: { RaAccordion, RaAccordionItem },
  props: Object.keys(argTypes),
  data() {
    return {
      accordions,
    };
  },
  template: `
    <RaAccordion 
      :multiple="multiple"
      :columns="columns"
      :gap="gap"
      @toggle="logParentToggle"
    >
      <RaAccordionItem
        v-for="(accordion, index) in accordions" 
        :key="accordion.title"
        :index="index"
        :title="accordion.title"
        :toggleIcons="toggleIcons"
        :contentTitle="accordion.subtitle"
        :size="size"
        :variant="variant"
        :transition="transition"
        v-model="accordion.open"
        @toggle="logItemToggle"
      >
        {{ accordion.content }}
      </RaAccordionItem>
    </RaAccordion>
  `,
});

export const Common = Template.bind({});
Common.args = {
  multiple: false,
};

export const ToggleMultiple = Template.bind({});
ToggleMultiple.args = {
  multiple: true,
  openList: [0, 2],
};

export const Boxed = Template.bind({});
Boxed.args = {
  columns: [1, 3],
  gap: '1rem',
  variant: 'box',
};

export const NoToggleIcons = Template.bind({});
NoToggleIcons.args = {
  ...Common.args,
  toggleIcons: false,
};
