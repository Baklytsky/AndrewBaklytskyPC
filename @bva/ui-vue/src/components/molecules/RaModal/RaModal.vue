<template>
  <RaTeleport :disabled="!teleport" :to="teleportTo">
    <transition
      :name="transition"
      @before-enter="$emit('open:modal')"
      @after-enter="handleAfterEnter"
    >
      <section
        v-if="displayOverlay"
        ref="modal"
        v-focus-trap
        :class="[
          'ra-modal',
          `ra-modal--align-${verticalAlign}-${horizontalAlign}`,
          {
            'ra-modal--full-screen': isModalFullScreen,
          },
        ]"
        :style="{
          '--modal-outer-padding': padding,
          '--modal-padding': contentPadding,
          '--modal-width': contentWidth,
          '--modal-height': contentHeight,
          '--modal-background': contentBackground,
        }"
        v-bind="$attrs"
      >
        <RaOverlay
          :background="overlayBackground"
          visible
          @click="handleOverlayClick"
        />

        <!--@slot Use this slot to place content inside the close button.-->
        <slot v-if="closeButtonOutside" name="close">
          <RaIconButton
            v-if="closeButton"
            ref="closeButton"
            :class="[
              'ra-modal__close',
              {
                'ra-modal__close--outside': closeButtonOutside,
              },
            ]"
            aria-label="Close modal"
            data-testid="close-button"
            :shape="closeButtonShape"
            :size="closeButtonSize"
            :variant="closeButtonVariant"
            :icon="closeButtonIcon"
            :icon-size="closeButtonIconSize"
            :icon-color="closeButtonIconColor"
            @click="handleClose"
          />
        </slot>

        <RaLoader v-if="displayContent && loading" class="ra-modal__loader" />

        <transition
          appear
          :name="transitionContent"
          @before-leave="handleBeforeLeave"
          @after-leave="handleAfterLeave"
        >
          <div
            v-if="displayContent"
            ref="content"
            class="ra-modal__content"
            :class="{
              'ra-modal__content--loading': loading,
            }"
          >
            <h1 v-if="title" class="sr-only">{{ title }}</h1>

            <!--@slot Use this slot to place content inside the close button.-->
            <slot v-if="!closeButtonOutside" name="close">
              <RaIconButton
                v-if="closeButton"
                ref="closeButton"
                :class="[
                  'ra-modal__close',
                  {
                    'ra-modal__close--inside': !closeButtonOutside,
                  },
                ]"
                aria-label="Close modal"
                data-testid="close-button"
                :shape="closeButtonShape"
                :size="closeButtonSize"
                :variant="closeButtonVariant"
                :icon="closeButtonIcon"
                :icon-size="closeButtonIconSize"
                :icon-color="closeButtonIconColor"
                @click="handleClose"
              />
            </slot>

            <!--@slot Use this slot to place content inside the modal.-->
            <slot />
          </div>
        </transition>
      </section>
    </transition>
  </RaTeleport>
</template>

<script>
import RaLoader from '../../atoms/RaLoader/RaLoader.vue';
import RaOverlay from '../../atoms/RaOverlay/RaOverlay.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import RaTeleport from '../../atoms/RaTeleport/RaTeleport.vue';
import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import { focusTrap } from '@bva/ui-vue/src/directives';
import { isClient, getMediaQueryFromStr } from '@bva/ui-shared/helpers';
import { useMediaQuery } from '@vueuse/core';
import { ref, watch, computed, nextTick } from 'vue-demi';
import TeleportMixins from '@bva/ui-vue/src/mixins/teleport';
import { setFocus, setFirstFocus } from '@bva/ui-shared/helpers/focus-trap';

export default {
  name: 'RaModal',
  directives: { focusTrap },
  components: {
    RaLoader,
    RaOverlay,
    RaIconButton,
    RaTeleport,
  },
  mixins: [TeleportMixins],
  model: {
    prop: 'visible',
    event: 'close:modal',
  },
  props: {
    /**
     * Controls the overall visibility of the modal. Must be true to render the modal.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Controls visibility for only the content portion of the modal.
     * When set to `false` displays a loading indicator.
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * The triggering element for the modal.
     * Pass a `ref` to focus on this element once the modal closes.
     */
    trigger: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * An optional title to include within the modal for accessibility purposes.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Choose to display or not a modal close button.
     */
    closeButton: {
      type: Boolean,
      default: true,
    },
    /**
     * Render the close button outside of the main content area of the modal.
     */
    closeButtonOutside: {
      type: Boolean,
      default: false,
    },
    /**
     * Set the sizing dimensions for the close button.
     * Refer to `RaIconButton` documentation to learn more.
     */
    closeButtonSize: {
      type: String,
      default: 'md',
    },
    /**
     * Control the shape of the button.
     * Refer to `RaIconButton` documentation to learn more.
     */
    closeButtonShape: {
      type: String,
      default: 'rounded',
    },
    /**
     * Change the base styles for the close button using on of the presets.
     * Refer to `RaIconButton` documentation to learn more.
     */
    closeButtonVariant: {
      type: String,
      default: 'tertiary',
    },
    /**
     * Specify the icon to use for the close button.
     * Refer to `RaIconButton` documentation to learn more.
     */
    closeButtonIcon: {
      type: String,
      default: 'cross',
    },
    /**
     * Specify the icon size to use for the close button.
     * Refer to `RaIconButton` documentation to learn more.
     */
    closeButtonIconSize: {
      type: String,
      default: '',
    },
    /**
     * Specify the icon color to use for the close button.
     * Refer to `RaIconButton` documentation to learn more.
     */
    closeButtonIconColor: {
      type: String,
      default: '',
    },
    /**
     * If true clicking outside the modal contents will not dismiss the modal.
     */
    persistent: {
      type: Boolean,
      default: false,
    },
    /**
     * Allows closing the modal when pressing the keyboard's "Escape" key.
     */
    escKeyClose: {
      type: Boolean,
      default: true,
    },
    /**
     * Displays a background overlay when enabled.
     */
    overlay: {
      type: Boolean,
      default: true,
    },
    /**
     * Update the modal's background color (that is, the modal's backdrop/overlay).
     */
    background: {
      type: String,
      default: '',
    },
    /**
     * Padding for the modal overlay.
     * This is applied so that the modal's contents do not touch the edge of the screen.
     */
    padding: {
      type: String,
      default: '',
    },
    /**
     * Sets the modal's width.
     * Consider variable or small viewports when setting this value.
     */
    contentWidth: {
      type: String,
      default: '',
    },
    /**
     * Sets the modal's height.
     * Consider variable or small viewports when setting this value.
     */
    contentHeight: {
      type: String,
      default: '',
    },
    /**
     * Padding for the modal's contents, separating it from its visible edges.
     */
    contentPadding: {
      type: String,
      default: '',
    },
    /**
     * Update the modal's contents background color.
     */
    contentBackground: {
      type: String,
      default: '',
    },
    /**
     * The transition effect for the overall modal.
     */
    transition: {
      type: String,
      default: 'ra-fade',
    },
    /**
     * The transition effect for the modal's contents.
     */
    transitionContent: {
      type: String,
      default: 'ra-fade',
    },
    /**
     * Closes the modal overlay only after the contents finish transitioning.
     */
    waitForTransition: {
      type: Boolean,
      default: false,
    },
    /**
     * Boolean or media query string. If boolean true the modal is always fullscreen.
     * Pass a media query token: md or md-max or md-to-lg for example for media query
     */
    fullScreen: {
      type: [Boolean, String],
      default: false,
    },
    /**
     * Specify the vertical positioning for the modal.
     */
    verticalAlign: {
      type: String,
      default: 'middle',
      validator(value) {
        return [undefined, 'top', 'middle', 'bottom'].includes(value);
      },
    },
    /**
     * Specify the horizontal positioning for the modal.
     */
    horizontalAlign: {
      type: String,
      default: 'center',
      validator(value) {
        return [undefined, 'left', 'center', 'right'].includes(value);
      },
    },
  },
  setup(props, { emit }) {
    const modal = ref(null);
    const content = ref(null);
    //These are used to orchestrate the modal's enter/leave transitions
    //when `waitForTransition` is enabled.
    const displayOverlay = ref(props.visible);
    const displayContent = ref(props.visible);
    const transitionDone = ref(props.visible);

    let fullScreenMedia;

    if (typeof props.fullScreen === 'string') {
      fullScreenMedia = useMediaQuery(getMediaQueryFromStr(props.fullScreen));
    }

    const overlayBackground = computed(() => {
      return props.overlay ? props.background : 'transparent';
    });

    const isModalFullScreen = computed(() =>
      typeof props.fullScreen === 'string'
        ? fullScreenMedia.value
        : props.fullScreen
    );

    // Methods
    const handleCloseOverlay = () => {
      displayOverlay.value = false;
    };

    const handleAfterEnter = () => {
      if (props.waitForTransition) {
        displayContent.value = true;
      }

      transitionDone.value = true;

      emit('after-open:modal');
    };

    const handleBeforeLeave = () => {
      if (!props.waitForTransition) {
        handleCloseOverlay();
      }

      transitionDone.value = false;

      emit('before-close:modal');
    };

    const handleAfterLeave = () => {
      if (props.waitForTransition) {
        handleCloseOverlay();
      }

      emit('after-close:modal');
    };

    const handleClose = () => {
      setFocus(props.trigger?.$el);

      emit('close:modal', false);
    };

    const handleOverlayClick = () => {
      if (!props.persistent) {
        handleClose();
      }
    };

    const handleKeyDown = (evt) => {
      if (props.escKeyClose && evt.keyCode === 27) {
        handleClose();
      }
    };

    watch(transitionDone, (newVal) => {
      if (newVal) {
        setFirstFocus(modal.value);
      }
    });

    watch(
      () => props.visible,
      (newVal) => {
        if (!isClient) {
          return;
        }

        if (newVal) {
          displayOverlay.value = newVal;

          if (!props.waitForTransition) {
            displayContent.value = newVal;
          }

          nextTick(() => {
            if (modal.value) {
              disableBodyScroll(modal.value);
            }
          });

          document.addEventListener('keydown', handleKeyDown);
        } else {
          displayContent.value = newVal;

          clearAllBodyScrollLocks();
          document.removeEventListener('keydown', handleKeyDown);
        }
      }
    );

    return {
      modal,
      content,
      displayOverlay,
      displayContent,
      overlayBackground,
      isModalFullScreen,
      // Methods
      handleCloseOverlay,
      handleAfterEnter,
      handleBeforeLeave,
      handleAfterLeave,
      handleClose,
      handleOverlayClick,
      handleKeyDown,
    };
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaModal.css';
</style>
