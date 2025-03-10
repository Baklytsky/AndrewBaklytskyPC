import { RaEditorial } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/CMS/Editorial',
  component: RaEditorial,
};

const Template = (args, { argTypes }) => ({
  components: { RaEditorial },
  props: Object.keys(argTypes),
  template: `
    <RaEditorial
      v-bind="$props"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  content: `
    <h1>A classic title as H1</h1>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>

    <h2>A subtitle as H2</h2>

    <h3>Section as H3</h3>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>

    <h4>Bulleted list title as H4</h4>

    <ul>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </ul>

    <h5>A classic title as H5</h5>
  `,
};
