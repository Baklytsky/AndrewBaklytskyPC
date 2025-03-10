import { ref, isRef, nextTick } from 'vue-demi';
import { debouncedWatch, useIntersectionObserver } from '@vueuse/core';
import { useMotion } from '@vueuse/motion';
import { useCSSMotion } from '@bva/ui-vue/src/composables';
import { getMotionPreset } from '@bva/ui-shared/helpers';

const motionQueue = ref([]);
const scrollDirection = ref('down');

const DEFAULTS = {
  once: true,
  thereshold: 0.25,
  delay: 40,
  debounce: 150,
  children: [],
  childDelay: 150,
  childEase: [0.4, 0.9, 0.25, 1],
  childDuration: 600,
  resetAfterReveal: true,
  cssMode: false,
  variants: 'fade',
  cssVariants: {
    initial: 'motion-fade-initial',
    reverse: 'motion-fade-reverse',
    reveal: 'motion-fade-reveal',
  },
  //These control motion on the `target` node.
  selfEnable: true,
  selfVariants: {},
};

export const usePageMotion = (target, options = {}) => {
  options = { ...DEFAULTS, ...options };

  options.variants = getMotionPreset(options.variants);

  target = isRef(target) ? target : ref(target);

  const childrenList = ref([]);
  const motionCollection = ref([]);

  /**
   * Applies a given `motionConfig`, or the default `reveal` variant, into a collection of DOM elements.
   */
  const applyMotion = (instance, motionConfig = 'reveal') => {
    instance.collection.forEach((currentMotion, index) => {
      //Delay is calculated based on how many child elements have motion.
      const calculatedDelay = index * instance.options.childDelay;

      if (instance.options.cssMode) {
        setTimeout(async () => {
          await currentMotion.apply(motionConfig);

          if (instance.options.resetAfterReveal && motionConfig === 'reveal') {
            currentMotion.removeAll();
          }
        }, calculatedDelay);
      } else {
        if (motionConfig === 'reveal') {
          //Some transition properties that should be applied in case they're not provided.
          const mergedRevealTransition = {
            ease: instance.options.childEase,
            duration: instance.options.childDuration,
            delay: index * instance.options.childDelay,
            ...currentMotion.variants.reveal.transition,
          };

          currentMotion.variants.reveal = {
            ...currentMotion.variants.reveal,
            transition: { ...mergedRevealTransition },
          };
        }

        currentMotion.apply(motionConfig).then(() => {
          if (instance.options.resetAfterReveal) {
            currentMotion.apply('reset');

            currentMotion.target.style.transform = '';
          }
        });
      }
    });
  };

  /**
   * Fires off motion collections at a given delay.
   * The delay is calculated based on a provided `multiplier` and the `options.delay` value (if present).
   */
  const delayedApplyMotion = (instance, multiplier) => {
    if (instance.collection) {
      setTimeout(
        () => applyMotion(instance),
        multiplier * instance.options.delay
      );
    }
  };

  /**
   * Generates default motion variants for each given `referenceEl`.
   * Aferwards, these configurations are pushed into the component's `motionCollection` array.
   * This array keeps track of all motion configurations for the current component.
   */
  const createMotionCollection = (referenceEl, referenceVariants) => {
    if (options.cssMode) {
      motionCollection.value.push(
        useCSSMotion(referenceEl, {
          ...options.cssVariants,
          ...referenceVariants,
        })
      );
    } else {
      motionCollection.value.push(
        useMotion(referenceEl, {
          ...options.variants,
          ...getMotionPreset(referenceVariants),
        })
      );
    }
  };

  const updateScrollDirection = (newPosition) => {
    scrollDirection.value = newPosition > 0 ? 'down' : 'up';
  };

  /**
   * Setup one intersection observer for the `target`.
   * Only one target is allowed at a time, however multiple children elements may be passed to trigger simultaneously.
   */
  const { stop: intersectionStop } = useIntersectionObserver(
    target,
    ([entry], observerElement) => {
      updateScrollDirection(entry.boundingClientRect.y);

      if (entry.isIntersecting) {
        //Keep track of items as they enter the viewport so that they can later be animated-in.
        motionQueue.value.push({
          target: target.value,
          collection: motionCollection.value,
          options,
        });

        //Run motion a single time if the `options.once` flag is enabled.
        if (options.once) {
          intersectionStop();
        }
      } else if (!options.once) {
        //Swap the initial variant for its reverse so that motion respects the scroll direction.
        applyMotion(
          {
            target: target.value,
            collection: motionCollection.value,
            options,
          },
          scrollDirection.value === 'down' ? 'initial' : 'reverse'
        );
      }
    },
    {
      threshold: options.thereshold,
    }
  );

  /**
   * Sort items by their coordinates in the DOM.
   */
  const sortQueueByPosition = (queue, reverseTopCalc = false) => {
    return queue.sort((a, b) => {
      if (a.rect.top === b.rect.top) {
        return a.rect.left - b.rect.left;
      }

      return reverseTopCalc ? b.rect.top - a.rect.top : a.rect.top - b.rect.top;
    });
  };

  const destroy = () => {
    motionCollection.value = [];
    childrenList.value = [];
    motionQueue.value = [];
    scrollDirection.value = '';
    intersectionStop();
  };

  /**
   * Generate the children elements list once the DOM has finished mutating.
   */
  nextTick(() => {
    if (options.selfEnable) {
      createMotionCollection(target.value, options.selfVariants);
    }

    if (Array.isArray(options.children)) {
      //When `options.children` is an array, loop through each item to get any selectors or custom motion configurations.
      //This way it is possible to override the motion defaults on a per-component and per-element level.
      options.children.forEach((currentGroup) => {
        const groupChildrenEls = target.value.querySelectorAll(
          currentGroup.selector || currentGroup
        );

        [].forEach.call(groupChildrenEls, (currentChild) => {
          childrenList.value.push(currentChild);

          createMotionCollection(currentChild, currentGroup.config);
        });
      });
    } else if (options.children) {
      //When `options.children` is passed as a string, create a motion collection for each matching element.
      if (typeof options.children === 'string') {
        childrenList.value = target.value.querySelectorAll(options.children);
      } else {
        childrenList.value = options.children;
      }

      [].forEach.call(childrenList.value, (currentChild) => {
        createMotionCollection(currentChild);
      });
    }
  });

  /**
   * Wait until no more items are being pushed into the queue before allowing to start animations.
   * This ensures motion is orchestrated and not random.
   */
  debouncedWatch(
    motionQueue,
    (newValue) => {
      if (newValue.length > 0) {
        //Get fresh bounding client rects since they might've changed by the time the watcher triggers.
        //This might be a tad taxing, alternatively we could traverse the DOM to find the offsetTop/Left
        //from each element in the queue.
        newValue.forEach((instance) => {
          instance.rect = instance.target.getBoundingClientRect();
        });

        //Sort the queue once intersection observer stops pushing new items into the queue.
        sortQueueByPosition(newValue, scrollDirection.value === 'up');

        newValue.forEach(delayedApplyMotion);

        motionQueue.value = [];
      }
    },
    {
      debounce: options.debounce,
    }
  );

  return {
    destroy,
    motionCollection,
    intersectionStop,
    scrollDirection,
    childrenList,
  };
};
