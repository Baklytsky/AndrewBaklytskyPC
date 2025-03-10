<template>
  <div>
    <RaTagIndicator
      ref="tagRef"
      :style="positionStyles"
      :variant="tagVariant"
      :selected="active"
      @click:tag="$emit('click:tag')"
    >
      <slot name="tags" />
    </RaTagIndicator>

    <RaSpatialPopup
      v-if="popup"
      :config="config"
      :active="active"
      :tag-dimensions="tagDimensions"
      v-bind="$attrs"
      @close:popup="$emit('close:popup')"
    >
      <template v-for="(slotIndex, slotName) in slots" #[slotName]="data">
        <slot :name="slotName" v-bind="data"></slot>
      </template>
    </RaSpatialPopup>
  </div>
</template>

<script>
import { ref, computed, inject } from 'vue-demi';

import RaTagIndicator from './RaTagIndicator.vue';
import RaSpatialPopup from './RaSpatialPopup.vue';

import { getTagDimensions } from '@bva/ui-shared/helpers/spatial-tagging';

export default {
  name: 'RaSpatialGroup',
  components: {
    RaTagIndicator,
    RaSpatialPopup,
  },
  props: {
    /**
     * A spatial tag configuration object which should include positioning and (product) data.
     */
    config: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Controls the tag's active state.
     */
    active: {
      type: Boolean,
      default: false,
    },
    /**
     * Enable displaying the tag popup.
     */
    popup: {
      type: Boolean,
      default: false,
    },
    /**
     * Style for the tags / hotspots - used by RaTagIndicator
     */
    tagVariant: {
      type: String,
      default: 'primary',
    },
  },
  setup(props, { slots }) {
    const tagRef = ref(null);

    const tagDimensions = computed(() => {
      return getTagDimensions(tagRef?.value?.$el);
    });

    const positionStyles = {
      top: `${props.config?.position?.y}%`,
      left: `${props.config?.position?.x}%`,
    };

    return {
      slots,
      tagRef,
      tagDimensions,
      positionStyles,
    };
  },
};
</script>
