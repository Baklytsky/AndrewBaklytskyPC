const refreshReviewWidgets = () => {
  window.yotpoWidgetsContainer?.initWidgets();
  window.yotpo?.refreshWidgets();
};

export { refreshReviewWidgets };
