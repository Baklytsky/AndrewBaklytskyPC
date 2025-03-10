import { getCustomConfig } from '../resolveConfig';

const { theme } = getCustomConfig();

export const motion = {
  fade: {
    initial: {
      opacity: 0,
    },
    reverse: {
      opacity: 0,
    },
    reveal: {
      opacity: 1,
    },
    reset: {
      opacity: '',
    },
  },
  'vertical-fade': {
    initial: {
      opacity: 0,
      y: 25,
    },
    reverse: {
      opacity: 0,
      y: -10,
    },
    reveal: {
      opacity: 1,
      y: 0,
    },
    reset: {
      opacity: '',
      y: '',
    },
  },
  'right-fade': {
    initial: {
      opacity: 0,
      x: 25,
    },
    reverse: {
      opacity: 0,
      x: 25,
    },
    reveal: {
      opacity: 1,
      x: 0,
    },
    reset: {
      opacity: '',
      x: '',
    },
  },
  'left-fade': {
    initial: {
      opacity: 0,
      x: -25,
    },
    reverse: {
      opacity: 0,
      x: -25,
    },
    reveal: {
      opacity: 1,
      x: 0,
    },
    reset: {
      opacity: '',
      x: '',
    },
  },
  ...theme?.motion,
};
