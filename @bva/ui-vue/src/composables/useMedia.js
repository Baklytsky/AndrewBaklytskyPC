import { computed, ref, getCurrentInstance } from 'vue-demi';
import { getMediaVariables } from '@bva/ui-shared/helpers';

export const useMedia = (type = 'image', initial = false) => {
  const { proxy } = getCurrentInstance();

  const mediaEl = ref(null);
  const loaded = ref(initial);

  const isImage = type === 'image';
  const isVideo = type === 'video';

  //Computed
  const dimensionVariables = computed(() => {
    return getMediaVariables(
      { width: proxy.$props.width, height: proxy.$props.height },
      {
        useAspectRatio: proxy.$props.useAspectRatio,
        stringify: true,
      }
    );
  });

  const mediaLoadClasses = computed(() => {
    return `set-media--${loaded.value ? 'loaded' : 'loading'}`;
  });

  //Methods
  const handleLoad = () => {
    const loadEvtData = mediaEl.value
      ? {
          width: isImage
            ? mediaEl.value.naturalWidth
            : mediaEl.value.videoWidth,
          height: isImage
            ? mediaEl.value.naturalHeight
            : mediaEl.value.videoHeight,
        }
      : {};

    loaded.value = true;

    proxy.$emit(`load:${type}`, loadEvtData);
  };

  return {
    //Refs
    mediaEl,
    loaded,
    //Computed
    dimensionVariables,
    mediaLoadClasses,
    //Methods
    handleLoad,
  };
};
