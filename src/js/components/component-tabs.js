if (!customElements.get('tabs-component')) {
  class TabsComponent extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.selectors = {
        tabButtonsContainer: '[role="tablist"]',
        tabButton: '[role="tab"]',
        tabPanel: '[role="tabpanel"]'
      }

      if (!this.querySelector(this.selectors.tabButtonsContainer)) return;

      this.tabs = Array.from(this.querySelector(this.selectors.tabButtonsContainer).querySelectorAll(this.selectors.tabButton));
      this.tabpanels = Array.from(this.querySelectorAll(this.selectors.tabPanel));
      this.preventOnClick = this.getAttribute('data-prevent-on-click') === 'true';

      this.querySelector(this.selectors.tabButtonsContainer)
        .addEventListener('click', this.onClick.bind(this));
      this.querySelector(this.selectors.tabButtonsContainer)
        .addEventListener('change', this.onClick.bind(this));
      this.querySelector(this.selectors.tabButtonsContainer)
        .addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onClick(event) {
      if (this.preventOnClick)  event.preventDefault();

      const target = event.target;

      if (event.type === 'change') {
        const tabButton = this.tabs.find(tab => tab.getAttribute('aria-controls') === target.value)
        if (tabButton) tabButton.click()
        return
      }

      if (target.getAttribute('role') === 'tab' || target.closest(this.selectors.tabButton)) {
        this.onTabClick(event);
      }
    }

    onTabClick(event) {
      const target = event.target;
      const tab = target.getAttribute('role') === 'tab' ? target : target.closest(this.selectors.tabButton);

      if (!tab) return;

      (tab.getAttribute('aria-controls') === 'show-all-tabs')
        ? this.showAllTabs(tab)
        : this.setSelectedTab(tab)
    }

    setSelectedToPreviousTab(tab) {
      let index;

      if (tab === this.tabs[0]) {
        this.setSelectedTab(tab);
      } else {
        index = this.tabs.indexOf(tab);
        this.setSelectedTab(this.tabs[index - 1], true);
      }
    }

    setSelectedToNextTab(tab) {
      let index;

      if (tab === this.tabs[this.tabs.length - 1]) {
        this.setSelectedTab(tab);
      } else {
        index = this.tabs.indexOf(tab);
        this.setSelectedTab(this.tabs[index + 1], true);
      }
    }

    setSelectedTab(tab, focus = false) {
      const tabPanelId = tab.getAttribute('aria-controls');
      const tabPanelElement = this.querySelector(`#${tabPanelId}`);
      const tabPanelsArray = Array.from(this.querySelectorAll(`[data-tab-id='${tabPanelId}']`));

      if (typeof focus !== 'boolean')  focus = true;

      //Change tabs active buttons
      this.changeActiveTabButton(tab, focus)

      //Change tabs active content blocks
      if (tabPanelElement) this.showSingleTab(tabPanelElement)
      if (tabPanelsArray.length) this.showMultipleTabs(tabPanelsArray)
      if (tabPanelId === 'show-all-tabs') this.showAllTabs(tab)

      if(AOS) AOS.refresh();
    }

    showSingleTab (tabPanelElement) {
      const panelParent = tabPanelElement.parentNode;
      const panelParentChilds = Array.from(panelParent.children);

      for (let i = 0; i < panelParentChilds.length; i++) {
        if (panelParentChilds[i].getAttribute('role') !== 'tabpanel') continue;
        (panelParentChilds[i] === tabPanelElement)
          ? this.showPanel(panelParentChilds[i])
          : this.hidePanel(panelParentChilds[i])
      }
    }

    showMultipleTabs (tabPanelsArray) {
      this.tabpanels.forEach(panel => (tabPanelsArray.includes(panel)) ? this.showPanel(panel) : this.hidePanel(panel))
    }

    hidePanel(panel) {
      panel.setAttribute('hidden', true);
      panel.removeAttribute('aria-selected', true);
      panel.tabIndex = -1;
    }

    showPanel(panel) {
      panel.removeAttribute('hidden');
      panel.setAttribute('aria-selected', true);
      panel.tabIndex = 0;
    }

    onKeyDown(event) {
      const target = event.target;
      const tab = target.getAttribute('role') === 'tab' ? target : target.closest(this.selectors.tabButton);

      switch (event.key) {
        case 'ArrowLeft':
          this.setSelectedToPreviousTab(tab);
          break;

        case 'ArrowRight':
          this.setSelectedToNextTab(tab);
          break;

        case 'Home':
          this.setSelectedTab(this.tabs[0], true);
          break;

        case 'End':
          this.setSelectedTab(this.tabs[this.tabs], true);
          break;

        default:
          break;
      }
    }

    changeActiveTabButton (tab, focus) {
      tab.closest(this.selectors.tabButtonsContainer)
        .querySelectorAll(this.selectors.tabButton)
        .forEach(item => {
          if (item === tab) {
            item.setAttribute('aria-selected', true);
            item.tabIndex = 0;

            if (focus)  item.focus();
          } else {
            if (item.closest('tabs-component') === this) {
              item.setAttribute('aria-selected', false);
              item.tabIndex = -1;
            }
          }
        });
    }

    showAllTabs(tab) {
      this.changeActiveTabButton(tab, true)
      this.tabpanels.forEach(panel => this.showPanel(panel))
    }
  }

  customElements.define('tabs-component', TabsComponent);
}
