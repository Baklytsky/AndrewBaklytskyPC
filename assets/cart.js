if (!customElements.get('cart-popup')) {

  class CartPopup extends HTMLElement {
    constructor() {
      super();

      this.popup = document.getElementById('cart-popup');
      this.header = document.querySelector('sticky-header');
      this.quickView = document.querySelector('#quick-view');
      this.headerMegaMenu = document.querySelector('header-mega-menu');
      this.mobileMenuModal = document.querySelector('#MobileMenuModal')
      this.onBodyClick = this.handleBodyClick.bind(this);

      document.addEventListener('openCart', this.open.bind(this));

      this.openCart = document.getElementById('cart-icon-bubble');
      this.openCart.addEventListener('click', (evt) => {
        evt.preventDefault();
        document.dispatchEvent(new Event('openCart'));
      });

      this.popup.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());

      this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
        closeButton.addEventListener('click', this.close.bind(this))
      );
  
      
      document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.cart-item__remove');
        if  (!removeBtn) return;

        e.preventDefault();
        const key = e.target.closest('.cart-item__remove').getAttribute('data-key')
        const update = {[key]: 0}
        this.setSessionStorage(key);
        this.updateCartQuantity(update, false);
      }, false);
      
      this.checkUrl();

      document.addEventListener('submit', async (e) => {
        if (e.target.action === `${window.shopUrl}/cart`) {
          e.preventDefault();
          await this.getCheckoutAttributes(e.target);
        }
      })
    }

    async getCheckoutAttributes(target) {
      const attributes = {};
      const formData = new FormData(target);
      let shippingAttr = '';

      for (const entry of formData.entries()) {
        if (entry[0].includes("attributes[")) {
          if (entry[0] === 'attributes[shipping_estimate_days]') shippingAttr = entry[1];
          const attributeName = entry[0].split("[")[1].split("]")[0];
          if (typeof entry[1] === 'string') {
            attributes[attributeName] = entry[1];
          }
        }
      }

      attributes['__gwp'] = this.getGwpAttributes();
      attributes['shipping_estimate_days'] = shippingAttr;

      const headers = new Headers({'Content-Type': 'application/json'});
      const request = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({attributes: attributes})
      };

      try {
        await fetch(`${routes.cart_update_url}`, request);
        location.href = '/checkout'
      } catch (e) {
        console.log(e);
        location.href = '/checkout'
      }
    }

    getGwpAttributes(){
      const textObj = this.querySelector('[data-gwp-conditions]')?.textContent
      if (!textObj) return null;
      try {
        const gwpData = JSON.parse(textObj);
        if (!gwpData || typeof gwpData !== "object") return null;

        const removedGWPs = JSON.parse(sessionStorage.getItem('RemovedGWP')) || [];

        if (removedGWPs.length) {
          const removedGWPIds = removedGWPs.map(item => item.split(':')[0]);
          gwpData.__gwp = [...gwpData.__gwp]
            .map(gwp => {
                gwp['ids'] = gwp['ids'].filter(id => !removedGWPIds.some(removedId => id.includes(removedId)));
                return gwp
              }
            ).filter(gwp => gwp['ids'].length)
        }
        
        return JSON.stringify(gwpData.__gwp);
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
        return null;
      }
    }

    open(evt, checkEmpty = false) {
      const cartEmpty = checkEmpty && this.querySelector('[data-cart-empty]')?.getAttribute('data-cart-empty') === 'true';
      // document.getElementById('shopify-section-header-b').style.zIndex = 4;

      if (cartEmpty) return false;

      if (this.mobileMenuModal.hasAttribute('open')) this.mobileMenuModal?.hide();

      if (document.querySelector("body").getAttribute('data-header-menu') === 'true' ) this.headerMegaMenu?.closeMegaMenu();

      if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      if (this.quickView.classList.contains('active')) this.quickView.classList.remove('active');

      if (modalOverlay.getAttribute('aria-hidden') === 'true') {
        modalOverlay.setAttribute('aria-hidden', 'false');
      }
      if (evt) evt.preventDefault();

      // bodyScrollLock.disableBodyScroll(this.querySelector('[role="dialog"]'));
      document.body.classList.add(`overflow-hidden`);
      this.popup.classList.add('animate', 'active');

      this.popup.addEventListener('transitionend', () => {
        this.popup.focus();
        trapFocus(this.popup);
      }, { once: true });


      document.body.addEventListener('click', this.onBodyClick);
    }

    close() {
      // document.getElementById('shopify-section-header-b').style.zIndex = 5;
      this.popup.classList.remove('active', 'animate');
      modalOverlay.setAttribute('aria-hidden', 'true');
      document.body.removeEventListener('click', this.onBodyClick);
      removeTrapFocus(this.activeElement);
      // bodyScrollLock.clearAllBodyScrollLocks();
      document.body.classList.remove(`overflow-hidden`);
    }

    renderContent(responseHtml, openCart = true) {
      const popupCart = document.getElementById('cart-popup-inner');
      const parseDiv = responseHtml.getElementById('cart-items-content');
      const cartEmpty = parseDiv.getAttribute('data-cart-empty') === 'true';

      if (cartEmpty) {
        document.getElementById('cart-icon-bubble').dataset.cartEmpty = 'true';
        this.close();
      } else {
        document.getElementById('cart-icon-bubble').dataset.cartEmpty = 'false';
        if (openCart) this.open();
      }

      popupCart.innerHTML = parseDiv.innerHTML;
      this.setActiveElement(popupCart.querySelector('cart-items'));
    }

    handleBodyClick(evt) {
      const target = evt.target;

      if (target !== this.popup && !target.closest('cart-popup') && !target.closest('#cart-icon-bubble')) {
        const disclosure = target.closest('details-disclosure');

        this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
        this.close();
      }
    }

    setActiveElement(element) {
      this.activeElement = element;
    }

    checkUrl() {
      const params = new URLSearchParams(window.location.search);

      if (params.has('cart')) {
        params.delete('cart');
        this.open(null, true);
        var deletePathName = params.toString().length ? `?${params.toString()}` : '' ;
        var newUrl = `${window.location.origin}${window.location.pathname}${deletePathName}`;
        window.history.pushState(null, null, newUrl);
      }
    }

    trackAnalyticsAddItemsData(itemsData) {
      const items = itemsData
        .filter(item => {
          return !(item.properties && item.properties['_gwp']);
        })
        .map(item => {
          return {
            id: `${item.id}`,
            name: `${item.title}`,
            brand: `${item.vendor}`,
            price:  parseInt(item.final_price, 10) / 100,
            quantity: item.quantity,
            variant: `${item.variant_title}`
          }
      });

      if (items.length) {
        gtag("event", "add_to_cart", {
          items: items
        });
      }
    }

    cartFetch (fetchUrl, formDataOrItems, openCart, renderCart = true, successCallback, catchCallback, finallyCallback) {
      const sectionsId = 'main-cart';
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';

      if (formDataOrItems instanceof FormData) {
        delete config.headers['Content-Type'];
        formDataOrItems.append('sections', sectionsId);
        formDataOrItems.append('sections_url', window.location.pathname);
        config.body = formDataOrItems;
      } else {
        const bodyObject = {
          items: formDataOrItems,
          sections: sectionsId,
          sections_url: window.location.pathname
        }
        if (fetchUrl === routes.cart_update_url) {
          bodyObject.updates = bodyObject.items;
          delete bodyObject.items;
        }
        config.body = JSON.stringify(bodyObject);
      }

      fetch(fetchUrl, config)
          .then((response) => response.json())
          .then((data) => {
            if (successCallback) successCallback(data);
            const newHtml = new DOMParser().parseFromString(data.sections[sectionsId], 'text/html');
            // this.trackAnalyticsAddItemsData(json.items);
            if (renderCart) this.renderContent(newHtml, openCart);
          })
          .catch((error) => {
            if (catchCallback) catchCallback();
            console.error(error);
          })
          .finally(() => {
            if (finallyCallback) finallyCallback();
          });
    }

    addToCart(formDataOrItems, openCart, renderCart, successCallback, catchCallback, finallyCallback) {
      this.cartFetch (`${routes.cart_add_url}`, formDataOrItems, openCart, renderCart, successCallback, catchCallback, finallyCallback)
    }

    updateCartQuantity(updates, openCart, renderCart, successCallback, catchCallback, finallyCallback) {
      this.cartFetch (`${routes.cart_update_url}`, updates, openCart, renderCart, successCallback, catchCallback, finallyCallback)
    }

    checkSessionStorage(Ids) {
      const removedGWPs = JSON.parse(sessionStorage.getItem('RemovedGWP')) || [];
      const removedIds = removedGWPs.map(item => item.split(':')[0]);
      return Ids.filter(id => !removedIds.includes(id));
    }

    clearSessionStorage() {
      const removedGWPs = JSON.parse(sessionStorage.getItem('RemovedGWP')) || [];
      if (removedGWPs.length > 0) sessionStorage.removeItem('RemovedGWP')
    }

    setSessionStorage(key) {
      const removedGWPs = JSON.parse(sessionStorage.getItem('RemovedGWP')) || [];
      removedGWPs.push(key);
      sessionStorage.setItem('RemovedGWP', JSON.stringify(removedGWPs));
    }

    removeGWPs(keysArr, quantity = 0, renderCart, successCallback) {
      const dataUpdates = keysArr
          .filter(id => id.length > 0)
          .reduce((acc, id) => ({...acc, [id]: quantity}), {});

      if (Object.keys(dataUpdates).length) {
        this.updateCartQuantity(dataUpdates, false, renderCart, successCallback);
      }
    }
  }

  customElements.define('cart-popup', CartPopup);

  class CartItems extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', this.onChange.bind(this));
      this.cartPopup = document.querySelector('cart-popup');

      setTimeout(() => {
        this.buttonCloseCart = document.querySelector('#close-cart-popup');
        if (this.buttonCloseCart) this.buttonCloseCart.addEventListener('click', this.close.bind(this));
      }, 500);

      this.giftWithPurchase();
      this.checkInitialsPayment();
      this.scriptDiscountCheck(true, true, true);
    }


    close() {
      this.cartPopup.close();
    }

    onChange(event) {
      this.changeQuantity(event.target.dataset.key, event.target.value, document.activeElement.getAttribute('name'));
    }

    setActiveElement(element) {
      this.activeElement = element;
    }

    changeQuantity(key, quantity, openCart) {
      const sectionsId = 'main-cart';

      this.enableLoading(key);
      const body = JSON.stringify({
        id: key,
        quantity,
        sections: sectionsId,
        sections_url: window.location.pathname
      });

      fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          const newHtml = new DOMParser().parseFromString(json.sections[sectionsId], 'text/html');

          this.disableLoading();
          this.cartPopup.renderContent(newHtml, openCart);
        })

        .catch((error) => {
          console.error(error);
          this.disableLoading();
        });
    }

    enableLoading(key) {
      const elem = document.getElementById(`CartItem-${key}`);
      if (!elem) return false

      elem.classList.add('cart__item--disabled');
      this.classList.add('disabled');
      this.querySelector('.checkout__button .button').setAttribute('disabled', '');
      document.activeElement.blur();
    }

    disableLoading() {
      this.querySelectorAll(`.cart-item`).forEach((item) => item.classList.remove('cart__item--disabled'));
      this.classList.remove('disabled');
      this.querySelector('.checkout__button .button').removeAttribute('disabled');
    }

    async giftWithPurchase() {
      const gwpScript = this.querySelector('[data-gwp]')?.textContent;
      if (!gwpScript) return;

      const {
        gwp_items_to_remove: gwpItemsToRemove,
        gwp_items_to_add: gwpItemsToAdd,
        set_qwp_qty_to_1: setGwpQtyTo1,
        clear_gwp_session_storage: clearGwpSessionStorage
      } = JSON.parse(gwpScript);

      const addData = this.gwpAddData(gwpItemsToAdd)
      const renderCartOnRemove = addData.length <= 0;
      let gwpWasAdded = false;
      const setQtyTo1 = async () => {
        if (setGwpQtyTo1.length > 0) {
          await new Promise((resolve, reject) => {
            this.cartPopup.removeGWPs(setGwpQtyTo1, 1, false, resolve);
          }).then(() => remove())
        }
      }
      const remove = async () => {
        if (gwpItemsToRemove.length > 0) {
          await new Promise((resolve, reject) => {
            this.cartPopup.removeGWPs(gwpItemsToRemove, 0, renderCartOnRemove, resolve);
          }).then(() => add())
        }
      }
      const add = () => {
        if (addData.length > 0 && !gwpWasAdded) {
          gwpWasAdded = true;
          this.cartPopup.addToCart(addData, false, true);
        }
      }

      if (clearGwpSessionStorage) this.cartPopup.clearSessionStorage()
      await setQtyTo1();
      await remove();
      add();
    }

    gwpAddData(gwpItemsToAdd) {
      let data = [];
      if (gwpItemsToAdd.length > 0) {
        const itemsToAdd = this.cartPopup.checkSessionStorage(gwpItemsToAdd);
        if (itemsToAdd.length <= 0) return data;

        data = itemsToAdd.filter(id => id.length > 0)
            .map(id => ({
              id,
              quantity: 1,
              properties: {"_gwp": "true"}
            }));
      }
      return data;
    }

    scriptDiscountCheck(applyOnPdp, applyOnMiniCard, applyOnMiniCardAny) {
      const scriptSelector = this.querySelector('[data-script-discount]');

      if (!scriptSelector) return false;

      const data = JSON.parse(scriptSelector.textContent);
      const {enable, tagIsApplied} = data;
      const apply = enable && tagIsApplied;

      if (enable && applyOnMiniCardAny) {
        const miniCardsPrices = document.querySelectorAll('product-card-mini');

        miniCardsPrices.forEach(el => {
          if (el.getAttribute('data-always-apply-discount-script') !== 'true') return false;

          this.scriptDiscountApplyMiniCard(el);
        });
      }
      
      if (!apply) {
        const miniCardsPrices = document.querySelectorAll('product-card-mini');
  
        miniCardsPrices.forEach(el => {
          el.dispatchEvent(new CustomEvent('updatePrice'));
        });
      } else {
        // Product Page
        if (applyOnPdp) this.scriptDiscountApplyProductPage();
  
        // Mini card
        if (applyOnMiniCard) this.scriptDiscountApplyMiniCards();
      }
    }


    scriptDiscountApplyProductPage() {
      const productPriceWrappers = document.querySelectorAll('.product-price .price');

      productPriceWrappers.forEach((productPriceWrapper) => {
        const elHasDiscountTag = productPriceWrapper?.getAttribute('data-discount-tag');

        if (!productPriceWrapper || !elHasDiscountTag || isNaN(elHasDiscountTag)) return false;

        const discountValue = parseInt(elHasDiscountTag, 10);

        const priceRegular = productPriceWrapper.querySelector('.price__regular');
        const priceValue = priceRegular.getAttribute('data-price-value');

        const priceSaleWrapper = productPriceWrapper.querySelector('.price__sale');
        const compareAtPrice = priceSaleWrapper.querySelector('.price-item--sale');
        const priceSelector = priceSaleWrapper.querySelector('.price-item--regular');

        const newPrice = priceValue - (priceValue / 100 * discountValue);
        const newPriceFormat = formatMoney(newPrice, '{{amount}}');
        const oldPriceFormat = formatMoney(priceValue, '{{amount}}');

        productPriceWrapper.classList.add('price--on-sale');
        priceRegular.style.display = 'none';
        priceSaleWrapper.style.display = 'flex';

        priceSelector.innerHTML = oldPriceFormat;
        compareAtPrice.innerHTML = newPriceFormat;
      })
    }

    scriptDiscountApplyMiniCards() {
      const miniCardsPrices = document.querySelectorAll('product-card-mini');
      miniCardsPrices.forEach(el => {
        this.scriptDiscountApplyMiniCard(el);
      });
    }

    scriptDiscountApplyMiniCard(el) {
      const elHasDiscountTag = el.getAttribute('data-discount-tag');

      if (!elHasDiscountTag || isNaN(elHasDiscountTag)) return false;

      const discountValue = parseInt(elHasDiscountTag, 10);
      const elPriceWrapper = el.getAttribute('data-price-selector');
      const priceSelector = el.querySelector(`${elPriceWrapper} [data-price]`);
      const compareAtPriceSelector = el.querySelector(`${elPriceWrapper} [data-compare-price]`);
      const priceValue = priceSelector.getAttribute('data-price');

      const newPrice = priceValue - (priceValue / 100 * discountValue);
      const newPriceFormat = formatMoney(newPrice, '{{amount}}');
      const oldPriceFormat = formatMoney(priceValue, '{{amount}}');

      compareAtPriceSelector.style.display = '';
      compareAtPriceSelector.innerHTML = oldPriceFormat;
      priceSelector.innerHTML = newPriceFormat;
    }

    async checkInitialsPayment() {
      const paymentId = Number(window.pdp.payment_for_initials_id);
      const cart = await this.getCartState();
      const itemsWithInitials = cart.items.filter(item => item.properties['initials']);
      const initialPayments = cart.items.filter(item => window.handleize(item['product_type']) === window.pdp.payment_for_initials_type);
      if (!itemsWithInitials.length && !initialPayments.length) return;

      let updates = {};

      if (!paymentId) {
        if (initialPayments.length) initialPayments.forEach(payment => updates[`${payment.key}`] = 0)
        if (itemsWithInitials.length) itemsWithInitials.forEach(item => updates[`${item.key}`] = 0)
      }

      if (!itemsWithInitials.length && initialPayments.length) {
        initialPayments.forEach(payment => updates[`${payment.key}`] = 0)
      }

      if (itemsWithInitials.length) {
        const quantityArr = itemsWithInitials.map(item => item.quantity);
        const paymentsQuantity = quantityArr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        updates = initialPayments.length
            ? {...updates, ...this.getUpdates(paymentsQuantity, initialPayments[0])}
            : [{id: paymentId, quantity: paymentsQuantity}]
      }

      if (Object.keys(updates).length || updates.length) {
        if (initialPayments.length) {
          await this.cartPopup.updateCartQuantity(updates, false)
        } else {
          await this.cartPopup.addToCart(updates, false)
        }
      }
    }

    getUpdates = (quantity, item)=> {
      const updates = {};
      if (quantity !== item.quantity) {
        updates[`${item.key}`] = quantity ? quantity : 0;
      }
      return updates
    }

    async getCartState() {
      try {
        const response = await fetch('/cart.js');
        return await response.json();
      } catch (error) {
        console.error(error);
      }
    }
  }
  customElements.define('cart-items', CartItems);
}