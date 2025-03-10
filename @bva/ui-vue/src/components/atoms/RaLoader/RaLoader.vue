<template>
  <div
    class="ra-loader"
    :style="[
      {
        '--loader-size': loaderSize,
        '--loader-color': loaderColor,
        '--loader-background': loaderBackground,
      },
    ]"
    v-on="$listeners"
  >
    <transition name="ra-fade" mode="out-in">
      <!--@slot Slot for the actual content being loaded -->
      <slot v-if="!loading"></slot>

      <div
        v-else
        :class="[
          'ra-loader__wrapper',
          {
            'ra-loader__wrapper--overlay': overlay,
          },
        ]"
      >
        <!--@slot Use this slot to replace the loader -->
        <slot name="loader">
          <svg
            role="img"
            viewBox="0 0 38 38"
            xmlns="http://www.w3.org/2000/svg"
            class="ra-loader__spinner"
          >
            <title>Loading...</title>
            <g fill="none" fill-rule="evenodd">
              <g transform="translate(1 1)" stroke-width="2">
                <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
                <path d="M36 18c0-9.94-8.06-18-18-18">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 18 18"
                    to="360 18 18"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            </g>
          </svg>
        </slot>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'RaLoader',
  props: {
    /**
     * Shows the loader on top of the existing content
     */
    loading: {
      default: true,
      type: Boolean,
    },
    /**
     * Control the loader's dimensions using CSS units.
     */
    loaderSize: {
      type: String,
      default: '',
    },
    /**
     * Control the loader's color using valid CSS colors or Custom Properties.
     */
    loaderColor: {
      type: String,
      default: '',
    },
    /**
     * Control the loader's backdrop using valid CSS colors or Custom Properties.
     */
    loaderBackground: {
      type: String,
      default: '',
    },
    /**
     * Renders the loader as an overlay that expands to the full dimensions of its container.
     * Note that the container must have a position other than `position: static`.
     */
    overlay: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style>
@import '@bva/ui-shared/styles/components/atoms/RaLoader.css';
</style>
