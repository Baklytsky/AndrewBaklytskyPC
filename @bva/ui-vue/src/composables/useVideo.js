import { computed, ref, watch, getCurrentInstance } from 'vue-demi';
import { useMediaControls, useIntersectionObserver } from '@vueuse/core';
import { getMediaVariables } from '@bva/ui-shared/helpers';

export const useVideo = (videoRef) => {
  const { proxy } = getCurrentInstance();

  const videoIsVisible = ref(false);

  //Computed
  const { playing } = useMediaControls(videoRef, {
    src: proxy.$props.src,
  });

  const playButtonIcon = computed(() =>
    playing.value ? proxy.$props.pauseIcon : proxy.$props.playIcon
  );

  //Methods
  const handlePlayToggle = () => {
    playing.value = !playing.value;

    proxy.$emit('play:toggled', {
      playing: playing.value,
    });
  };

  //Only watch for video's visibility if `autopause` is enabled.
  if (proxy.$props.autopause) {
    //Configure an intersection observer to determine when the video's viewport visibility changes.
    useIntersectionObserver(
      videoRef,
      ([{ isIntersecting }], observerElement) => {
        videoIsVisible.value = isIntersecting;
      }
    );

    watch(videoIsVisible, (currVal, prevVal) => {
      playing.value = currVal;

      proxy.$emit('change:visibility', currVal);
    });
  }

  return {
    videoIsVisible,
    //Computed
    playing,
    playButtonIcon,
    //Methods
    handlePlayToggle,
  };
};
