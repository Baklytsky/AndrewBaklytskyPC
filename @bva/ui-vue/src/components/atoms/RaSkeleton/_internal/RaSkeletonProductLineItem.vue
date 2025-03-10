<template>
  <RaGrid class="ra-skeleton__item" :columns="5" :rows="6">
    <RaGridItem :row-span="5" :gap="['.5rem', '1rem']">
      <RaBone variant="image" :height="1" :animation="animation" />
    </RaGridItem>
    <RaGridItem :row-span="6" :column-span="3">
      <RaGrid :gap="['.5rem', '1rem']">
        <RaBone variant="paragraph" :width="0.6" :animation="animation" />
        <RaBone variant="paragraph" :width="0.4" :animation="animation" />
        <RaBone variant="paragraph" :width="0.4" :animation="animation" />
        <RaBone variant="paragraph" :width="0.4" :animation="animation" />
        <RaBone variant="button" :width="0.6" :animation="animation" />
      </RaGrid>
    </RaGridItem>
    <RaGridItem :row-span="6" :column-span="1">
      <RaGrid :gap="['.5rem', '1rem']">
        <RaGridItem>
          <RaGrid :columns="3" :rows="1">
            <RaGridItem :column-span="1" />
            <RaGridItem :column-span="2">
              <RaBone variant="button" :width="1" :animation="animation" />
            </RaGridItem>
          </RaGrid>
        </RaGridItem>
        <RaGridItem :style="{ '--br-grid-row': '4' }" />
        <RaGridItem>
          <RaBone variant="paragraph" :width="1" :animation="animation" />
        </RaGridItem>
      </RaGrid>
    </RaGridItem>
  </RaGrid>
</template>

<script>
import RaBone from './RaBone.vue';
import RaGrid from '../../RaGrid/RaGrid.vue';
import RaGridItem from '../../RaGrid/_internal/RaGridItem.vue';

export default {
  name: 'RaSkeleteonProductLineItem',
  components: {
    RaBone,
    RaGrid,
    RaGridItem,
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
  },
};
</script>
