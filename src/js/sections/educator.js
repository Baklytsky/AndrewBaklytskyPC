class ObagiEducator extends HTMLElement {
  constructor() {
    super();
    this.config = this.querySelector('[data-brainshark]')
      ? JSON.parse(this.querySelector('[data-brainshark]').textContent)
      : null;

    if (!this.config) {
      this.dataset.loaded = 'false';
      return
    }

    this.tabsComponent = this.querySelector('tabs-component');
    this.navigation = this.querySelector('scrolling-tabs');
    this.list = this.querySelector('.educator__list-wrapper');
    this.videoCounter = this.querySelector('.educator__video-counter');
    this.trandingWrapper = this.querySelector('.educator__trending');

    this.init().then(()=> {
      if (this.session) {
        this.addPresentationsToFolders()
        this.buildNavigation()
        this.buildList()
        if (this.trandingWrapper) this.buildTrending()
        this.tabsComponent.connectedCallback()
        this.navigation.connectedCallback()
        this.setVideoCount(`${this.presentations.length + ' Videos'}`)
        this.checkSelectedTab()
      }
      this.dataset.loaded = `${!!this.session}`
    })
  }

  async init() {
    await this.generateSession()
    if (!this.session) {
      this.dataset.loaded = 'false'
      return
    }
    await this.getFolders()
    await this.getPresentations()
  }

  setVideoCount(inner) {
    this.videoCounter.innerHTML = inner
  }

  csvToArray() {
    const headers = this.report['Header'].split(',');
    const rows = this.report['Rows']

    return rows.map(function (row) {
      const values = row.split(',');
      return headers.reduce(function (object, header, index) {
        object[header] = values[index];
        return object;
      }, {});
    });
  }

  buildTrending() {
    const trendingPresentationId = this.trandingWrapper.dataset.presentationId;
    this.trandingPresentation = this.presentations.find(presentation => presentation['Id'] === Number(trendingPresentationId));
    if (!this.trandingPresentation) return

    const {
      ThumbnailUrl = '',
      Duration = 0,
      FolderId = null,
      Id = null,
      Title = '',
      Description = '',
      Tags = []
    } = this.trandingPresentation;
    const thumbnailUrl = new URL(ThumbnailUrl);
    const thumbnailParams = new URLSearchParams(thumbnailUrl.search);
    thumbnailParams.set('w', '1080');
    thumbnailParams.set('h', '600');
    thumbnailUrl.search = thumbnailParams.toString();
    const duration = this.toHHMMSS(Duration);
    const presentationUrl = `/pages/educator-player?presentation_id=${Id}`

    const trendingVideo =
      `<div class="educator__trending-wrapper">
        <div class="educator__trending-image rel">
          <img src="${thumbnailUrl.toString()}" class="image-abs-cover" alt="${Title}">
          <a href="${presentationUrl}" class="image-abs-cover">
            <span class="u-sr-only">${Title}</span>
          </a>
          <span class="educator__trending-image-duration">${duration}</span>
        </div>
        <div class="educator__trending-content">
          <span class="educator__trending-tag">${Tags[0]?.['Description'] || ''}</span>
          <a href="${presentationUrl}"
              class="educator__trending-heading h4 block">${Title || ''}</a>
          <div class="educator__trending-description">${Description || ''}</div>
          <a href="${presentationUrl}" class="btn btn--secondary">Watch the Video</a>
        </div>
      </div>`

    const node = new DOMParser().parseFromString(trendingVideo, 'text/html').querySelector('.educator__trending-wrapper');
    this.trandingWrapper.appendChild(node);
  }

  buildNavigation() {
    const foldersWithPresentations = this.folders.filter(folder => folder['Presentations'].length);
    const navigation = foldersWithPresentations.map(folder => (
      `<button
          class="a body1 educator__navigation-tab btn--reset"
          role="tab"
          type="button"
          id="tab-${handleize(folder['FullPath'])}--${folder['ID']}"
          aria-controls="tabpanel-${handleize(folder['FullPath'])}--${folder['ID']}"
          aria-selected="false"
          tabindex="-1">
          ${folder['FullPath']}
        </button>`
      )
    );

    navigation.forEach(nav => {
        const node = new DOMParser().parseFromString(nav, 'text/html').querySelector('button');
        this.navigation.appendChild(node);
      })
    this.navigation.removeAttribute('hidden');
  }

  buildList() {
    const foldersWithPresentations = this.folders.filter(folder => folder['Presentations'].length);
    const list = foldersWithPresentations.map(folder => {
      const educatorCards = folder['Presentations']
        .map(presentation => {
          const {ThumbnailUrl, Duration, Id, Title, Slides} = presentation;
          const thumbnailUrl = new URL(ThumbnailUrl);
          const thumbnailParams = new URLSearchParams(thumbnailUrl.search);
          thumbnailParams.set('w', '540');
          thumbnailParams.set('h', '300');
          thumbnailUrl.search = thumbnailParams.toString();
          const duration = this.toHHMMSS(Duration);
          const presentationUrl = `/pages/educator-player?presentation_id=${Id}`;

          return (`<div class="swiper-slide">
            <div class="educator__item-card">
              <div class="educator__item-card-image rel">
                <img src="${thumbnailUrl.toString()}" class="image-abs-cover" alt="${Title}">
                <a href="${presentationUrl}" class="image-abs-cover">
                  <span class="u-sr-only">${Title}</span>
                </a>
                <span class="educator__item-card-duration">${duration}</span>
              </div>
              <span class="educator__item-card-sections h6">
              ${Slides.length > 1 ? Slides.length + ' sections' : Slides.length + ' section'}
              </span>
              <a href="${presentationUrl}" class="educator__item-card-title h5">${Title}</a>
              <a href="${presentationUrl}" class="educator__item-card-link">Watch the Video</a>
            </div>
          </div>`)
        }).join('')

      const swiperConfig = {
        slidesPerView: 1.33,
        spaceBetween: 20,
        watchSlidesProgress: true,
        freeMode: true,
        mousewheel: {
          forceToAxis: true
        },
        navigation: {
          nextEl: `.swiper-button-next--${folder['ID']}`,
          prevEl: `.swiper-button-prev--${folder['ID']}`
        },
        scrollbar: {
          el: `.swiper-scrollbar--${folder['ID']}`,
          hide: false,
          draggable: true
        },
        breakpoints: {
          768: {
            slidesPerView: 3,
            shortSwipes: false
          }
        }
      }

      const {FullPath, ID, Presentations} = folder
        return (
          `<div class="educator__item"
             data-tab-id="tabpanel-${handleize(FullPath)}--${ID}"
             role="tabpanel"
             aria-labelledby="tab-${handleize(FullPath)}--${ID}"
             tabindex="0"
             data-video-count="${Presentations.length + ' ' + FullPath}" >
             <div class="educator__item-header page-width">
                <h6>${FullPath}</h6>
                <span class="body3">
                  ${Presentations.length + ' ' + FullPath + ' Videos'}
                </span>
             </div>
             <slideshow-swiper data-config='${JSON.stringify(swiperConfig)}' class="educator__item-slider rel page-width">
              <div class="swiper">
                <div class="swiper-wrapper">
                  ${educatorCards}
                </div>
              </div>
                <div class="swiper-scrollbar swiper-scrollbar--${ID}"></div>
                <div class="swiper-navigation-wrapper">
                  <div class="swiper-pagination swiper-pagination--${ID}"></div>
                  <div class="swiper__slider-arrows">
                    <div class="swiper-button-prev swiper-button-prev--${ID}"></div>
                    <div class="swiper-button-next swiper-button-next--${ID}"></div>
                  </div>
                </div>
              </slideshow-swiper>
              <div class="educator__item-grid page-width">
                <div class="educator__item-grid-wrapper">
                  ${educatorCards}
                </div>
              </div>
           </div>`
        )
      }
    )

    list.forEach(item => {
      const node = new DOMParser().parseFromString(item, 'text/html').querySelector('.educator__item');
      this.list.appendChild(node);
    })
  }

  checkSelectedTab() {
    const tabs = this.navigation.querySelectorAll('[role=tab]');
    const tabpanels = this.querySelectorAll('[role=tabpanel]');

    tabs.forEach(tab =>  tab.addEventListener('click', ()=> {
      tabpanels.forEach(panel => panel.classList.remove('active_panel'));
      if (tab.getAttribute('aria-controls') === 'show-all-tabs') {
        this.setVideoCount(`${this.presentations.length + ' Videos'}`);
        return
      }
      const active_panel = this.querySelector(`[aria-labelledby=${tab.id}]`);
      if (active_panel) {
        this.setVideoCount(`${active_panel.getAttribute('data-video-count')}`);
        active_panel.classList.add('active_panel');
      }

    }))
  }

  addPresentationsToFolders() {
    this.folders.forEach(folder =>
      folder['Presentations'] = this.presentations.filter(pres => pres['FolderId'] === folder['ID']))
  }

  toHHMMSS(duration) {
    const sec_num = parseInt(duration, 10);
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours = '0' + hours + ':'}
    if (hours === '00:') {hours = ''}
    if (minutes < 10) {minutes = '0' + minutes + ':'}
    if (seconds < 10) {seconds = '0' + seconds}
    return hours + minutes + seconds;
  }

  generateSession() {
    const generateApiUrl = 'https://www.brainshark.com/Brainshark/Webservices_Mobile/session.ashx';
    return fetch(generateApiUrl + "?" + new URLSearchParams(this.config), {method: 'POST'})
      .then(res => res.json())
      .then(data => this.session = {sid: data.Id, sky: data.Key, uid: data.UId, token: data.SessionToken})
      .catch(error => {
        this.dataset.loaded = 'false';
        console.log(error)
        return false
    })
  }

  getFolders() {
    const getFoldersApi = "https://www.brainshark.com/Brainshark/Webservices_Mobile/folder.ashx";
    return fetch(getFoldersApi + "?" + new URLSearchParams(this.session), {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => this.folders = data['Folders'][0]['Children'])
      .catch(error => console.error(error));
  }

  getPresentations() {
    const presentationsApi = "https://www.brainshark.com/Brainshark/Webservices_Mobile/presentation.ashx";
    const presentationsParams = {
      ...this.session,
      perpage: 1000
    }
    return fetch(presentationsApi + "?" + new URLSearchParams(presentationsParams), {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => {
        this.presentations = data['Results'].filter(pres => {
          if (!pres['Tags'].length) return true
          const hiddenTag = pres['Tags'].some(tag => tag['Description'] === 'hidden')
          return !hiddenTag
        })
      })
      .catch(error => console.error(error));
  }

  // For feature statistics
  getRecentlyViewed() {
    const userActivityApi = "https://www.brainshark.com/Brainshark/Webservices_Mobile/mostrecentlyviewed.ashx";
    return fetch(userActivityApi + "?" + new URLSearchParams(this.session), {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => this.recentlyViewed = data)
      .catch(error => console.error(error));
  }

  // For feature statistics
  getReport() {
    //**** Brainshark reports path  *****//

    //path: '/Brainshark Reports/Presentation Reports/Question Reports/Grade Book'
    //path: '/Brainshark Reports/Presentation Reports/Question Reports/Viewer Transcript'
    //path: '/Brainshark Reports/Presentation Reports/Viewing Details by Presentation'

    const getReportApi = "https://www.brainshark.com/brainshark/webservices_mobile/report.ashx";
    const getReportParams = {
      ...this.session,
      path: '/Brainshark Reports/Presentation Reports/Viewing Details by Presentation'
    };

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    headers.append('Brainshark-STok', this.session.token)

    return fetch(getReportApi + "?" + new URLSearchParams(getReportParams), {
      method: 'GET',
      headers: headers
    })
      .then(response => response.json())
      .then(data => this.report = data)
      .catch(error => console.error(error));
  }
}

customElements.define('obagi-educator', ObagiEducator);
