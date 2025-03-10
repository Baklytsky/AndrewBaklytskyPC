export default class RaTabs extends HTMLElement {
  constructor() {
    super();
    this.tabButtons = this.querySelectorAll("[data-tab]");
    this.tabContainer = this.querySelector("[data-tab-container]");
    this.tabPanels = this.tabContainer.querySelectorAll("[data-tab-target]");
    this.init();
  }

  init() {
    this.setActiveTab(this.tabButtons[0]);
    this.toggleTab();
  }

  toggleTab() {
    this.tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.setActiveTab(button);
      });
    });
  }

  setActiveTab(button) {
    if (button.classList.contains("active")) return false;
    const tabId = button.dataset.tab;
    const selectedTabPanel = this.tabContainer.querySelector(
      `[data-tab-target="${tabId}"]`
    );
    const contentHeight = selectedTabPanel.children[0].offsetHeight;

    this.tabPanels.forEach((panel) => {
      if (panel !== selectedTabPanel) {
        panel.classList.remove("active");
        panel.style.height = "0px";
      }
    });

    selectedTabPanel.classList.add("active");
    selectedTabPanel.style.height = `${contentHeight}px`;

    this.tabButtons.forEach((button) => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", false);
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", true);
  }
}
