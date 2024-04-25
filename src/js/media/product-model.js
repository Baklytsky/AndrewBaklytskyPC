theme.ProductModel = (function () {
  let modelJsonSections = {};
  let models = {};
  let xrButtons = {};

  const selectors = {
    productMediaWrapper: '[data-product-single-media-wrapper]',
    mediaGroup: '[data-product-single-media-group]',
    productXr: '[data-shopify-xr]',
    mediaId: 'data-media-id',
    model3d: 'data-shopify-model3d-id',
    modelViewer: 'model-viewer',
    modelJson: '#ModelJson-',
    deferredMedia: '[data-deferred-media]',
    deferredMediaButton: '[data-deferred-media-button]',
  };
  const classes = {
    isLoading: 'is-loading',
    mediaHidden: 'media--hidden',
  };

  function init(mediaContainer, sectionId) {
    modelJsonSections[sectionId] = {
      loaded: false,
    };

    const deferredMediaButton = mediaContainer.querySelector(selectors.deferredMediaButton);

    if (deferredMediaButton) {
      deferredMediaButton.addEventListener('click', loadContent.bind(this, mediaContainer, sectionId));
    }
  }

  function loadContent(mediaContainer, sectionId) {
    if (mediaContainer.querySelector(selectors.deferredMedia).getAttribute('loaded')) {
      return;
    }

    mediaContainer.classList.add(classes.isLoading);
    const content = document.createElement('div');
    content.appendChild(mediaContainer.querySelector('template').content.firstElementChild.cloneNode(true));
    const modelViewerElement = content.querySelector('model-viewer');
    const deferredMedia = mediaContainer.querySelector(selectors.deferredMedia);
    deferredMedia.appendChild(modelViewerElement);
    deferredMedia.setAttribute('loaded', true);
    const mediaId = mediaContainer.dataset.mediaId;
    const modelId = modelViewerElement.dataset.modelId;
    const xrButton = mediaContainer.closest(selectors.mediaGroup).parentElement.querySelector(selectors.productXr);
    xrButtons[sectionId] = {
      element: xrButton,
      defaultId: modelId,
    };

    models[mediaId] = {
      modelId: modelId,
      mediaId: mediaId,
      sectionId: sectionId,
      container: mediaContainer,
      element: modelViewerElement,
    };

    if (!window.ShopifyXR) {
      window.Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
          onLoad: setupShopifyXr,
        },
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: setupModelViewerUi,
        },
      ]);
    } else {
      setupModelViewerUi();
    }
  }

  function setupShopifyXr(errors) {
    if (errors) {
      console.warn(errors);
      return;
    }
    if (!window.ShopifyXR) {
      document.addEventListener('shopify_xr_initialized', function () {
        setupShopifyXr();
      });
      return;
    }

    for (const sectionId in modelJsonSections) {
      if (modelJsonSections.hasOwnProperty(sectionId)) {
        const modelSection = modelJsonSections[sectionId];

        if (modelSection.loaded) {
          continue;
        }

        const modelJson = document.querySelector(`${selectors.modelJson}${sectionId}`);

        if (modelJson) {
          window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
          modelSection.loaded = true;
        }
      }
    }

    window.ShopifyXR.setupXRElements();
  }

  function setupModelViewerUi(errors) {
    if (errors) {
      console.warn(errors);
      return;
    }

    for (const key in models) {
      if (models.hasOwnProperty(key)) {
        const model = models[key];
        if (!model.modelViewerUi) {
          model.modelViewerUi = new Shopify.ModelViewerUI(model.element);
          setupModelViewerListeners(model);
        }
      }
    }
  }

  function setupModelViewerListeners(model) {
    const xrButton = xrButtons[model.sectionId];
    model.container.addEventListener('theme:media:visible', function () {
      xrButton.element.setAttribute(selectors.model3d, model.modelId);

      if (window.theme.touch) {
        return;
      }

      model.modelViewerUi.play();
      model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
    });

    model.container.addEventListener('theme:media:hidden', function () {
      model.modelViewerUi.pause();
    });

    model.container.addEventListener('xrLaunch', function () {
      model.modelViewerUi.pause();
    });

    model.element.addEventListener('load', () => {
      xrButton.element.setAttribute(selectors.model3d, model.modelId);
      model.container.classList.remove(classes.isLoading);
      model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
    });

    model.element.addEventListener('shopify_model_viewer_ui_toggle_play', function () {
      pauseOtherMedia(model.mediaId);
      setTimeout(() => {
        // Timeout to trigger play event after pause events
        model.container.dispatchEvent(new CustomEvent('theme:media:play'), {bubbles: true});
      }, 50);
    });
    model.element.addEventListener('shopify_model_viewer_ui_toggle_pause', function () {
      model.container.dispatchEvent(new CustomEvent('theme:media:pause'), {bubbles: true});
    });

    pauseOtherMedia(model.mediaId);
  }

  function pauseOtherMedia(mediaId) {
    const currentMedia = `[${selectors.mediaId}="${mediaId}"]`;
    const otherMedia = document.querySelectorAll(`${selectors.productMediaWrapper}:not(${currentMedia})`);

    if (otherMedia.length) {
      otherMedia.forEach((media) => {
        media.dispatchEvent(new CustomEvent('theme:media:hidden'), {bubbles: true});
        media.classList.add(classes.mediaHidden);
      });
    }
  }

  function removeSectionModels(sectionId) {
    for (const key in models) {
      if (models.hasOwnProperty(key)) {
        const model = models[key];
        if (model.sectionId === sectionId) {
          delete models[key];
        }
      }
    }
    delete modelJsonSections[sectionId];
    delete theme.mediaInstances[sectionId];
  }

  return {
    init: init,
    loadContent: loadContent,
    removeSectionModels: removeSectionModels,
  };
})();
