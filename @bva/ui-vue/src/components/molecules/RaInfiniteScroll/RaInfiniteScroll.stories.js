import RaInfiniteScroll from './RaInfiniteScroll.vue';
import { UIColorNames } from '@bva/ui-shared/tokens/colors';

export default {
  title: 'Components/Molecules/InfiniteScroll',
  component: RaInfiniteScroll,
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
    align: {
      control: {
        type: 'select',
        options: ['center', 'left', 'right'],
      },
      table: {
        category: 'Props',
      },
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaInfiniteScroll },
  props: Object.keys(argTypes),
  template: `
    <RaInfiniteScroll
      v-bind="$props"
    />`,
});

export const Common = Template.bind({});
Common.args = {};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
};

export const WithScroll = (args, { argTypes }) => ({
  components: { RaInfiniteScroll },
  props: Object.keys(argTypes),
  computed: {
    reachedMax() {
      return this.trackedCount >= this.totalCount;
    },
  },
  methods: {
    handleIntersection(entry, stop) {
      this.isLoading = true;

      setTimeout(() => {
        this.isLoading = false;
        this.trackedCount++;

        //Disable intersection tracking once max has been reached.
        if (this.reachedMax) {
          stop();
        }
      }, 2000);
    },
  },
  data() {
    return {
      isLoading: false,
      trackedCount: 2,
    };
  },
  template: `
    <div>
      <p>↓ ↓ ↓ SCROLL DOWN ↓ ↓ ↓</p>
      <p>(For a more accurate experience, open this canvas in a new tab)</p>

      <div style="margin: 100vh 0; padding: ${args.offset}px 0; border: dashed 1px red;">
        <RaInfiniteScroll
          v-bind="$props"
          :currentCount="trackedCount"
          :loading="isLoading"
          @intersected="handleIntersection"
        >
          <template #progress-description v-if="reachedMax">
            No more items to load!
          </template>
        </RaInfiniteScroll>
      </div>
    </div>`,
});
WithScroll.args = {
  offset: 150,
  totalCount: 5,
};
