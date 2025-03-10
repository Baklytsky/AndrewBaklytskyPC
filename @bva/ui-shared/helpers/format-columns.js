import { breakpoints } from '../tokens/breakpoints';
import { formatPercent } from './units';

export const getFormattedColumns = (config, base = 12) => {
  const units = {};
  const auto = {};

  Object.keys(config).map(key => {
    const isValidConfig = breakpoints.px[key] || key === 'size';

    if (isValidConfig) {
      if (isNaN(config[key])) {
        if (config[key] === 'auto') {
          auto[key] = config[key];
        } else {
          units[key] = config[key];
        }
      } else if (config[key]) {
        const portion = config[key] / base;

        units[key] = formatPercent(portion);
      }
    }
  });

  return {
    units,
    auto
  };
};
