class ObagiPlayer extends HTMLElement {
  constructor() {
    super();
    this.config = this.querySelector('[data-brainshark]')
      ? JSON.parse(this.querySelector('[data-brainshark]').textContent)
      : null;

    this.customer = this.querySelector('[data-customer]')
      ? JSON.parse(this.querySelector('[data-customer]').textContent)
      : null;

    if (!this.config) {
      this.dataset.loaded = 'false';
      return
    }

    this.params = new URLSearchParams(window.location.search);
    this.presentationId = this.params.get('presentation_id')
    this.playerHeading = this.querySelector('.educator-player__header-heading')
    this.playerInner = this.querySelector('.educator-player__inner')
    this.list = this.querySelector('.educator-player__recommended');

    if (this.presentationId) {
      this.init().then(()=> {
        if (this.session) {
          this.addPresentationsToFolders()
          this.getPresentationAndFolder()
          this.loadPlayer()
          this.getRecommendedPresentations()
        }
        this.dataset.loaded = `${!!this.session}`
      })
    } else {
      this.innerHTML = `<h4 class='educator__list-empty'>Presentation not found</h4>`
      this.dataset.loaded = 'true'
    }
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



  getPresentationAndFolder () {
    if (!this.presentations) return
    this.presentation = this.presentations.find(pres => pres['Id'] === Number(this.presentationId))
    this.folder = this.folders.find(folder => folder['ID'] === this.presentation['FolderId'])
  }

  randomSort (values) {
      let index = values.length, randomIndex;
      if (index !== 0) {
        randomIndex = Math.floor(Math.random() * index);
        index--;
        [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
      }
      return values;
  }

  getRecommendedPresentations () {
    if (!this.folder) return
    const recommended = this.folder['Presentations'].filter(pres => pres['Id'] !== this.presentationId);
    const recommendedRandom  = this.randomSort(recommended).slice(0, 3);
    const recommendedCards = recommendedRandom.map(presentation => {
        const {ThumbnailUrl, Duration, Id, Title, Slides} = presentation;
        const thumbnailUrl = new URL(ThumbnailUrl);
        const thumbnailParams = new URLSearchParams(thumbnailUrl.search);
        thumbnailParams.set('w', '540');
        thumbnailParams.set('h', '300');
        thumbnailUrl.search = thumbnailParams.toString();
        const duration = this.toHHMMSS(Duration);
        const presentationUrl = `/pages/educator-player?presentation_id=${Id}`;

      return (`<div class="educator__item-card">
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
              </div>`)
    }).join('')

    const recommendedHtml =
      `<div class="educator__item-grid">
         <div class="educator__item-header">
            <h6>${this.folder['FullPath']}</h6>
            <span class="body3">
              ${recommendedRandom.length + ' ' + this.folder['FullPath']}
            </span>
         </div>
        <div class="educator__item-grid-wrapper">
          ${recommendedCards}
        </div>
      </div>`

    const node = new DOMParser().parseFromString(recommendedHtml, 'text/html').querySelector('.educator__item-grid');
    this.list.appendChild(node);
  }

  loadPlayer () {
    if (!this.playerInner || !this.presentation) return
    const {ViewingUrl, Title} = this.presentation;
    this.playerHeading.textContent = Title;
    this.playerInner.innerHTML = `<iframe src='${ViewingUrl}' width="1280" height="720" frameborder="0" allowfullscreen></iframe>`;
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
    if (this.customer) Object.assign(presentationsParams, this.customer);

    return fetch(presentationsApi + "?" + new URLSearchParams(presentationsParams), {
      method: 'GET'
    })
      .then(response => response.json())
      .then(data => this.presentations = data['Results'])
      .catch(error => console.error(error));
  }

}

customElements.define('obagi-player', ObagiPlayer);
