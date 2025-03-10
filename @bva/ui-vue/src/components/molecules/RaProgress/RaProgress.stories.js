import RaProgress from './RaProgress.vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';

export default {
  title: 'Components/Molecules/Progress',
  component: RaProgress,
  argTypes: {
    type: {
      control: {
        type: 'select',
        options: [''].concat(UIColorNames),
      },
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaProgress },
  props: Object.keys(argTypes),
  template: `
    <RaProgress
      v-bind="$props"
    />`,
});

export const Common = Template.bind({});
Common.args = {
  progress: 1,
};

export const WithStaticLabel = Template.bind({});
WithStaticLabel.args = {
  ...Common.args,
  label: 'A progress bar. This label will not change.',
};

export const WithDynamicLabel = (args, { argTypes }) => ({
  components: { RaProgress },
  props: Object.keys(argTypes),
  template: `
    <RaProgress
      v-bind="$props"
    >
      <template #progress-label="{ progress, target, progressPercent, reachedTarget }">
        <template v-if="reachedTarget">
          Completion is now at {{ progressPercent }}
        </template>

        <template v-else>
          {{ progress }} out of {{ target }} completed!
        </template>
      </template>
    </RaProgress>
    `,
});

export const WithMaxWidth = Template.bind({});
WithMaxWidth.args = {
  ...Common.args,
  label: 'Bar grows to 50% of the available space.',
  maxWidth: '50%',
};

export const WithCustomHeight = Template.bind({});
WithCustomHeight.args = {
  ...Common.args,
  label: 'Bar is taller than usual?',
  barHeight: '1rem',
};
