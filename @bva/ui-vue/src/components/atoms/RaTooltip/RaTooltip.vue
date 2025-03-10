<template>
  <div
    v-click-outside="checkPersistence"
    :class="[
      'ra-tooltip-container',
      {
        'ra-tooltip-container--filled': isWrappingContent,
        'ra-tooltip-container--empty': !isWrappingContent,
      },
      inherited.classes,
    ]"
    :style="[inherited.styles]"
  >
    <!--@slot Use the default slot to wrap the content this tooltip pertains to.-->
    <slot />

    <transition :name="effectiveTransition">
      <div
        v-if="visible"
        :class="['ra-tooltip', modifierClass(hPos, vPos)]"
        :style="[
          backgroundVariables,
          foregroundVariables,
          {
            '--tooltip-width': width,
          },
        ]"
        v-bind="{ ...inherited.attrs, ...inherited.listeners }"
        @mouseenter="$emit('enter:tooltip')"
        @mouseleave="$emit('leave:tooltip')"
        v-on="$listeners"
      >
        <!--@slot Use this slot to place content inside the tooltip-->
        <slot name="description">
          {{ description }}
        </slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue-demi';

import { formatModifier } from '@bva/ui-shared/helpers';
import { useInherited, useHasSlot } from '@bva/ui-vue/src/composables';
import { clickOutside } from '@bva/ui-vue/src/directives';

import StylesMixins from '@bva/ui-vue/src/mixins/common-styles';

export default {
  name: 'RaTooltip',
  directives: {
    clickOutside,
  },
  mixins: [StylesMixins],
  inheritAttrs: false,
  model: {
    prop: 'visible',
    event: 'dismiss:tooltip',
  },
  props: {
    /**
     * Control tooltip's visibility.
     * Can be handled as a model.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Use to display simple strings within a tooltip.
     * For more complex copy, or to add markup, use the `#description` slot.
     */
    description: {
      type: String,
      default: '',
    },
    /**
     * The vertical position for the tooltip.
     */
    vPos: {
      type: String,
      default: 'top',
      validator: (value) => ['top', 'middle', 'bottom'].includes(value),
    },
    /**
     * The horizontal position for the tooltip.
     */
    hPos: {
      type: String,
      default: 'center',
      validator: (value) => ['left', 'center', 'right'].includes(value),
    },
    /**
     * Specify how wide should the tooltip be.
     */
    width: {
      type: String,
      default: null,
    },
    /**
     * Pass a custom transition for the tooltip reveal/dismiss animation.
     */
    transition: {
      type: String,
      default: '',
    },
    /**
     * When `true`, prevents tooltip from being dismissed after clicking outside of its container.
     */
    persistent: {
      type: Boolean,
      default: false,
    },
    /**
     * Automatically dismiss the tooltip after a given `timeout`.
     */
    timeout: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const tooltipTimeout = ref(null);

    //Computed
    const isVisible = computed(() => props.visible);

    const transitionDirection = computed(() => {
      switch (props.vPos) {
        case 'top':
          return 'bottom';
        case 'bottom':
          return 'top';
        case 'middle':
          if (props.hPos === 'center') {
            return props.hPos;
          }

          return props.hPos === 'left' ? 'right' : 'left';
        default:
          return 'bottom';
      }
    });

    const effectiveTransition = computed(() => {
      if (props.transition) {
        return props.transition;
      }

      return `ra-tooltip-motion-${transitionDirection.value}`;
    });

    const isWrappingContent = useHasSlot();

    //Methods
    const modifierClass = formatModifier.bind(this, 'ra-tooltip');

    const dismiss = () => {
      emit('dismiss:tooltip', false);
    };

    const checkPersistence = () => {
      return props.persistent ? false : dismiss();
    };

    //Watchers
    watch(isVisible, (newVal) => {
      clearTimeout(tooltipTimeout.value);

      if (newVal && props.timeout > 0) {
        tooltipTimeout.value = setTimeout(dismiss, props.timeout);
      }
    });

    return {
      //Computed
      inherited: useInherited(),
      transitionDirection,
      effectiveTransition,
      isWrappingContent,
      //Methods
      modifierClass,
      dismiss,
      checkPersistence,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaTooltip.css';
</style>
