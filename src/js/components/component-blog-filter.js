class BlogFilter extends HTMLElement {
  constructor() {
    super();
    this.selectors = {
      elementsWrapper: "blog-articles",
      popupContainer: "blog__filters--modal"
    }

    this.form = this.querySelector('.blog__filters-form') || null;
    this.formWrapper = this.parentNode || null;
    this.modal = document.getElementById(this.dataset.modal) || null;
    this.closePopupButton = this.querySelector(`[data-close-popup]`) || null;

    window.addEventListener('resize', () => {
     this.changeContainer();
    })

    this.debouncedOnSubmit = debounce((event) => {
      this.renderPage(event, true);
    }, 500);

    this.form?.addEventListener('change', (event) => {
      this.debouncedOnSubmit.call(this, event)
    });

    this.closePopupButton.addEventListener('click', () => {
      this.modal.hide();
    })

    this.changeContainer();
  }

  changeContainer() {
    if (window.innerWidth <= 767 && !this.parentElement.classList.contains(this.selectors.popupContainer)) {
      this.parentNode.removeChild(this);
      this.modal.querySelector(`.${this.selectors.popupContainer}`).appendChild(this);
    } else if (window.innerWidth >= 768 && this.parentElement.classList.contains(this.selectors.popupContainer)) {
      this.parentNode.removeChild(this);
      this.formWrapper.appendChild(this);
      this.modal.hide();
    }
  }

  renderPage(event, updateURLHash = true) {
    const section = this.getSections();
    const url =  `${event.target.value}?section_id=${section[0].section}`;
    this.renderSectionFromFetch(url);

    if (updateURLHash) this.updateURLHash(event.target.value);
  }

  renderSectionFromFetch(url) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const responseHtml = responseText;

        this.renderElementsGridContainer(responseHtml);

        if(AOS) AOS.refresh();
      })
      .catch((error) => {
          console.error('Error during fetch:', error)
      });
  }

  renderElementsGridContainer(html) {
    document.getElementById(this.selectors.elementsWrapper).innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById(this.selectors.elementsWrapper).innerHTML;
  }

  updateURLHash(searchParams) {
    history.pushState({searchParams}, '', `${searchParams}`);
  }

  getSections() {
    return [
      {
        section: document.getElementById(this.selectors.elementsWrapper)?.dataset.id,
      }
    ]
  }
}

customElements.define('blog-filter', BlogFilter);
