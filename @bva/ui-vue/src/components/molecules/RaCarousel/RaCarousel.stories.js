import { RaCarousel, RaCarouselItem } from '@bva/ui-vue';
import * as TextArgsTypes from '@bva/ui-shared/storybook/argTypes/common-text';
import * as StylesArgsTypes from '@bva/ui-shared/storybook/argTypes/common-styles';
import * as ContainerArgsTypes from '@bva/ui-shared/storybook/argTypes/container-layout';

export default {
  title: 'Components/Molecules/Carousel',
  component: RaCarousel,
  subcomponents: {
    RaCarouselItem,
  },
  argTypes: {
    ...TextArgsTypes,
    ...StylesArgsTypes,
    ...ContainerArgsTypes,
    settings: {
      control: 'object',
    },
    direction: {
      control: {
        type: 'select',
      },
      options: ['horizontal', 'vertical'],
    },
  },
};

const Template = (args, { argTypes }) => ({
  components: { RaCarousel, RaCarouselItem },
  props: Object.keys(argTypes),
  template: `
  <RaCarousel
    v-bind="$props"
    style="--vertical-carousel-height: 300px;"
  >
    <RaCarouselItem v-for="(item, i) in 12" :key="i">
      <div class="flex items-center justify-center bg-danger text-white font-size-xl" style="height: 300px;">
        {{item}}
      </div>
    </RaCarouselItem>
  </RaCarousel>`,
});

export const Common = Template.bind({});
Common.args = {};

export const Vertical = Template.bind({});
Vertical.args = {
  ...Common.args,
  settings: {
    direction: 'vertical',
    spaceBetween: 10,
  },
};

export const MultiplePerView = Template.bind({});
MultiplePerView.args = {
  title: 'A Tiles Carousel',
  description: 'Optional description for the carousel',
  settings: {
    slidesPerView: 2,
    spaceBetween: 16,
    navigation: {
      location: 'auto',
    },
    breakpoints: {
      768: {
        slidesPerView: 4,
        navigation: {
          location: 'top-right',
        },
      },
    },
  },
};

export const UseDirectionSlots = (args, { argTypes }) => ({
  components: { RaCarousel, RaCarouselItem },
  props: Object.keys(argTypes),
  template: `
  <RaCarousel
    v-bind="$props"
  >
    <template #prev="{go}">
      <button @click="go">PREV</button>
    </template>

    <template #next="{go}">
      <button @click="go">NEXT</button>
    </template>

    <RaCarouselItem v-for="(item, i) in 12" :key="i">
      <div class="flex items-center justify-center bg-danger text-white font-size-xl" style="height: 300px;">
        {{item}}
      </div>
    </RaCarouselItem>
  </RaCarousel>`,
});
