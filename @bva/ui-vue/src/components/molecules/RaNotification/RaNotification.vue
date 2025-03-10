<template>
  <transition :name="transition">
    <div
      v-if="visible"
      class="ra-notification"
      :class="[
        modifierClass(variant),
        {
          'ra-notification--overlay': overlay,
          'ra-notification--no-icon': !selectedIcon,
        },
      ]"
    >
      <!--@slot Custom notification icon. Slot content will replace default icon.-->
      <slot name="icon" v-bind="{ icon: selectedIcon }">
        <RaIcon
          v-if="!!selectedIcon"
          class="ra-notification__icon"
          :icon="selectedIcon"
          v-bind="{
            ...iconProps,
          }"
        />
      </slot>

      <div class="ra-notification__content">
        <!--@slot Custom title. Slot content will replace default title.-->
        <slot name="title" v-bind="{ title }">
          <div v-if="title" class="ra-notification__title">
            {{ title }}
          </div>
        </slot>

        <!--@slot Custom message. Slot content will replace default message.-->
        <slot name="message" v-bind="{ message }">
          <span v-if="message" class="ra-notification__message">{{
            message
          }}</span>
        </slot>

        <!--@slot Custom action. Slot content will replace default action.-->
        <slot name="action" v-bind="{ action, actionHandler }">
          <RaButton
            v-if="action"
            class="ra-notification__action"
            :as-text="true"
            v-bind="{
              ...actionProps,
            }"
            @click="actionHandler"
          >
            {{ action }}
          </RaButton>
        </slot>
      </div>

      <!--@slot Custom notification close icon. Slot content will replace default close icon.-->
      <slot name="close" v-bind="{ closeHandler }">
        <RaIconButton
          v-if="close"
          aria-label="Close notification"
          class="ra-notification__close"
          :icon="'cross'"
          :variant="'ghost'"
          :size="'sm'"
          :icon-size="'md'"
          v-bind="{
            ...closeProps,
          }"
          @click="closeHandler"
        />
      </slot>
    </div>
  </transition>
</template>
<script>
import RaIcon from '../../atoms/RaIcon/RaIcon.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';

export default {
  name: 'RaNotification',
  components: {
    RaIcon,
    RaButton,
    RaIconButton,
  },
  props: {
    /**
     * Visibility of the Notification. Default value is false.
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * Title that will be displayed in Notification.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Message that will be displayed in Notification.
     */
    message: {
      type: String,
      default: '',
    },
    /**
     * Choose the icon to display with the notification.
     * Set to `false` to disable.
     */
    icon: {
      type: [Boolean, String],
      default: '',
    },
    /**
     * Action that will be displayed in Notification.
     */
    action: {
      type: String,
      default: '',
    },
    /**
     * Notification variation look and feel.
     */
    variant: {
      type: String,
      default: 'primary',
    },
    /**
     * Choose the transition type for the notification visbility change.
     */
    transition: {
      type: String,
      default: 'ra-slide-bottom',
    },
    /**
     * Toggle visibility of the close CTA.
     */
    close: {
      type: Boolean,
      default: true,
    },
    /**
     * Displays the notification overlaying its container.
     * Note: the container must have a CSS `position` other than `static`.
     */
    overlay: {
      type: Boolean,
      default: false,
    },
    /**
     * Additional configurations to pass directly into the `RaIcon` component.
     */
    iconProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Additional configurations to pass directly into the `RaButton` component.
     */
    actionProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Additional configurations to pass directly into the `RaIconButton` component.
     */
    closeProps: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    selectedIcon() {
      if (this.icon) {
        return this.icon;
      } else if (this.icon === false) {
        return null;
      }

      switch (this.variant) {
        case 'success':
          return 'added_to_cart';
        case 'danger':
          return 'info_shield';
        default:
          return 'info_circle';
      }
    },
  },
  methods: {
    actionHandler() {
      /**
       * Event for action button
       * @type {Event}
       */
      this.$emit('click:action');
    },
    closeHandler() {
      /**
       * Event for close icon
       * @type {Event}
       */
      this.$emit('click:close');
    },
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-notification--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaNotification.css';
</style>
