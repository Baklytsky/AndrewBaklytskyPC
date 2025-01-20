if (!customElements.get('cart-popup')) {
  class CartPopup extends ModalDialog {
    constructor() {
      super()

      this.sectionId = this.getAttribute('data-section-id');
      this.cartHeader = this.querySelector('.cart-popup__header-wrapper');
      this.headerBubble = document.querySelector(".header__icon--cart");
      this.targetElementScrollLock = this.hasAttribute('data-target-scroll-lock') ? this.querySelector(this.getAttribute('data-target-scroll-lock')) : this;
      this.selectItemEventProd = this.querySelectorAll('[data-select-item-event-trigger]');

      this.init ();
    }

    init () {
      if (this.cartHeader) document.documentElement.style.setProperty('--cart-header-height', this.cartHeader.offsetHeight + 'px');

      window.cartPopup = this;
      this.checkUrl();

      if (this.selectItemEventProd) {
        this.selectItemEventProd.forEach((elem) => {elem.addEventListener('click', (e) => {
          const data = JSON.parse(e.target.closest('product-form').querySelector('[data-select-item-event]').textContent);

          if(data) {
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push(data)
          }
        })})
      }

      document.addEventListener('click', async (e) => {
        if (e.target.getAttribute('href') === '/checkout') {
          e.preventDefault();
          const eventData = this.getAnalyticEvents();
          if (eventData) {
            window.dataLayer.push({ecommerce: null});
            window.dataLayer.push(eventData);
          }
          await this.sendGwpConditionForCheckout();
        }
      })

      document.addEventListener('og-cart-updated', e => {
        e.preventDefault();
        this.updateCartQuantity(
          false,
          true,
          true,
          null,
          null,
          null);
      });
    }

    async sendGwpConditionForCheckout() {
      let conditions = this.getGwpConditions();

      if (!conditions) location.href = '/checkout';

      try {
        const removedGWPs = JSON.parse(sessionStorage.getItem('gwpRemove')) || [];
        if (removedGWPs.length) {
          const removedGWPIds = removedGWPs.map(item => item.split(':')[0]);
          conditions.__gwp = [...conditions.__gwp].filter(condition =>
            !removedGWPIds.some(id => condition.id.includes(id))
          );
        }
      } catch (e) {
        console.log(e)
      }

      if (conditions && conditions.__gwp) {
        conditions.__gwp = JSON.stringify(conditions.__gwp);
      }

      const headers = new Headers({'Content-Type': 'application/json'});
      const request = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({attributes: conditions})
      };

      try {
        await fetch(`${routes.cart_update_url}`, request);
        location.href = '/checkout';
      } catch (e) {
        console.log(e);
        location.href = '/checkout';
      }
    }

    getAnalyticEvents(){
      const data = this.querySelector('[data-begin-checkout]')?.textContent
      if (!data) return null;

      try {
        const eventData = JSON.parse(data);
        return eventData && typeof eventData === "object" ? eventData : null;
      } catch (error) {
        console.log('Error parsing eventData JSON:', error.message);
        return null;
      }
    }

    getGwpConditions(){
      const textObj = this.querySelector('[data-gwp-conditions]')?.textContent
      if (!textObj) return null;
      try {
        const parsedData = JSON.parse(textObj);
        return parsedData && typeof parsedData === "object" ? parsedData : null;
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
        return null;
      }
    }

    openCart() {
      this.show();
    }

    setActiveElement(element) {
      this.activeElement = element;
    }

    changeBubble () {
      if (!this.headerBubble) return;

      const cartCount = document.querySelector('.cart-count').textContent;
      const $cartCountBubble = document.querySelector('.cart-count-bubble');
      if (cartCount == 0) {
        $cartCountBubble.classList.add('visually-hidden');

        sessionStorage.removeItem('gwpRemove');
      } else {
        $cartCountBubble.classList.remove('visually-hidden');
      }
    }

    checkUrl() {
      const params = new URLSearchParams(window.location.search);

      if (params.has('cart')) {
        params.delete('cart');

        const deletePathName = params.toString().length ? `?${params.toString()}` : '' ;
        const newUrl = `${window.location.origin}${window.location.pathname}${deletePathName}`;
        window.history.pushState(null, null, newUrl);
        this.openCart();
      }
    }

    addToCart(items, openCart, renderContent, successCallback, catchCallback, finallyCallback) {
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';

      config.body = JSON.stringify({
        items,
        sections: this.sectionId,
        sections_url: window.location.pathname
      });

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => {
          return response.json();
        })
        .then(async (json) => {
          if (successCallback) successCallback(json);

          if (renderContent) {
            const newHtml = new DOMParser().parseFromString(json.sections[this.sectionId], 'text/html');
            this.renderContent(newHtml, openCart);
          }
        })
        .catch((error) => {
          if (catchCallback) catchCallback();
          console.error(error);
        })
        .finally(() => {
          if (finallyCallback) finallyCallback();

          this.changeBubble();
        });
    }

    cartClear() {
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';

      config.body = JSON.stringify({
        sections: this.sectionId,
        sections_url: window.location.pathname
      });
      fetch(`${routes.cart_clear_url}`, config)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          const newHtml = new DOMParser().parseFromString(json.sections[this.sectionId], 'text/html');
          this.renderContent(newHtml, true);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.changeBubble();
        });
    }

    updateCartQuantity(updates, openCart, renderContent, successCallback, catchCallback, finallyCallback) {
      const sectionsId = 'main-cart';
      const config = fetchConfig('javascript');
      const body = {
        sections: sectionsId,
        sections_url: window.location.pathname
      }
      if (updates) body.updates = updates;
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      config.body = JSON.stringify(body);

      fetch(`${routes.cart_update_url}`, config)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          if (successCallback) successCallback(json);

          if (renderContent) {
            const newHtml = new DOMParser().parseFromString(json.sections[this.sectionId], 'text/html');
            this.renderContent(newHtml, openCart);
          }
        })
        .catch((error) => {
          if (catchCallback) catchCallback();
          console.log(error);
        })
        .finally(() => {
          if (finallyCallback) finallyCallback();

          this.changeBubble();
        });
    }

    renderContent(responseHtml, openCart = true) {
      const popupCart = document.getElementById('cart-popup-inner');
      const parseDiv = responseHtml.getElementById('cart-popup-inner');
      popupCart.innerHTML = parseDiv.innerHTML;
      this.setActiveElement(popupCart.querySelector('cart-items'));

      const cartScrollContainer = document.querySelector('.cart-popup__scrolling');

      if (cartScrollContainer && this.popup.getAttribute('aria-hidden') === 'false') bodyScrollLock.disableBodyScroll(cartScrollContainer);
      if (openCart) this.openCart();
    }
  }

  customElements.define('cart-popup', CartPopup);

  class CartItems extends HTMLElement {
    constructor() {
      super ();
      this.addEventListener('change', this.onChange.bind(this));
      const removeButtons = this.querySelectorAll('.remove-button');
      removeButtons.forEach(button => button.addEventListener("click", this.removeItem.bind(this)));
      this.checkGWPProducts();

      document.addEventListener('click', (e)=> {
        if (e.target.closest('og-optin-toggle')) {
          this.classList.add('locked')
          setTimeout(() => this.classList.remove('locked'), 5000)
        }
      })
    }

    // Check if GWP products are enabled
    async checkGWPProducts() {
      const gwpData = this.querySelector(`#giftProductData[type="application/json"]`)?.textContent;
      if (!gwpData) return;

      const {
        gwp_enabled: gwpEnabled,
        gwp_items_for_remove: gwpItemsToRemove,
        set_qty_to_1: setGwpQtyTo1,
        gwp_items_for_add: gwpItemsToAdd,
        cart_clear: cartClear
      } = JSON.parse(gwpData);

      if (cartClear) {
        window.cartPopup.cartClear()
      }

      const addData = this.gwpAddData(gwpItemsToAdd)
      const renderCartOnRemove = addData.length <= 0;
      let gwpWasAdded = false;

      const setQtyTo1 = async () => {
        if (setGwpQtyTo1.length > 0) {
          await new Promise((resolve, reject) => {
            this.removeGWPs(setGwpQtyTo1, 1, false, resolve)
          }).then(() => remove())
        }
      }

      const remove = async () => {
        if (gwpItemsToRemove.length > 0) {
          await new Promise((resolve, reject) => {
            this.removeGWPs(gwpItemsToRemove, 0, renderCartOnRemove, resolve)
          }).then(() => add())
        }
      }

      const add = () => {
        if (addData.length > 0 && !gwpWasAdded) {
          gwpWasAdded = true;
          window.cartPopup.addToCart(addData, false, true, null, null, null);
        }
      }

      await setQtyTo1();
      await remove();
      add();
    }

    gwpAddData(gwpItemsToAdd) {
      let data = [];
      if (gwpItemsToAdd.length > 0) {
        const itemsToAdd = this.checkSessionStorage(gwpItemsToAdd);
        if (itemsToAdd.length <= 0) return data;

        data = itemsToAdd.filter(id => id.length > 0)
          .map(id => ({
            id,
            quantity: 1,
            properties: {
              "_free-gift": "true"
            }
          }));
      }
      return data;
    }

    // Check if any of the GWP products have been removed by the customer
    checkSessionStorage(dataIds) {
      const customerRemovesGWP = JSON.parse(sessionStorage.getItem('gwpRemove')) || [];
      const removeIds = customerRemovesGWP.map(item => item.split(':')[0]);
      return dataIds.filter(id => !removeIds.includes(id));
    }

    // Store the IDs of GWP products removed by the customer in session storage
    setSessionStorage(dataUpdates) {
      const customerRemovesGWP = JSON.parse(sessionStorage.getItem('gwpRemove')) || []; // This code retrieves an array from the gwpRemove key in the sessionStorage object using JSON.parse(), or an empty array if the key is not found or its value is falsy.
      customerRemovesGWP.push(dataUpdates);
      sessionStorage.setItem('gwpRemove', JSON.stringify(customerRemovesGWP));
    }

    removeGWPs(keysArr, quantity = 0, renderContent, callback) {
      const dataUpdates = keysArr
        .filter(id => id.trim() !== '')
        .reduce((acc, id) => ({...acc, [id]: quantity}), {});

      if (Object.keys(dataUpdates).length) {
        window.cartPopup.updateCartQuantity(dataUpdates, false,  renderContent, callback, null, null);
      }
    }

    removeItem(event) {
      event.preventDefault();
      const eventTarget = event.target.closest('.remove-button');
      let dataUpdates = {};
      if (eventTarget.classList.contains('remove-button--gwp')) this.setSessionStorage(eventTarget.dataset.key);
      dataUpdates[eventTarget.dataset.key] = 0

      window.cartPopup.updateCartQuantity(
        dataUpdates,
        false,
        true,
        null,
        null,
        null);

      const eventData =  JSON.parse(event.target.closest('.cart-item').querySelector('[type="application/ld+json"]')?.textContent);
      if (eventData) {
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push(eventData);
      }
    }

    onChange(event) {
      const eventTarget = event.target;
      const maxValue = parseInt(eventTarget.max, 10);
      const value = parseInt(eventTarget.value, 10);
      const quantity = value >= maxValue ? maxValue : value;
      let dataUpdates = {};
      dataUpdates[eventTarget.dataset.key] = Number(quantity)

      window.cartPopup.updateCartQuantity(
        dataUpdates,
        false,
        true,
        null,
        null,
        null);
    }
  }
  customElements.define('cart-items', CartItems);
}
