(function () {
  const loaded = new Set();

  function loadCssOnce(key, href) {
    if (loaded.has(key)) return;
    loaded.add(key);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function watchForSelector({ key, href, selectors, timeoutMs = 4000 }) {
    const hasMatch = () => selectors.some((s) => document.querySelector(s));

    if (hasMatch()) {
      loadCssOnce(key, href);
      return;
    }

    const obs = new MutationObserver(() => {
      if (!hasMatch()) return;
      obs.disconnect();
      loadCssOnce(key, href);
    });

    obs.observe(document.documentElement, { childList: true, subtree: true });

    window.setTimeout(() => obs.disconnect(), timeoutMs);
  }

  watchForSelector({
    key: "carbon-junip",
    href: window.theme.assets.junipCss,
    selectors: [
      ".junip-product-summary",
      "#junip-product-reviews",
      "[data-junip-reviews]"
    ],
  });

  watchForSelector({
    key: "carbon-recharge",
    href: window.theme.assets.rechargeCss,
    selectors: [
      "[data-recharge-subscription-widget]",
      ".rc-widget",
      "recharge-subscription-widget"
    ],
  });
})();