import { getCustomConfig } from '../resolveConfig';
import { toVars } from '../helpers/tokenVars';

const { theme } = getCustomConfig()

const _zindex = {
  'above-modal': 6,
  'modal': 5,
  'above-overlay': 4,
  'overlay': 3,
  'above-base': 2,
  'base': 1,
  'reset': 0,
  'negative': -1
}

export const zindex = toVars({ ..._zindex, ...theme?.zindex }, { prefix: 'z-index' });
