import { RaBullets, RaBullet } from '@bva/ui-vue';

export default {
  title: 'Components/Atoms/Bullets',
  component: RaBullets,
  subcomponents: {
    RaBullet,
  },
  argTypes: {
    total: {
      control: {
        type: 'number',
      },
      table: {
        category: 'Props',
      },
    },
    current: {
      control: 'number',
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaBullets, RaBullet },
  props: Object.keys(argTypes),
  data() {
    return {
      curr: this.current,
    };
  },
  methods: {
    handleClick(value) {
      this.curr = value;
    },
  },
  template: `
  <RaBullets
    :total="total"
    :current="curr"
    @click:bullet="handleClick"
  />`,
});

export const Common = Template.bind({});
Common.args = {
  total: 3,
  current: 1,
};

export const WithActiveSlot = (args, { argTypes }) => ({
  components: { RaBullets, RaBullet },
  props: Object.keys(argTypes),
  data() {
    return {
      curr: this.current,
    };
  },
  template: `
    <RaBullets
      :total="total"
      :current="curr"
      @click:bullet="value => curr = value">
      <template #bullet_active>
        <li style="width: 10px; height: 10px; background-color:#9EE2B0"/>
      </template>
    </RaBullets>`,
});

WithActiveSlot.args = {
  total: 3,
};

export const WithInactiveSlot = (args, { argTypes }) => ({
  components: { RaBullets, RaBullet },
  props: Object.keys(argTypes),
  data() {
    return {
      curr: this.current,
    };
  },
  template: `
    <RaBullets
      :total="total"
      :current="curr">
      <template #bullet_inactive="slotProps">
        <li
          style="width: 10px; height: 10px; background-color:#CCC; transform: rotate(45deg)"
          @click:bullet="() => curr = slotProps.index"
        />
      </template>
    </RaBullets>`,
});

WithInactiveSlot.args = { ...Common.args };
