import { formatPercent } from './units';

export const getHasProgress = (progress) => {
  return progress > 0;
};

export const getHasReachedTarget = (progress, target) => {
  return progress >= target;
};

export const getProgressRemaining = (progress, target) => {
  return Math.max(target, 0) - Math.max(progress, 0);
};

export const getProgressPercent = (progress, target) => {
  return formatPercent(Math.max(progress, 0) / Math.max(target, 0));
};
