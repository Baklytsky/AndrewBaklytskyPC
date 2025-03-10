<template>
  <RaInput
    ref="searchInput"
    class="ra-search-bar"
    input-class="ra-search-bar__input"
    type="search"
    :value="value"
    :placeholder="placeholder"
    v-bind="$attrs"
    v-on="{
      ...$listeners,
      'keyup.enter': handleEnter,
      'keyup.esc': handleEsc,
      blur: handleBlur,
    }"
  >
    <template #input-action>
      <!-- @slot Use this slot to provide a custom button/icon for the search bar. -->
      <slot name="search-action">
        <RaIconButton
          v-if="icon"
          :icon="icon"
          :icon-size="iconSize"
          :icon-color="iconColor"
          :variant="'ghost'"
          :shape="'square'"
          class="ra-search-bar__button"
          aria-label="search"
          @click="handleActionClick"
        />
      </slot>
    </template>
  </RaInput>
</template>
<script>
import { ref } from 'vue-demi';
import RaIconButton from '../../atoms/RaIconButton/RaIconButton.vue';
import RaInput from '../../atoms/RaInput/RaInput.vue';

export default {
  name: 'RaSearchBar',
  components: { RaInput, RaIconButton },
  props: {
    /**
     * Text for placeholder
     */
    placeholder: {
      type: String,
      default: '',
    },
    /**
     * Value that will be displayed in search bar
     */
    value: {
      type: [Number, String],
      default: null,
    },
    /**
     * Specify the icon type for the search bar.
     */
    icon: {
      type: [String, Boolean],
      default: 'search',
    },
    iconSize: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const searchInput = ref(null);

    /**
     * Standardize the input events so that the common events all return a string.
     */
    const handleEnter = (event) => {
      emit('keyEnter:search', event.target.value);
    };

    const handleEsc = () => {
      emit('input', '');
    };

    const handleBlur = () => {
      emit('blur');
    };

    const handleActionClick = () => {
      emit('click:search-action', searchInput.value.$el.value || props.value);
    };

    return {
      //Refs
      searchInput,
      //Methods
      handleEnter,
      handleEsc,
      handleBlur,
      handleActionClick,
    };
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/molecules/RaSearchBar.css';
</style>
