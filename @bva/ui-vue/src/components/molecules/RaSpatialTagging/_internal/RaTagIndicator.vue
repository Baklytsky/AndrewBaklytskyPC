<template>
  <div class="ra-spatial-tagging__tag ra-spatial-overlay">
    <slot>
      <RaButton
        raw
        :class="[
          'ra-tag-indicator',
          buttonModifierClass,
          {
            'ra-tag-indicator--active': selected,
          },
        ]"
        @click="$emit('click:tag')"
      >
        <div :class="['ra-tag-indicator__inner', innerModifierClass]"></div>
      </RaButton>
    </slot>
  </div>
</template>

<script>
import { computed } from 'vue-demi';
import { formatModifier } from '@bva/ui-shared/helpers';
import RaButton from '../../../atoms/RaButton/RaButton.vue';

/**
 * Tag or hotspot over tagging image map
 */
export default {
  components: {
    RaButton,
  },
  props: {
    /**
     * Style of the tag
     */
    variant: {
      type: String,
      default: '',
    },
    /**
     * Has the tag been selected and associated product information is being displayed
     */
    selected: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const buttonModifierClass = computed(() =>
      formatModifier('ra-tag-indicator', props.variant)
    );
    const innerModifierClass = computed(() =>
      formatModifier('ra-tag-indicator__inner', props.variant)
    );

    return {
      buttonModifierClass,
      innerModifierClass,
    };
  },
};
</script>
