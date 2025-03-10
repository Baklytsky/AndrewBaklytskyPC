<template>
  <li
    ref="option"
    :class="[
      'ra-select-custom-option',
      {
        'ra-select-custom-option--selected': isSelected,
      },
    ]"
    tabindex="0"
    role="option"
    :aria-selected="isSelected ? 'true' : 'false'"
    @click="handleChange"
    @focus="handleFocus"
    @keyup.space.enter="handleChange"
  >
    <div ref="optionLabel" class="ra-select-custom-option__label">
      <!-- @slot -->
      <slot />
    </div>

    <RaIcon
      v-if="isSelected"
      icon="check"
      class="ra-select-custom-option__icon"
    />
  </li>
</template>

<script>
import RaIcon from '../../../atoms/RaIcon/RaIcon.vue';
import { ref, computed, inject, watch, getCurrentInstance } from 'vue-demi';

export default {
  name: 'RaSelectCustomOption',
  components: {
    RaIcon,
  },
  props: {
    value: {
      type: [String, Number, Object],
      default: '',
    },
  },
  setup(props) {
    const _this = getCurrentInstance().proxy;

    const option = ref();
    const optionLabel = ref();
    const optionIndex = ref(0);
    const scopedState = inject('scopedState') || {};
    const isSelected = computed(() => {
      return scopedState.value === props.value;
    });

    const handleChange = () => {
      _this.$parent.$emit(
        'change:item',
        props.value,
        optionLabel.value.innerHTML,
        optionIndex.value
      );
    };

    const handleFocus = () => {
      _this.$parent.$emit(
        'change:focus',
        props.value,
        optionLabel.value.innerHTML,
        optionIndex.value
      );
    };

    //Setup initial state
    watch(optionLabel, (newVal) => {
      optionIndex.value = scopedState.options.length;

      _this.$parent.$emit('update:optionList', option.value);

      if (props.value === scopedState.value) {
        _this.$parent.$emit(
          'update:label',
          newVal.innerHTML,
          optionIndex.value
        );
      }
    });

    return {
      option,
      optionLabel,
      isSelected,
      handleChange,
      handleFocus,
    };
  },
};
</script>
