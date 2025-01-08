if (!customElements.get('footer-gorgias-chat-button')) {
  customElements.define('footer-gorgias-chat-button', class FooterGorgiasChatButton extends HTMLElement {
    constructor() {
      super();

      this.init();
      this.template = this.dataset.templateName;
    }

    init() {
      if (typeof GorgiasChat != "undefined" && GorgiasChat != null ) {
        GorgiasChat.init().then(() => {
          this.style.display = 'block';

          this.buttonClick();

          this.changeVisibilityChatButton();

          GorgiasChat.on('widget:opened', () => {
            this.changeVisibilityChatButton(true);
          })
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
      if (set) sessionStorage.setItem("showGorgiasChatButton", 'true');
      const visible = sessionStorage.getItem("showGorgiasChatButton");

      if (!visible) return false;

      setTimeout(() => {
        const chatButton = document.querySelector('#chat-button');

        if (chatButton) chatButton.style.display = 'block';
      }, 2000)
    }
  });
}
