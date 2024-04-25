const selectors = {
  shopPayWrapper: '[data-shop-pay-wrapper]',
  shopLoginButton: 'shop-login-button',
  shopFollowButton: 'shop-follow-button',
  followOnShopButton: 'follow-on-shop-button',
  heartIcon: 'heart-icon',
  shopLogo: 'shop-logo',
};

const sections = {};

class ShopPayLink {
  constructor(container) {
    this.container = container;
    this.shopPayWrapper = document.querySelector(selectors.shopPayWrapper);
    this.shopLoginButton = document.querySelector(selectors.shopLoginButton);

    this.init();
  }

  init() {
    if (!this.shopLoginButton || !this.shopPayWrapper) return;

    const bgColor = this.shopPayWrapper.dataset.bg || 'transparent';
    const textColor = this.shopPayWrapper.dataset.text || '#fff';
    const hoverColor = this.shopPayWrapper.dataset.hover || '#fff';

    this.mainButtonStyles = `
      :host {
        --bg-color: ${bgColor};
        --text-color: ${textColor};
        --hover-color: ${hoverColor};
      }

      .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--text-color);
        transition: border 0.3s ease;
      }

      .button:not(.button--following):focus-visible .follow-icon-wrapper:before,
      .button:not(.button--following):hover .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--hover-color);
      }

      .button {
        background: transparent;
        color: var(--text-color);
      }

      .following-text {
        color: var(--text-color);
      }

      .button--following:focus-visible,
      .button--following:hover {
        background: var(--bg-color);
      }

      .button:not(.button--following):focus-visible .follow-icon-wrapper:before,
      .button:not(.button--following):hover .follow-icon-wrapper:before {
        background: var(--bg-color);
        border-color: var(--hover-color);
      }
    `;

    this.svgIconsStyles = `
      :host {
        color: ${textColor};
      }
    `;

    customElements.whenDefined(selectors.shopLoginButton).then((res) => {
      requestAnimationFrame(() => {
        const shadowRoot1 = this.shopLoginButton.shadowRoot;
        const shopFollowButton = shadowRoot1?.querySelector(selectors.shopFollowButton);
        const shadowRoot2 = shopFollowButton?.shadowRoot;
        const followOnShopButton = shadowRoot2?.querySelector(selectors.followOnShopButton);
        const shadowRoot3 = followOnShopButton?.shadowRoot;

        if (shadowRoot3) this.overwriteStyles(shadowRoot3.host.shadowRoot, this.mainButtonStyles);

        const heartIcon = shadowRoot3.querySelector(selectors.heartIcon);
        const shadowRoot4 = heartIcon?.shadowRoot;
        const shopLogo = shadowRoot3.querySelector(selectors.shopLogo);
        const shadowRoot5 = shopLogo?.shadowRoot;

        if (shadowRoot4) this.overwriteStyles(shadowRoot4.host.shadowRoot, this.svgIconsStyles);
        if (shadowRoot5) this.overwriteStyles(shadowRoot5.host.shadowRoot, this.svgIconsStyles);
      });
    });
  }

  overwriteStyles(element, styles) {
    let style = document.createElement('style');
    style.innerHTML = styles;
    element.appendChild(style);
  }
}

const shopPayLink = {
  onLoad() {
    sections[this.id] = new ShopPayLink(this.container);
  },
};

export {shopPayLink};
