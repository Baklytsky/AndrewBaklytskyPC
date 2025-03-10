import config from 'bedrock-config';

export const getCustomConfig = () => {
  try {
    return config;
  } catch(e) {
    return {};
  }
};
