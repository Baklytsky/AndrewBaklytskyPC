import Ajaxinate from 'ajaxinate';

const selectors = {
  ajaxinateContainer: '#AjaxinateLoop',
  ajaxinatePagination: '#AjaxinatePagination',
};

const attributes = {
  ajaxinateId: 'data-ajaxinate-id',
};

const classes = {
  isLoaded: 'is-loaded',
};

let sections = {};

class Ajaxify {
  constructor(container) {
    this.container = container;
    this.endlessScroll = [];

    if (theme.settings.enableInfinityScroll) {
      this.init();
    }
  }

  init() {
    this.loadMoreFix();

    this.ajaxinateContainer = this.container.querySelectorAll(selectors.ajaxinateContainer);

    this.ajaxinateContainer.forEach((element) => {
      const ajaxinateContainer = `${selectors.ajaxinateContainer}[${attributes.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
      const ajaxinatePagination = `${selectors.ajaxinatePagination}[${attributes.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
      const hasChildren = element.children.length > 0;

      if (hasChildren) {
        const endlessScroll = new Ajaxinate({
          container: ajaxinateContainer,
          pagination: ajaxinatePagination,
          method: 'scroll',
        });

        element.classList.add(classes.isLoaded);

        this.endlessScroll.push(endlessScroll);
      }
    });
  }

  update(id) {
    // Get the elements again, since fetching contents from Filtering or Tabs bring newly rendered DOM elements
    this.ajaxinateContainer = this.container.querySelectorAll(selectors.ajaxinateContainer);

    const instanceIDMatch = (instance) => instance.settings.container === id;
    const elementIDMatch = (element) => `${selectors.ajaxinateContainer}[${attributes.ajaxinateId}="${element.dataset.ajaxinateId}"]` === id;

    // Compare `Ajaxinate` instances, destroy already initialised ones and remove them from `this.endlessScroll` array
    const instanceExists = this.endlessScroll.find(instanceIDMatch);
    if (instanceExists) {
      const index = this.endlessScroll.findIndex(instanceIDMatch);
      this.endlessScroll.splice(index, 1);
      // Revert back the method from 'click' to 'scroll' to prevent Ajaxinate JS errors with removing event listeners on destroy
      instanceExists.settings.method = 'scroll';
      instanceExists.destroy();
    }

    // Find whether the DOM elements match the ID passed to the `update()` method and init new `Ajaxinate` instance
    const element = [...this.ajaxinateContainer].find(elementIDMatch);

    if (!element) return;

    const ajaxinateContainer = `${selectors.ajaxinateContainer}[${attributes.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
    const ajaxinatePagination = `${selectors.ajaxinatePagination}[${attributes.ajaxinateId}="${element.dataset.ajaxinateId}"]`;
    const hasChildren = element.children.length > 0;

    if (!hasChildren) return;

    const endlessScroll = new Ajaxinate({
      container: ajaxinateContainer,
      pagination: ajaxinatePagination,
      method: 'scroll',
    });

    element.classList.add(classes.isLoaded);
    this.endlessScroll.push(endlessScroll);
  }

  loadMoreFix() {
    // Fix ajaxinate in theme editor
    Ajaxinate.prototype.loadMore = function loadMore() {
      this.request = new XMLHttpRequest();

      this.request.onreadystatechange = function success() {
        if (!this.request.responseXML) {
          return;
        }
        if (!this.request.readyState === 4 || !this.request.status === 200) {
          return;
        }

        const newContainer = this.request.responseXML.querySelector(this.settings.container);
        const newPagination = this.request.responseXML.querySelector(this.settings.pagination);

        this.containerElement.insertAdjacentHTML('beforeend', newContainer.innerHTML);

        if (typeof newPagination === 'undefined' || newPagination === null) {
          this.removePaginationElement();
        } else {
          this.paginationElement.innerHTML = newPagination.innerHTML;

          if (this.settings.callback && typeof this.settings.callback === 'function') {
            this.settings.callback(this.request.responseXML);
          }

          this.initialize();
        }
      }.bind(this);

      this.request.open('GET', this.nextPageUrl, true);
      this.request.responseType = 'document';
      this.request.send();
    };
  }

  unload() {
    if (this.endlessScroll.length > 0) {
      this.endlessScroll.forEach((instance) => {
        instance.settings.method = 'scroll';
        instance.destroy();
      });
      this.ajaxinateContainer.forEach((element) => element.classList.remove(classes.isLoaded));
    }
  }
}

const ajaxify = {
  onLoad() {
    sections = new Ajaxify(this.container);
  },
  onUnload: function () {
    if (typeof sections.unload === 'function') {
      sections.unload();
    }
  },
};

export {ajaxify, Ajaxify};
