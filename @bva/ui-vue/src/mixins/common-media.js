import {
  getRespectMediaRatio,
  getAspectRatioClasses,
  getHasSrc,
} from '@bva/ui-shared/helpers/media';

/**
 * Hosts component properties (props) for: media, images, video, and related properties.
 * For easy reuse across components with similar functionalities.
 *
 * Defaults and/or overrides can be set on a per-component basis.
 */
export default {
  props: {
    /**
     * Singular or main image source for the component.
     */
    imageSrc: {
      type: String,
    },
    /**
     * Image Sourceset for the component.
     * Images for specific breakpoints or screen resolutions can be provided.
     * Follows the `RaImage` API.
     */
    imageSrcset: {
      type: Array,
    },
    /**
     * Alternative text in case image is not loaded, and for accessibility purposes.
     * Use empty string " " for decorative-only image and full text otherwise
     */
    imageAlt: {
      type: String,
    },
    /**
     * Width of the image which is passed down to the `RaImage` component.
     */
    imageWidth: {
      type: [String, Number],
      default: '',
    },
    /**
     * Height of the image which is passed down to the `RaImage` component.
     */
    imageHeight: {
      type: [String, Number],
      default: '',
    },
    /**
     * Video source(s) for individual `<source>` tags.
     * Provide a URL String to the video resource.
     * Alternatively, pass an Object of the format:
     *   ```
     *   {
     *     src: String,
     *     codec?: String,
     *   }
     *   ```
     *  Or an Array of Objects with the same format.
     */
    videoSrc: {
      type: [String, Array, Object],
      default() {
        return '';
      },
    },
    /**
     * Width of the video which is passed down to the `RaVideo` component.
     */
    videoWidth: {
      type: [String, Number],
      default: '',
    },
    /**
     * Height of the video which is passed down to the `RaVideo` component.
     */
    videoHeight: {
      type: [String, Number],
      default: '',
    },
    /**
     * A string representing the aspect ratio to be used for this component.
     * Aspect ratios may vary between components or styleguides.
     * Reserved keywords: `respect-media`, `fill-space`.
     */
    aspectRatio: {
      type: String,
      default: null,
    },
    /**
     * X and Y coordinates to use as the "focus point" of an image or video when the media's container shrinks and less of it becomes visible.
     */
    focalPoint: {
      type: Object,
      default() {
        return {
          x: 0,
          y: 0,
        };
      },
    },
  },
  computed: {
    respectMediaRatio() {
      return getRespectMediaRatio(this.aspectRatio);
    },
    aspectRatioClasses() {
      return getAspectRatioClasses(this.aspectRatio);
    },
    hasImage() {
      return getHasSrc(this.imageSrc || this.imageSrcset);
    },
    hasVideo() {
      return getHasSrc(this.videoSrc);
    },
  },
};
