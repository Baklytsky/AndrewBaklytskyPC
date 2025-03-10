import { RaRadio } from '@bva/ui-vue';
import { getProps, getActions } from '@bva/ui-shared/storybook/helpers';

export default {
  title: 'Components/Atoms/Input Elements/Choice/Radio',
  component: RaRadio,
  argTypes: {
    change: {
      action: 'Toggle selection: change event',
    },
    input: {
      action: 'Toggle selection: input event',
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaRadio },
  props: getProps(argTypes),
  data() {
    return {
      isChecked: this.checked,
    };
  },
  watch: {
    checked(value) {
      this.isChecked = value;
    },
  },
  setup() {
    return {
      actions: getActions(args),
    };
  },
  template: `
  <RaRadio 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  label: 'Pickup in the store',
  name: 'Shipping',
  value: 'store',
  checked: false,
};

export const Checked = Template.bind({});
Checked.args = {
  ...Common.args,
  checked: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Common.args,
  disabled: true,
};

export const UseLabelSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaRadio 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  >
    <template #label="{label}">
      <div class="ra-choice__label">
        {{ label }}
        <br />

        <p class="text-gray-500">Delivery from 4-6 business days</p>

        <p class="font-size-sm">
          Novelty! From now on you have the option of picking up an order in the selected InPack parceler.
          <br />
          Just remember that in the case of orders paid on delivery, only the card payment will be accepted.
        </p>
      </div>
    </template>
  </RaRadio>`,
});
UseLabelSlot.args = {
  ...Common.args,
  label: 'Pickup in the store',
};

export const UseCheckmarkSlot = (args, { argTypes }) => ({
  ...Template(args, { argTypes }),
  template: `
  <RaRadio 
    v-model="isChecked"
    v-bind="$props"
    v-on="actions"
  >
    <template #checkmark="{checked, disabled}">
      <div v-if="checked">😀</div>
      <div v-else>😔</div>
    </template>
  </RaRadio>`,
});
UseCheckmarkSlot.args = { ...Common.args };
