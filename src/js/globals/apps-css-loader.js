(function () {
  const loaded = new Set();

  function loadCssOnce(key, href) {
    if (loaded.has(key)) return;
    loaded.add(key);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function watchForSelector({key, href, selectors, timeoutMs = null, checkFn}) {
    const hasMatch = () => {
      // Run custom check function first if provided
      if (checkFn && checkFn()) {
        return true;
      }
      // Fallback to selector check
      return selectors.some((s) => document.querySelector(s));
    };

    if (hasMatch()) {
      loadCssOnce(key, href);
      return;
    }

    const obs = new MutationObserver(() => {
      if (!hasMatch()) return;
      obs.disconnect();
      loadCssOnce(key, href);
    });

    obs.observe(document.documentElement, {childList: true, subtree: true});

    // Only set timeout if explicitly provided (allows indefinite watching for late-loading widgets)
    if (timeoutMs !== null && timeoutMs !== undefined) {
      window.setTimeout(() => obs.disconnect(), timeoutMs);
    }
  }

  const apps = {
    junip: {
      key: 'headlands-junip',
      href: window.theme.assets.junipCss,
      selectors: ['.junip-product-summary', '#junip-product-reviews', '[data-junip-reviews]'],
      checkFn: () => {
        // Check for window.junip (object) or window.junipLoaded (boolean)
        return (typeof window.junip === 'object' && window.junip !== null) || window.junipLoaded === true;
      },
    },
    recharge: {
      key: 'headlands-recharge',
      href: window.theme.assets.rechargeCss,
      selectors: ['[data-recharge-subscription-widget]', '.rc-widget', '.recharge-subscription-widget', '.recharge-gifting-widget'],
      checkFn: () => {
        return typeof window.Recharge === 'object' && window.Recharge !== null;
      },
    },
  };

  Object.values(apps).forEach((app) => {
    watchForSelector(app);
  });
})();
