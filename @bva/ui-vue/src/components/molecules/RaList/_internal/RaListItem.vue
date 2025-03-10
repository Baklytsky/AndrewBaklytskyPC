<template>
  <component
    :is="listItemContainer"
    :class="[
      'ra-list__item',
      {
        'ra-list__item--description': isDescriptionList,
      },
    ]"
  >
    <dt v-if="isDescriptionList">{{ term }}</dt>
    <dd v-if="isDescriptionList">{{ details }}</dd>
    <!-- @slot -->
    <slot v-if="!isDescriptionList" />
  </component>
</template>
<script>
export default {
  name: 'RaListItem',
  props: {
    as: {
      type: String,
      default: '',
    },
    /**
     * Content of the dt tag
     */
    term: {
      type: String,
      default: '',
    },
    /**
     * Contents of the dd tag
     */
    details: {
      type: String,
      default: '',
    },
  },
  computed: {
    isDescriptionList() {
      return this.as === 'dl';
    },
    listItemContainer() {
      return this.isDescriptionList ? 'div' : 'li';
    },
  },
};
</script>
