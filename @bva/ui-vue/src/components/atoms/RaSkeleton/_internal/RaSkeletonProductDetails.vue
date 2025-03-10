<template>
  <div class="ra-skeleton__item">
    <div class="ra-skeleton__item ra-skeleton__item-section">
      <RaGrid :gap="'.5rem'" :columns="3">
        <RaGridItem v-for="(bone, index) in repeatBone(3)" :key="index">
          <RaBone :animation="animation" :height="'.5rem'" />
        </RaGridItem>
      </RaGrid>

      <RaBone :animation="animation" :width="0.85" />

      <RaBone :animation="animation" :width="0.75" />

      <RaBone :animation="animation" :width="0.3" :height="'2rem'" />
    </div>

    <RaGrid class="ra-skeleton__item-section" :gap="'.5rem'" :columns="6">
      <RaGridItem v-for="(bone, index) in repeatBone(10)" :key="index">
        <RaBone :animation="animation" :width="1" :height="1" />
      </RaGridItem>
    </RaGrid>

    <RaGrid class="ra-skeleton__item-section" :gap="'.5rem'" :columns="4">
      <RaGridItem :column-span="1">
        <RaBone :animation="animation" :variant="'input'" />
      </RaGridItem>

      <RaGridItem :column-span="3">
        <RaBone :animation="animation" :variant="'button'" :width="1" />
      </RaGridItem>
    </RaGrid>

    <RaBone :animation="animation" :width="0.75" />

    <RaBone :animation="animation" :width="0.85" />

    <RaBone :animation="animation" :width="0.5" />

    <RaBone :animation="animation" :width="1" />
  </div>
</template>

<script>
import RaGrid from '../../RaGrid/RaGrid.vue';
import RaGridItem from '../../RaGrid/_internal/RaGridItem.vue';
import RaBone from './RaBone.vue';

export default {
  name: 'RaSkeletonProductDetails',
  components: {
    RaGrid,
    RaGridItem,
    RaBone,
  },
  props: {
    /**
     * Choose the animation type for this bone.
     * Available options: `linear`, `fade`, `pulsate`, `none`.
     */
    animation: {
      type: String,
      default: 'linear',
      validator: (value) => ['linear', 'fade', 'pulsate', 'none'],
    },
    /**
     * Set how wide the bone will render.
     */
    width: {
      type: [Number, String],
      default: '',
    },
    /**
     * Set how tall the bone will render.
     */
    height: {
      type: [Number, String],
      default: '',
    },
  },
  methods: {
    repeatBone(count) {
      return Array.from(Array(count));
    },
  },
};
</script>
