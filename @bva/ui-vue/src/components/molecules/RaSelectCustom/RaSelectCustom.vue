<template>
  <div
    v-click-outside="checkPersistence"
    class="ra-select-custom ra-input"
    :class="[
      {
        'ra-select-custom--open': open,
        'ra-select-custom--selected': value,
        'is--required': required,
        'is--disabled': disabled,
        'is-invalid': !valid,
      },
      inherited.classes,
    ]"
    :style="[
      {
        '--select-drawer-min-height': drawerMinHeight,
        '--select-drawer-max-height': drawerMaxHeight,
      },
      inherited.styles,
    ]"
    :aria-expanded="open.toString()"
    :aria-owns="listBoxID"
    :aria-label="label"
    role="listbox"
    v-bind="inherited.attrs"
    @keyup.esc="handleClose"
    @keyup.up="handleMove(-1)"
    @keyup.down="handleMove(1)"
  >
    <RaOverlay
      :visible="open"
      :background="overlayBackground"
      class="ra-select-custom__overlay display--md-max"
      @click="handleClose"
    />

    <RaInputLabel :for="inputID" :label="label">
      <slot name="label" v-bind="{ label }" />
    </RaInputLabel>

    <div class="ra-select-custom__wrapper">
      <RaButton
        :id="inputID"
        ref="selectCTA"
        :name="name"
        :class="[
          'ra-select-custom__trigger',
          'ra-input__control',
          'ra-select__control',
          {
            'ra-select-custom__trigger--placeholder': !value,
          },
        ]"
        raw
        v-bind="inherited.listeners"
        @click="toggle"
        v-on="$listeners"
      >
        <div class="ra-select-custom__trigger-label" v-html="displayLabel" />

        <slot name="icon">
          <RaChevron class="ra-select-custom__chevron" :rotate="open" />
        </slot>
      </RaButton>

      <!-- These events are emitted from the child options. -->
      <RaExpand
        :name="dropdownTransition"
        @change:item="handleChange"
        @change:focus="handleFocus"
        @update:label="updateLabel"
        @update:optionList="updateOptionList"
      >
        <div
          v-show="open"
          :id="listBoxID"
          v-focus-trap
          class="ra-select-custom__drawer"
        >
          <RaLoader
            :loading="loading"
            :overlay="true"
            v-bind="{ ...loaderProps }"
          />

          <ul
            :aria-expanded="open.toString()"
            class="ra-select-custom__options"
          >
            <!-- <transition-group name="ra-fade"> -->
            <slot />
            <!-- </transition-group> -->
          </ul>

          <slot name="cancel">
            <RaButton
              class="ra-select-custom__cancel display--md-max"
              :variant="'tertiary'"
              @click="handleClose"
            >
              {{ cancelLabel }}
            </RaButton>
          </slot>
        </div>
      </RaExpand>
    </div>

    <RaInputMessage :visible="showMessage" :message="message">
      <slot name="message" v-bind="{ message }" />
    </RaInputMessage>

    <RaInputError :visible="!valid" :message="errorMessage">
      <slot name="error-message" v-bind="{ errorMessage }" />
    </RaInputError>
  </div>
</template>

<script>
import { computed } from 'vue-demi';

import { clickOutside, focusTrap } from '@bva/ui-vue/src/directives';
import { useBreakpoint, useInherited } from '@bva/ui-vue/src/composables';

import RaChevron from '../../atoms/RaChevron/RaChevron.vue';
import RaButton from '../../atoms/RaButton/RaButton.vue';
import RaOverlay from '../../atoms/RaOverlay/RaOverlay.vue';
import RaLoader from '../../atoms/RaLoader/RaLoader.vue';
import RaInputLabel from '../../atoms/RaInput/_internal/RaInputLabel.vue';
import RaInputError from '../../atoms/RaInput/_internal/RaInputError.vue';
import RaInputMessage from '../../atoms/RaInput/_internal/RaInputMessage.vue';
import RaExpand from '../../atoms/RaExpand/RaExpand.vue';

export default {
  name: 'RaSelectCustom',
  directives: { clickOutside, focusTrap },
  components: {
    RaButton,
    RaChevron,
    RaOverlay,
    RaLoader,
    RaInputLabel,
    RaInputMessage,
    RaInputError,
    RaExpand,
  },
  provide() {
    return { scopedState: this.scopedState };
  },
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    /**
     * Select field label
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Form input ID
     */
    id: {
      type: String,
      default: '',
    },
    /**
     * Form input name
     */
    name: {
      type: String,
      default: '',
    },
    /**
     * Selected item value
     */
    value: {
      type: [String, Number, Object],
      default: '',
    },
    /**
     * Required attribute
     */
    required: {
      type: Boolean,
      default: false,
    },
    /**
     * Validate value of form select
     */
    valid: {
      type: Boolean,
      default: true,
    },
    /**
     * Disabled status of form select
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Message to display with the input.
     */
    message: {
      type: String,
      default: '',
    },
    /**
     * Controls visibility for the input message.
     */
    showMessage: {
      type: Boolean,
      default: true,
    },
    /**
     * Error message value of form select. It will be appeared if `valid` is `true`.
     */
    errorMessage: {
      type: String,
      default: 'This field is not correct.',
    },
    /**
     * If true clicking outside will not dismiss the select
     */
    persistent: {
      type: Boolean,
      default: false,
    },
    /**
     * The placeholder copy that displays when no selection has been made.
     */
    placeholder: {
      type: String,
      default: 'Select an option',
    },
    /**
     * Label to set on the "cancel" button.
     */
    cancelLabel: {
      type: String,
      default: 'Cancel',
    },
    /**
     * Global transition for the drawer open action.
     */
    transition: {
      type: String,
      default: 'ra-slide-bottom',
    },
    /**
     * "MD" viewport transition for the drawer open action.
     */
    transitionMD: {
      type: String,
      default: 'ra-expand',
    },
    /**
     * Configure a custom background for the overlay backdrop.
     */
    overlayBackground: {
      type: String,
      default: '',
    },
    /**
     * Set a loading state for the dropdown.
     * Use this prop for deferred option loading.
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Pass custom props directly into the `RaLoader` component.
     */
    loaderProps: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Customize the drawer's min height.
     * Use any valid CSS unit+value.
     */
    drawerMinHeight: {
      type: String,
      default: undefined,
    },
    /**
     * Customize the drawer's max height.
     * Use any valid CSS unit+value.
     */
    drawerMaxHeight: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const { isMobile } = useBreakpoint();
    const dropdownTransition = computed(() => {
      return isMobile.value ? props.transition : props.transitionMD;
    });

    return {
      dropdownTransition,
      isMobile,
      inherited: useInherited(),
    };
  },
  data() {
    return {
      inputID: this.id || this.name,
      listBoxID: `listBox-${this.id || this.name}`,
      scopedState: {
        options: [],
        index: 0,
        focusIndex: 0,
        value: this.value,
      },
      selectedLabel: null,
      open: false,
    };
  },
  computed: {
    displayLabel() {
      return this.value && this.selectedLabel
        ? this.selectedLabel
        : this.placeholder;
    },
  },
  watch: {
    open(newVal) {
      if (newVal) {
        this.setHighlightAtIndex(this.scopedState.index);

        this.$emit('open', this.value);
      } else {
        this.$refs.selectCTA.$el.focus();

        this.$emit('close', this.value);
      }
    },
    loading(newVal) {
      if (!newVal && this.open) {
        setTimeout(() => {
          this.setHighlightAtIndex(this.scopedState.index);
        }, 0);
      }
    },
  },
  methods: {
    handleChange(value, label, index) {
      //Do not emit a change if the new value is already selected.
      if (this.value !== value) {
        this.updateLabel(label);

        this.$emit('change', value);

        this.scopedState.value = value;
        this.scopedState.index = index;
      }

      this.handleClose();
    },
    handleFocus(value, label, index) {
      //Remove previously highlighted element state when a new focus is set.
      const focusedOption =
        this.scopedState.options[this.scopedState.focusIndex];

      focusedOption?.classList.remove('ra-select-custom-option--highlight');

      this.scopedState.focusIndex = index;
    },
    updateLabel(label, index) {
      this.selectedLabel = label;

      this.scopedState.index = index;
    },
    updateOptionList(option) {
      this.scopedState.options.push(option);
    },
    handleMove(adjust) {
      if (!this.open) {
        this.handleOpen();
      }

      //Set focus on the new option:
      this.setFocusAtIndex(this.getNewFocusIndex(adjust));
    },
    getNewFocusIndex(adjust) {
      const optionCount = this.scopedState.options.length - 1;
      const newFocusIndex = this.scopedState.focusIndex + adjust;

      //Constraints focus to stay within the edges of the option list.
      if (newFocusIndex < 0) {
        return 0;
      } else if (newFocusIndex > optionCount) {
        return optionCount;
      }

      return newFocusIndex;
    },
    setFocusAtIndex(index) {
      this.scopedState.options[index].focus();
    },
    setHighlightAtIndex(index) {
      const currentOption = this.scopedState.options[index];

      currentOption?.classList.add('ra-select-custom-option--highlight');

      this.scopedState.focusIndex = index;
    },
    toggle() {
      if (!this.disabled) {
        this.open ? this.handleClose() : this.handleOpen();
      }
    },
    handleOpen() {
      this.open = true;
    },
    handleClose() {
      this.open = false;
    },
    checkPersistence() {
      if (!this.persistent) {
        this.handleClose();
      }
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/molecules/RaSelectCustom.css';
</style>
