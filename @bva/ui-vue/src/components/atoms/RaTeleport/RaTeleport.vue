<template>
  <component :is="isVue2 ? 'RaInternalTeleport' : 'Teleport'" v-bind="$attrs">
    <slot />
  </component>
</template>

<script>
import { isVue2 } from 'vue-demi';
import RaInternalTeleport from './_RaInternalTeleport.vue';

/**
 * Serves as a polyfill for Vue's Teleport functionality.
 * https://vuejs.org/guide/built-ins/teleport.html
 * When in Vue2, uses a custom `RaInternalTeleport` since the built-in isn't supported.
 * Once migration to Vue3 is complete, this component may be removed.
 */
export default {
  name: 'RaTeleport',
  components: {
    RaInternalTeleport,
  },
  inheritAttrs: false,
  setup() {
    return { isVue2 };
  },
};
</script>
