const config = {
  theme: {
    breakpoints: {
      xs: 320,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1240,
      "2xl": 1440,
    },
  },
}

export const getCustomConfig = () => {
  try {
    return config;
  } catch(e) {
    return {};
  }
};
