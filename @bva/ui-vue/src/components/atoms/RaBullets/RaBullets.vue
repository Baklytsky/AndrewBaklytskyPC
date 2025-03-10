<template>
  <ol :class="['ra-bullets', inherited.classes]" :style="[inherited.styles]">
    <template v-for="(_, index) in total">
      <!--@slot `bullet_active` and `bullet_inactive` slots to replace bullets with custom markup.
        Slot Properties: `index` and `current`, `active`.
      -->
      <slot
        :name="`bullet_${isActive(index) ? 'active' : 'inactive'}`"
        v-bind="{ index, current, active: isActive(index) }"
      >
        <RaBullet
          :key="`bullet_${index}`"
          :active="isActive(index)"
          :position="index"
          v-bind="{ ...inherited.attrs, ...inherited.listeners }"
          v-on="$listeners"
          @click="$emit('click:bullet', index)"
        />
      </slot>
    </template>
  </ol>
</template>

<script>
import { useInherited } from '@bva/ui-vue/src/composables';
import RaBullet from './_internal/RaBullet.vue';

export default {
  name: 'RaBullets',
  components: {
    RaBullet,
  },
  inheritAttrs: false,
  props: {
    /**
     * Number of bullets in total (active + inactive)
     */
    total: {
      type: Number,
      default: 0,
    },
    /**
     * Index of the currently active bullet (0-indexed)
     */
    current: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const isActive = (index) => {
      return props.current === index;
    };

    return {
      inherited: useInherited(),
      isActive,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaBullets.css';
</style>
