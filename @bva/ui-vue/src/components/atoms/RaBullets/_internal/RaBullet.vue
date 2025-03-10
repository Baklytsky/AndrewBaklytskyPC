<template>
  <li>
    <RaButton
      :raw="true"
      :class="[
        'ra-bullet',
        {
          'ra-bullet--active': active,
        },
      ]"
      :data-testid="position + 1"
      :aria-label="bulletLabel"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </li>
</template>

<script>
import { computed } from 'vue-demi';
import RaButton from '../../RaButton/RaButton.vue';

export default {
  name: 'RaBullet',
  components: {
    RaButton,
  },
  inheritAttrs: false,
  props: {
    /**
     * The position of this bullet within the rest of the bullet list.
     */
    position: {
      type: Number,
      default: 0,
    },
    /**
     * Whether or not this bullet should display as "active".
     */
    active: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const bulletLabel = computed(() => {
      return props.active
        ? 'Current slide'
        : `Go to slide ${props.position + 1}`;
    });

    return {};
  },
};
</script>
