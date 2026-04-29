if (!customElements.get('tabs-component')) {
  customElements.define(
    'tabs-component',
    class GlobalTabs extends HTMLElement {
      constructor() {
        super();

        this.a11y = window.theme.a11y;
        this.calculateActiveBounds = this.calculateActiveBounds.bind(this);
      }

      connectedCallback() {
        const tabsNavList = this.querySelectorAll('[data-tab]');

        this.addEventListener('theme:tab:check', () => this.checkRecentTab());
        this.addEventListener('theme:tab:hide', () => this.hideRelatedTab());
        document.addEventListener('theme:resize:width', this.calculateActiveBounds);

        this.calculateActiveBounds();

        tabsNavList?.forEach((element) => {
          const tabId = parseInt(element.getAttribute('data-tab'));
          const tab = this.querySelector(`.tab-content-${tabId}`);

          element.addEventListener('click', () => {
            this.tabChange(element, tab);
          });

          element.addEventListener('keyup', (event) => {
            if ((event.code === 'Space' || event.code === 'Enter') && document.body.classList.contains('is-focused')) {
              this.tabChange(element, tab);
            }
          });
        });
      }

      calculateActiveBounds() {
        const currentTab = this.querySelector('[data-tab].current');
        const parent = currentTab?.parentElement;

        parent?.style.setProperty('--active-width', `${currentTab.offsetWidth}px`);
        parent?.style.setProperty('--active-left', `${currentTab.offsetLeft}px`);
      }

      tabChange(element, tab) {
        if (element.classList.contains('current')) {
          return;
        }

        const currentTab = this.querySelector('[data-tab].current');
        const currentTabContent = this.querySelector('.tab-content.current');

        currentTab?.classList.remove('current');
        currentTabContent?.classList.remove('current');

        element.classList.add('current');
        tab.classList.add('current');

        if (element.classList.contains('hidden')) {
          tab.classList.add('hidden');
        }

        this.calculateActiveBounds();

        this.a11y.removeTrapFocus();

        this.dispatchEvent(new CustomEvent('theme:tab:change', {bubbles: true}));

        element.dispatchEvent(
          new CustomEvent('theme:form:sticky', {
            bubbles: true,
            detail: {
              element: 'tab',
            },
          })
        );

        this.animateItems(tab);
      }

      animateItems(tab, animated = true) {
        const animatedItems = tab.querySelectorAll('[data-aos]');

        if (animatedItems.length) {
          animatedItems.forEach((animatedItem) => {
            animatedItem.classList.remove('aos-animate');

            if (animated) {
              animatedItem.classList.add('aos-no-transition');

              requestAnimationFrame(() => {
                animatedItem.classList.remove('aos-no-transition');
                animatedItem.classList.add('aos-animate');
              });
            }
          });
        }
      }

      checkRecentTab() {
        const tabLink = this.querySelector('.tab-link__recent');

        if (tabLink) {
          tabLink.classList.remove('hidden');
          const tabLinkIdx = parseInt(tabLink.getAttribute('data-tab'));
          const tabContent = this.querySelector(`.tab-content[data-tab-index="${tabLinkIdx}"]`);

          if (tabContent) {
            tabContent.classList.remove('hidden');

            this.animateItems(tabContent, false);
          }
        }
      }

      hideRelatedTab() {
        const relatedSection = this.querySelector('[data-related-section]');
        if (!relatedSection) {
          return;
        }

        const parentTabContent = relatedSection.closest('.tab-content.current');
        if (!parentTabContent) {
          return;
        }
        const parentTabContentIdx = parseInt(parentTabContent.getAttribute('data-tab-index'));
        const tabsNavList = this.querySelectorAll('[data-tab]');

        if (tabsNavList.length > parentTabContentIdx) {
          const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;

          if (nextTabsNavLink) {
            tabsNavList[parentTabContentIdx].classList.add('hidden');
            nextTabsNavLink.dispatchEvent(new Event('click'));
          }
        }
      }

      disconnectCallback() {
        document.removeEventListener('theme:resize:width', this.calculateActiveBounds);
      }
    }
  );
}
