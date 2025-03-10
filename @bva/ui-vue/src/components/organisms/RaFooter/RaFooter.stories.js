import {
  RaFooter,
  RaFooterColumn,
  RaHeader,
  RaList,
  RaListItem,
  RaImage,
  RaIconButton,
  RaInput,
  RaLink,
} from '@bva/ui-vue';

export default {
  title: 'Components/Organisms/Footer',
  component: RaFooter,
  argTypes: {
    open: {
      control: 'array',
      table: {
        category: 'Props',
      },
    },
    multiple: {
      control: 'boolean',
      table: {
        category: 'Props',
      },
    },
    logo: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    title: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: {
    RaFooter,
    RaFooterColumn,
    RaHeader,
    RaList,
    RaListItem,
    RaImage,
    RaIconButton,
    RaInput,
    RaLink,
  },
  props: Object.keys(argTypes),
  data() {
    return {
      linkColumns: [
        {
          title: 'About us',
          items: ['Who we are', 'Quality in the details', 'Customer Reviews'],
        },
        {
          title: 'Departments',
          items: ['Women fashion', 'Men fashion', 'Kidswear', 'Home'],
        },
      ],
      social: {
        title: 'Social',
        pictures: ['facebook', 'pinterest', 'twitter', 'google', 'youtube'],
      },
    };
  },
  template: `
    <RaFooter
      v-bind="$props"
    >
      <template #communications>
        <div class="flex items-center">
          <RaInput type="text" placeholder="Type your email address" style="width: 242px;" size="lg" />
          <RaIconButton icon="arrow_right" shape="square" variant="tertiary" size="lg" />
        </div>

        <div class="flex">
          <RaImage v-for="picture in social.pictures" :key="picture" :src="'/assets/storybook/RaFooter/'+picture+'.svg'" :alt="picture" style="width: 32px; height: 32px; margin-right: 4px;"/>
        </div>
      </template>

      <RaFooterColumn v-for="column in linkColumns" :key="column.title" :title="column.title">
        <RaList>
          <RaListItem v-for="item in column.items" :key="item">
            <RaLink inheritColor :underline="false">
              {{ item }}
            </RaLink>
          </RaListItem>
        </RaList>
      </RaFooterColumn>
    </RaFooter>`,
});

export const Common = Template.bind({});
Common.args = {
  open: ['About us', 'Help', 'Social'],
  title: 'BedrockUI',
  logo: '/assets/logo.png',
  bottomLinks: [
    {
      label: 'About us',
      link: '#',
    },
    {
      label: 'Help',
      link: '#',
    },
    {
      label: 'More',
      link: '#',
    },
  ],
};
