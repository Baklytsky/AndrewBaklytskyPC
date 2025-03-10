import { getCustomConfig } from '../resolveConfig';
import { toVars } from '../helpers/tokenVars';

const { theme } = getCustomConfig();

const _transitionDuration = {
  'fast': '107ms',
  'default': '213ms',
  'medium': '426ms',
  'slow': '852ms',
};

const _transitionFunction = {
  'default': 'ease-in-out',
  'bezier-ease': 'cubic-bezier(.4, .9, .25, 1)',
  'bounce': 'cubic-bezier(.4, .9, .25, 1.5)',
  'bounce-lg': 'cubic-bezier(.4, .9, .25, 2)',
};

export const transitionDuration = toVars({
  ..._transitionDuration,
  ...theme?.transition?.duration,
  ...theme?.transitionDuration
}, { prefix: 'transition-duration' });

export const transitionFunction = toVars({
  ..._transitionFunction,
  ...theme?.transition?.function,
  ...theme?.transitionFunction
}, { prefix: 'transition-function' });

export const transition = {
  duration: transitionDuration,
  function: transitionFunction,
};
