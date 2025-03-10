<template>
  <div class="ra-skeleton__item">
    <RaBone
      :variant="'image'"
      :animation="animation"
      :width="width"
      :height="height"
    />

    <RaBone :animation="animation" :width="0.85" />

    <RaBone :animation="animation" :width="0.5" />
  </div>
</template>

<script>
import RaBone from './RaBone.vue';

export default {
  name: 'RaSkeletonProductTile',
  components: {
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
};
</script>
