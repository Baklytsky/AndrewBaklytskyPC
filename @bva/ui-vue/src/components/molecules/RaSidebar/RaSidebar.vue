<template>
  <RaTeleport :disabled="!teleport" :to="teleportTo">
    <div
      v-if="renderComponent"
      :class="[
        'ra-sidebar',
        modifierClass(position),
        {
          'ra-sidebar--animating': !visible,
        },
      ]"
    >
      <RaOverlay
        :class="overlayClass"
        :visible="overlayVisible"
        :background="overlayBackground"
        :transition="overlayTransition"
        :transition-props="{
          appear: true,
        }"
        v-bind="{ ...overlayProps }"
      />

      <transition
        appear
        :name="effectiveTransition"
        @before-enter="handleBeforeEnter"
        @after-leave="handleAfterLeave"
      >
        <aside
          v-if="visible"
          ref="sidebar"
          v-focus-trap
          v-click-outside="checkPersistence"
          :class="['ra-sidebar__aside', asideClass]"
        >
          <!--@slot Place content inside the sidebar's top area.-->
          <slot name="top">
            <RaBar
              :title="title"
              :title-align="titleAlign"
              :close="closeButton"
              :close-icon="closeIcon"
              :close-props="closeProps"
              :class="['ra-sidebar__top', topClass]"
              v-bind="{ ...barProps }"
              @click:close="handleClose"
            />
          </slot>

          <!--@slot Place content after the sidebar's top area.-->
          <slot name="top-after" />

          <div
            ref="sidebarContent"
            :class="['ra-sidebar__content', contentClass]"
          >
            <!--@slot Place content inside the sidebar's content area.-->
            <slot />
          </div>

          <!--@slot Place content after the sidebar's content area.-->
          <slot name="content-after" />

          <div v-if="hasBottom" :class="['ra-sidebar__bottom', bottomClass]">
            <!--@slot Place content inside the sidebar's bottom area.-->
            <slot name="bottom" />
          </div>

          <!--@slot Place content after the sidebar's bottom area.-->
          <slot name="bottom-after" />
        </aside>
      </transition>
    </div>
  </RaTeleport>
</template>
<script>
import { focusTrap, clickOutside } from '@bva/ui-vue/src/directives';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { ref, watch, computed, nextTick } from 'vue-demi';
import RaBar from '../../molecules/RaBar/RaBar.vue';
import RaOverlay from '../../atoms/RaOverlay/RaOverlay.vue';
import RaTeleport from '../../atoms/RaTeleport/RaTeleport.vue';
import TeleportMixins from '@bva/ui-vue/src/mixins/teleport';
import { setFocus, setFirstFocus } from '@bva/ui-shared/helpers/focus-trap';

export default {
  name: 'RaSidebar',
  directives: { focusTrap, clickOutside },
  components: {
    RaBar,
    RaOverlay,
    RaTeleport,
  },
  mixins: [TeleportMixins],
  model: {
    prop: 'visible',
    event: 'close',
  },
  props: {
    /**
     * Toggle visibility for the sidebar.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Control the position where the sidebar appears and animates from.
     */
    position: {
      type: String,
      default: 'left',
      validate(value) {
        return ['left', 'right'].includes(value);
      },
    },
    /**
     * If true, clicking outside the sidebar will not dismiss it.
     */
    persistent: {
      type: Boolean,
      default: false,
    },
    /**
     * The triggering element for the sidebar.
     * Pass a `ref` to focus on this element once the sidebar closes.
     */
    trigger: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * The sidebar's title.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Set a custom alignment for the sidebar's title.
     */
    titleAlign: {
      type: String,
      default: '',
    },
    /**
     * Toggle visibility of the bar's close button.
     */
    closeButton: {
      type: Boolean,
      default: true,
    },
    /**
     * Choose the "close" icon to display on the bar.
     */
    closeIcon: {
      type: String,
      default: 'cross',
    },
    /**
     * Pass custom props directly into the "close" `RaButton` component.
     */
    closeProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Pass custom props directly into the `RaBar` component.
     */
    barProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Transition to use for the enter/leave animation on the component.
     */
    transition: {
      type: String,
      default: null,
    },
    /**
     * Whether or not to use an overlay when the sidebar is visibile.
     */
    overlay: {
      type: Boolean,
      default: true,
    },
    /**
     * Pass custom props directly into the `RaOverlay` component.
     */
    overlayProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Add a custom background for the backdrop overlay.
     */
    overlayBackground: {
      type: String,
      default: '',
    },
    /**
     * Add custom classes on the `overlay` node of this component.
     */
    overlayClass: {
      type: String,
      default: '',
    },
    /**
     * Transition to use for the enter/leave animation for the component's overlay.
     */
    overlayTransition: {
      type: String,
      default: 'ra-fade',
    },
    /**
     * Add custom classes on the `aside` node of this component.
     */
    asideClass: {
      type: String,
      default: '',
    },
    /**
     * Add custom classes on the `top` node of this component.
     */
    topClass: {
      type: String,
      default: '',
    },
    /**
     * Add custom classes on the `content` node of this component.
     */
    contentClass: {
      type: String,
      default: '',
    },
    /**
     * Add custom classes on the `bottom` node of this component.
     */
    bottomClass: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit, slots }) {
    const sidebar = ref(null);
    const sidebarContent = ref(null);
    const sidebarVisible = ref(props.visible);
    // Tracks actual visibility controlled internally or extenally.
    // i.e. `props.visible` is externally managed while `sidebarVisible` is internal.
    const renderComponent = computed(
      () => props.visible || sidebarVisible.value
    );

    const overlayVisible = computed(() => {
      return props.visible && props.overlay;
    });

    const effectiveTransition = computed(() => {
      return props.transition || 'ra-slide-' + props.position;
    });

    const hasBottom = computed(() => {
      return slots.hasOwnProperty('bottom');
    });

    // Methods
    const handleClose = () => {
      setFocus(props.trigger?.$el);

      emit('close');
    };

    const handleKeyDown = (evt) => {
      if (evt.keyCode === 27) {
        handleClose();
      }
    };

    const handleBeforeEnter = () => {
      sidebarVisible.value = true;

      nextTick(() => {
        setFirstFocus(sidebar.value);

        disableBodyScroll(sidebarContent.value);
      });

      document.addEventListener('keydown', handleKeyDown);
    };

    const handleAfterLeave = () => {
      sidebarVisible.value = false;

      clearAllBodyScrollLocks();

      document.removeEventListener('keydown', handleKeyDown);
    };

    const checkPersistence = () => {
      if (!props.persistent) {
        handleClose();
      }
    };

    const modifierClass = (modifier, prefix) => {
      return modifier
        ? `ra-sidebar--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    };

    return {
      sidebar,
      sidebarContent,
      effectiveTransition,
      hasBottom,
      overlayVisible,
      renderComponent,
      // showSidebar,
      // Methods
      handleClose,
      checkPersistence,
      handleKeyDown,
      handleBeforeEnter,
      handleAfterLeave,
      modifierClass,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaSidebar.css';
</style>
