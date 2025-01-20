if (!customElements.get('representative-card')) {
  class RepresentativeCard extends HTMLElement {
    constructor() {
      super();
      this.selesManagerId = this.dataset.salesManagerId;
      this.cardHeading = `Your Obagi <br> Representative`;
      this.modal = this.closest('modal-dialog');

      this.getRepresentative().then(()=> {
        if (this.representative && this.representative['customer']) {
          this.innerHTML = this.buildCard();
          if (this.modal) this.modal.classList.remove('hidden')
        }
      })
    }

    async getRepresentative () {
      const response = await fetch(`https://obagi-api.westus.cloudapp.azure.com/api/customers/sales?id=${this.selesManagerId}`);
      this.representative = await response.json();
      return this.representative;
    }

    buildCard () {

      const {imageUrl, firstName, lastName, territoryName, phone, email} = this.representative['customer']
      const getHeading = () => {
        if (!this.cardHeading?.length) return '';
        return `<p class="representative-card__heading h6">${this.cardHeading}</p>`;
      }

      const getImage = () => {
        if (!imageUrl?.length) return '';
        return (
          `<div class="representative-card__image-wrapper rel">
            <img src="${imageUrl}" class="image-abs-cover" alt="${firstName || ''}"/>
          </div>`
        );
      }

      const getName = () => {
        if (firstName?.length || lastName?.length) {
          return `<p class="representative-card__name representative-card__info h5">${firstName || ''} ${lastName || ''}</p>`;
        } else {
          return ''
        }
      }

      const getAddress = () => {
        if (!territoryName?.length) return '';
        return `<p class="representative-card__address representative-card__info">
                  ${territoryName}
                </p>`;
      }

      const getPhone = () => {
        if (!phone?.length) return '';
        const phoneToCall = phone
          .replace(/\+/g,'')
          .replace(/\s/g,'')
          .replace(/_/g,'')
          .replace(/\(/g,'')
          .replace(/\)/g,'')
          .replace(/-/g,'')
          .replace(/:/g,'');

        return (
          `<a href="tel:+${phoneToCall}" class="representative-card__number representative-card__info">
             ${phone}
           </a>`
        );
      }

      const getEmail = () => {
        if (!email?.length) return '';
        return (
          `<a href="mailto:${email}" class="representative-card__email representative-card__info">
              ${email}
           </a>`
        );
      }

      return (
        `<div class="representative-card__wrapper">
          ${getHeading()}
          <div class="representative-card__content">
          ${getImage()}
            <div class="representative-card__content-text">
              ${getName()}
              ${getAddress()}
              ${getPhone()}
              ${getEmail()}
            </div>
          </div>
        </div>`
      );
    }
  }

  customElements.define('representative-card', RepresentativeCard);
}
