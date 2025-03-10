<template>
  <div
    :class="[
      'ra-accordion-item',
      {
        'ra-accordion-item--scrollable': scrollable,
        'ra-accordion-item--open': open,
      },
      modifierClass(size),
      modifierClass(variant),
    ]"
    :style="{
      '--accordion-content-max-height': maxHeight,
    }"
  >
    <!-- @slot -->
    <slot
      name="toggle"
      v-bind="{
        title,
        open,
        updateToggle,
        toggleIcons,
      }"
    >
      <div role="heading" :aria-level="titleLevel">
        <RaButton
          class="ra-accordion-item__toggle"
          :aria-pressed="open.toString()"
          :aria-expanded="open.toString()"
          :aria-controls="pannelId"
          raw
          @click="updateToggle"
        >
          {{ title }}
          <!-- @slot Use to add additional information about this item -->
          <slot name="toggle-description" />

          <slot name="toggle-icon">
            <RaIcon
              v-if="toggleIcons"
              :icon="open ? toggleIcons.open : toggleIcons.closed"
            />
          </slot>
        </RaButton>
      </div>
    </slot>

    <RaExpand :name="transition">
      <div v-show="open" :id="pannelId" class="ra-accordion-item__content">
        <p v-if="contentTitle" class="ra-accordion-item__content-title">
          {{ contentTitle }}
        </p>

        <!-- @slot Add the main content for the accordion item. -->
        <slot />
      </div>
    </RaExpand>
  </div>
</template>
<script>
import RaExpand from '../../../atoms/RaExpand/RaExpand.vue';
import RaIcon from '../../../atoms/RaIcon/RaIcon.vue';
import RaButton from '../../../atoms/RaButton/RaButton.vue';
import { useScopedToggle } from '@bva/ui-vue/src/composables';
import { getCurrentInstance, computed } from 'vue-demi';

export default {
  name: 'RaAccordionItem',
  components: {
    RaIcon,
    RaButton,
    RaExpand,
  },
  model: {
    prop: 'open',
    event: 'toggle',
  },
  props: {
    /**
     * Sets this accordion item as open.
     */
    open: {
      type: Boolean,
      default: false,
    },
    /**
     * Optionally provide an index for this item.
     * If none is provided, uses the current context to generate one.
     */
    index: {
      type: Number,
      default: -1,
    },
    /**
     * Main title displayed on this accordion item, displays within the toggleable CTA.
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Title for the content of this accordion item.
     */
    contentTitle: {
      type: String,
      default: '',
    },
    /**
     * Control the look and feel for the accordion, using one of the available presets.
     */
    variant: {
      type: String,
      default: '',
      validator(value) {
        return ['box', 'default', ''].includes(value);
      },
    },
    /**
     * Control the overall sizing for the accordion using one of these presets:
     * `base`, `lg`.
     * Note: Each preset has its own styles for desktop and mobile.
     */
    size: {
      type: String,
      default: '',
    },
    /**
     * Dropdown transition effect.
     */
    transition: {
      type: [String, Boolean],
      default: 'ra-expand',
    },
    /**
     * Toggles the display of the chevron on individual dropdowns.
     */
    toggleIcons: {
      type: [Object, Boolean],
      default() {
        return {
          open: 'minus',
          closed: 'plus',
        };
      },
    },
    /**
     * Hides content overflow. This may be necessary in some instances where content is too tall.
     */
    scrollable: {
      type: Boolean,
      default: false,
    },
    /**
     * Sets a max-height for the content in the case it is too tall to display all at once.
     * Combine with the `scrollable` prop to allow scrolling within the accordion.
     */
    maxHeight: {
      type: String,
      default: null,
    },
    /**
     * Optional prop to set the aria-level
     */
    titleLevel: {
      type: Number,
      default: 6,
    },
  },
  setup() {
    const { _uid } = getCurrentInstance().proxy;

    const { updateToggle } = useScopedToggle();

    const pannelId = computed(() => `accordion-item-${_uid}`);

    return {
      updateToggle,
      pannelId,
    };
  },
  methods: {
    modifierClass(modifier, prefix) {
      return modifier
        ? `ra-accordion-item--${prefix ? `${prefix}-` : ''}${modifier}`
        : '';
    },
  },
};
</script>
