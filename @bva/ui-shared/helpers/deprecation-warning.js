export const deprecationWarning = (componentName, msg) => {
  process.env.NODE_ENV !== 'production' &&
    process.env.APP_NO_DEPRECATED_WARNINGS !== 'no-deprecated-warnings' &&
    console.warn(`[BedrockUI][${componentName}] ${msg}`);
};
