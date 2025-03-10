import { RaTextarea } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Input Elements/Textarea',
  component: RaTextarea,
  argTypes: {
    value: {
      control: 'text',
      defaultValue: '',
      table: {
        category: 'Props',
      },
    },
    label: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    name: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    cols: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    rows: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
    minlength: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    maxlength: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    wrap: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    errorMessage: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    message: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    valid: {
      control: 'boolean',
      defaultValue: true,
      table: {
        category: 'Props',
      },
    },
    required: {
      control: 'boolean',
      defaultValue: false,
      table: {
        category: 'Props',
      },
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
      table: {
        category: 'Props',
      },
    },
    placeholder: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    buttonLabel: {
      control: 'text',
      table: {
        category: 'Props',
      },
    },
    change: { action: 'Text area changed', table: { category: 'Events' } },
    'click:button': { action: 'Action clicked', table: { category: 'Events' } },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaTextarea },
  props: getProps(argTypes),
  setup() {
    return {
      actions: getActions(args),
    };
  },
  data() {
    return {
      textArea: this.value,
    };
  },
  template: `
  <RaTextarea
    v-model="textArea"
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  label: 'First name',
  name: 'first-name',
  wrap: 'soft',
  errorMessage: 'Required',
};

export const WithButton = Template.bind({});
WithButton.args = {
  ...Common.args,
  buttonLabel: 'Confirm',
};
