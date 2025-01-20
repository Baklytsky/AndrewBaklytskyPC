class ObagiEvents extends HTMLElement {
  constructor() {
    super()

    this.spinner = this.querySelector('.obagi-events__spinner');
    this.contentWrapper = this.querySelector('.obagi-events__content') || '';
    this.noResultMessage = this.querySelector('.obagi-events__no-results');
    this.customerEmail = this.getAttribute('data-customer-email');
    this.eventsCustomData = document.querySelector('[data-events-info]') ? JSON.parse(document.querySelector('[data-events-info]').textContent) : false;
    this.featuredList = this.querySelector('.obagi-events__featured-list');
    this.upcomingList = this.querySelector('.obagi-events__upcoming-list');
    this.sectionTypeUpcoming = this.classList.contains('obagi-events__upcoming');
    this.isAccountOverview = this.classList.contains('obagi-events__account');
    this.eventsToShow = this.sectionTypeUpcoming ? 3 : this.isAccountOverview ? 1 : false;

    this.getWebinarsList();
  }

  renderContent(webinars) {
    if (!webinars.length) return

    webinars.forEach((webinar, index) => {
      if (index === 0 && !this.sectionTypeUpcoming && !this.isAccountOverview) {
        this.featuredList.insertAdjacentHTML('beforeend', this.renderWebinar(webinar, true));
      } else {
        this.upcomingList.insertAdjacentHTML('beforeend', this.renderWebinar(webinar));
      }
    })
  }

  renderWebinar(webinar, isFeatured) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateObj = new Date(webinar.start_time);
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    const dateOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: webinar.timezone || 'America/New_York',
      timeZoneName: 'short',
      hour12: true,
    };
    const formattedDate = dateObj.toLocaleString('en-US', dateOptions).replace("at", "@");

    const webinarCustomInfo = this.eventsCustomData.webinars.find(item => item.id === webinar.id) || {};
    const imageUrl = webinarCustomInfo.imageUrl || this.eventsCustomData.defaultImage;
    const itemClass = isFeatured ? 'obagi-events__item-featured' : ''
    const headingClass = isFeatured ? 'h4' : 'h5';
    const btnText = webinar.email_is_registered ? 'Registered' : webinar.is_simulive ? 'Join Now' : 'Register Now';
    const agenda = webinar.agenda ? webinar.agenda : webinarCustomInfo.description || '';
    const subheading = webinar.is_simulive ? `<div class="h6 obagi-events__item-subheading color-primary">LIVE NOW!</div>`
                                            : `<div class="h6 obagi-events__item-subheading">${formattedDate}</div>`;


    return `
      <li class="obagi-events__item ${itemClass}">
        <div class="obagi-events__item-image-wrapper rel">
          <img src="${imageUrl}" alt="${webinar.topic}" class="image-abs-cover">
          <div class="obagi-events__item-image-text-wrapper" style="--color: #ffffff">
<!--            <p class="obagi-events__item-image-text h6">${month}</p>-->
<!--            <p class="obagi-events__item-image-text h7">${day}</p>-->
          </div>
        </div>
        <div class="obagi-events__item-text-wrapper">
          ${subheading}
          <h3 class="obagi-events__item-heading ${headingClass}">${webinar.topic}</h3>
          <p class="obagi-events__item-description">${agenda}</p>
          <a href="${webinar.join_url}" target="_blank" class="btn btn--secondary obagi-events__item--btn">${btnText}</a>
        </div>
      </li>`
  }

  getWebinarsList() {
    const url = `https://obagi-api.westus.cloudapp.azure.com/api/events?email=${this.customerEmail}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any'
      }})
      .then(response => response.json())
      .then(data => {
        if (data.length) {
          this.spinner.classList.add('hide');
          this.contentWrapper.classList.remove('hide');
          let webinars = data;
          if (this.eventsToShow) webinars = data.slice(0, this.eventsToShow);
          this.renderContent(webinars);
        } else {
          this.showNoResultMessage();
        }
      })
      .catch((error) => {console.log(error); this.showNoResultMessage()})
  }

  showNoResultMessage() {
    this.spinner.classList.add('hide');
    if (!this.isAccountOverview) this.noResultMessage.classList.remove('hide');
  }
}

customElements.define('obagi-events', ObagiEvents);
