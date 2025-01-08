if (!customElements.get('product-gorgias-chat-button')) {
  customElements.define('product-gorgias-chat-button', class ProductGorgiasChatButton extends HTMLElement {
    constructor() {
      super();

      this.init();
    }

    init() {
      if (typeof GorgiasChat != "undefined" && GorgiasChat != null ) {
        GorgiasChat.init().then(() => {
          this.style.display = 'block';

          this.buttonClick();

          this.changeVisibilityChatButton();
        })
      }
    }

    buttonClick() {
      this.querySelector('button').addEventListener('click', () => {
        this.changeVisibilityChatButton(true);

        if (GorgiasChat.isOpen()) {
          GorgiasChat.close();
        } else {
          GorgiasChat.open();
        }
      });
    }

    changeVisibilityChatButton(set) {
      let timeout = 2000;
      if (set) {
        sessionStorage.setItem("showGorgiasChatButton", 'true');
        timeout = 0;
      }
      const visible = sessionStorage.getItem("showGorgiasChatButton");

      if (!visible) return false;

      setTimeout(() => {
        const chatButton = document.querySelector('#chat-button');

        if (chatButton) chatButton.style.display = 'block';
      }, timeout)
    }
  });
}
