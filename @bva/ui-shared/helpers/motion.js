import { motion } from '../tokens/motion';

export const getMotionPreset = (reference) => {
  return typeof reference === 'string' && motion[reference]
    ? motion[reference]
    : reference;
};

export const getMotionVariant = (reference = 'fade', variant = 'initial') => {
  const preset = getMotionPreset(reference);

  return preset ? preset[variant] : undefined;
};
