<template>
  <li
    class="ra-breadcrumbs__list-item"
    :class="{
      'ra-breadcrumbs__list-item--current': last,
    }"
    :aria-current="last && 'page'"
  >
    <!-- @slot Custom markup for previous pages (binds `$props` object) -->
    <slot :name="last ? 'current' : 'link'" v-bind="{ ...$props }">
      <component
        :is="renderAsLink ? 'RaLink' : 'span'"
        :class="[
          'ra-breadcrumbs__breadcrumb',
          {
            'ra-breadcrumbs__breadcrumb--current': last,
          },
        ]"
        :link="renderAsLink ? link : null"
        :underline="false"
        :data-testid="text"
        >{{ text }}</component
      >
    </slot>

    <!-- @slot Custom breacrumb dividers (binds `$props` object) -->
    <slot v-if="!last" name="divider" v-bind="{ ...$props }">
      <RaIcon
        v-if="divider"
        :icon="divider"
        :size="dividerSize"
        class="ra-breadcrumbs__divider"
      />
    </slot>
  </li>
</template>

<script>
import RaLink from '../../RaLink/RaLink.vue';
import RaIcon from '../../RaIcon/RaIcon.vue';

export default {
  name: 'RaBreadcrumb',
  components: {
    RaLink,
    RaIcon,
  },
  props: {
    /**
     * The link to use for this breadcrumb.
     * If left empty, item renders as non-interactive.
     */
    link: {
      type: String,
      default: '',
    },
    /**
     * Text to display with this item.
     */
    text: {
      type: String,
      default: '',
      required: true,
    },
    /**
     * Signals the breadcrumb that it is the last item in the list.
     */
    last: {
      type: Boolean,
      default: false,
    },
    /**
     * Renders the item as a non-interactive element instead.
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * The divider icon to use between breadcrumb items.
     */
    divider: {
      type: String,
      default: 'forwardslash',
    },
    /**
     * Control the size for the breadcrumb item divider.
     */
    dividerSize: {
      type: String,
      default: 'sm',
    },
  },
  computed: {
    renderAsLink() {
      return !this.disabled && !!this.link;
    },
  },
};
</script>
