class PhysicianFinder extends HTMLElement {
  constructor() {
    super()

    this.resultContainersWrapper = this.querySelector('.physician-finder__content');
    this.spinner = this.querySelector('.physician-finder__spinner');
    this.errorMessage = this.querySelector('.physician-finder__error');
    this.resultContainers = this.querySelectorAll('.physician-finder__results-block');
    this.preferredListContainers = this.querySelectorAll('.physician-finder__preferred-list');
    this.preferredListContainersWrapMob = this.querySelector('.physician-finder__results-preferred--mobile');
    this.resutsHeadingMob = this.querySelector('.physician-finder__results-heading--mob');
    this.mainListContainer = this.querySelector('.physician-finder__main-list');
    this.resultsNumberElem = this.querySelectorAll('.physician-finder__results-count');
    this.searchForm = this.querySelector('.physician-finder__form');
    this.noResultBanners = this.querySelectorAll('.physician-finder__no-result');
    this.showMoreLocationsBtn = this.querySelector('.physician-finder__show-more');
    this.locationsPaginateBy = Number(this.showMoreLocationsBtn.getAttribute('data-paginate-by'));
    this.mapMarkers = [];
    this.mapZoomed = false;
    this.zoomTriggerLevel = 10;

    this.getInitialState();
    this.eventListeners();
  }

  eventListeners() {
    this.searchForm.addEventListener('submit', (e) => {this.searchSubmit(e)})
    this.searchForm.addEventListener('change', (e) => {this.formChange(e)})
    this.showMoreLocationsBtn.addEventListener('click', (e) => {this.getLocationsData(true)})
  }

  loadScript() {
    this.googleMapScript = document.createElement('script');
    this.googleMapScript.src = window.googleMap.scriptSrc;
    document.head.append(this.googleMapScript);

    this.googleMapScript.onload = () => {
      this.initMap();

      const urlParams = new URLSearchParams(window.location.search);
      const lat = Number(urlParams.get('lat'));
      const lng = Number(urlParams.get('lng'));

      if (lat && lng) {
        this.map.setCenter({lat: lat, lng: lng});
        setTimeout(() => {this.map.setZoom(10)}, 400); // waiting when map stop zoom
      } else {
        this.getUserGeolocation();
      }
    };
  }

  initMap() {
    this.map = new google.maps.Map(this.querySelector('#map'), {
      zoom: 3.7,
      center: { lat: 35.13, lng: -95.15 },
      styles: window.googleMap.styles
    });

    this.setMarkers();
    this.spinner.classList.add('hidden');
    this.resultContainersWrapper.classList.remove('hidden');

    this.map.addListener('zoom_changed', () => {
      let zoomLevel = this.map.getZoom();

      if (zoomLevel >= this.zoomTriggerLevel) {
        this.mapZoomed = true;
        this.updateLocationsByMapWidth();
      } else if (zoomLevel < this.zoomTriggerLevel && this.mapZoomed) {
        this.mapZoomed = false;
        this.clearAllMarkers();
        this.getInitialState();
      }
    });

    this.map.addListener('dragend', () => {
      let zoomLevel = this.map.getZoom();
      if (zoomLevel >= this.zoomTriggerLevel) {
        this.updateLocationsByMapWidth();
      }
    });
  }

  updateLocationsByMapWidth() {
    const bounds = this.map.getBounds();
    const distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(bounds.getNorthEast(), bounds.getSouthWest()));

    const distanceInMiles = distance * 0.00062;
    const center = this.map.getCenter();
    const currentCenterCoords = {
      latitude: center.lat(),
      longitude: center.lng()
    };
    this.getLocations(currentCenterCoords, distanceInMiles);
  }
  setMarkers() {
    if (!this.locations.length) return
    const _this = this;

    const filteredData = this.filterData(this.locations);
    filteredData.forEach((location) => {
      const latLng = new google.maps.LatLng(location.latitude, location.longitude);
      const marker = new google.maps.Marker({
        position: latLng,
        icon: window.googleMap.marker,
        title: location.name,
        id: location.id,
        optimized: true,
        map: this.map
      });
      this.mapMarkers.push(marker);

      marker.addListener('click', function(e) {
        _this.onMarkerClick(this, e);
      });
    })

    this.markerCluster = new markerClusterer.MarkerClusterer(this.map, this.mapMarkers, {
      styles: [{
        textColor: 'transparent',
        url: window.googleMap.marker,
        height: 28,
        width: 23,
        anchorText: [-5, -5],
        textSize: 0,
        backgroundPosition: 'center'
      }],
      maxZoom: this.zoomTriggerLevel
    });
  }

  onMarkerClick(marker, e) {
    if (this.mapZoomed) {
      if (this.activeMarker) {
        this.activeMarker.setIcon(window.googleMap.markerNumbered); // Remove current active marker icon
      }

      marker.setIcon(window.googleMap.markerActive); // Set new active marker icon
      this.activeMarker = marker;

      const elementToScroll = document.querySelector(`[data-location-id="${marker.id}"]`);
      const activeLocation = document.querySelector('[data-location-id].active');

      if (activeLocation) activeLocation.classList.remove('active');
      if (elementToScroll) {
        elementToScroll.classList.add('active');
        elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      this.map.setCenter(e.latLng);
      this.map.setZoom(this.zoomTriggerLevel);
    }

  }

  renderContent(data, showMore = false) {
    //this.preferredListContainers.forEach(container => {container.innerHTML = ''});
    if (!showMore) {
      this.mainListContainer.innerHTML = '';
    }
    if (data.length > 0) {
      //let counter = 0;
      data.forEach((elem, i) => {
        // if (elem.preferredPartner && counter < premierPracticeCount) {
        //   counter++
        //   this.preferredListContainers.forEach(container => {container.insertAdjacentHTML('beforeend', this.renderPremierItem(elem))})
        // }

        this.mainListContainer.insertAdjacentHTML('beforeend', this.renderItem(elem, i));
      });
      this.hideNoResultBanner();
    } else {
      this.showNoResultBanner();
    }
    if (window.AOS) AOS.refresh();
  }

  renderPremierItem(data) {
    const partnerDetailUrl = `/collections/physician-finder-details?locationId=${data.id}&withProducts=true`;
    let image = '';

    if (data.imageUrl) image = `<img src="${data.imageUrl}" alt="${data.name}" class="physician-finder__preferred-image">`

    return `<li class="physician-finder__preferred-item">
              ${image}
              <div class="physician-finder__preferred-content">
                <h5 class="physician-finder__preferred-heading">${data.name}</h5>
                <div class="body3 body3--bold physician-finder__preferred-label">
                  <span>Obagi Premier Partner</span>
                  <modal-opener>
                    <button class="btn--reset"
                            type="button"
                            aria-controls="#premier-partners-popup"
                            aria-haspopup="true"
                            aria-expanded="false"
                            aria-label="Obagi Premier Partner Info"><sup>ⓘ</sup></button>
                  </modal-opener>
                </div>
                <p class="body3 physician-finder__preferred-text">${data.description}</p>
                <a href="${partnerDetailUrl}" class="btn btn--secondary">Learn More</a>
              </div>
            </li>`
  }

  renderItem(location, index) {
    const detailUrl = `/collections/physician-finder-details?locationId=${location.id}&withProducts=true`;
    const formattedPhone = location.phoneNumber ? phoneValidation(location.phoneNumber): '';
    let labelHtml = '';
    let providerHtml = '';
    let icon = '';
    //let products = `<a href="${detailUrl}" class="underline physician-finder__item-products">${location.productIds.length} Products Available</a><br>`

    this.mapZoomed ? icon = `<div class="location-icon--index h6">${index + 1}</div>`
                     : icon = '<svg class="location-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5694 23.4088C8.82764 20.6265 6.84562 18.1005 5.54618 15.7492C4.2216 13.3524 3.59961 11.1308 3.59961 8.99961C3.59961 6.6803 4.54003 4.58023 6.06013 3.06013C7.58023 1.54003 9.6803 0.599609 11.9996 0.599609C14.3189 0.599609 16.419 1.54003 17.9391 3.06013C19.4592 4.58023 20.3996 6.6803 20.3996 8.99961C20.3996 11.1308 19.7776 13.3524 18.453 15.7492C17.1536 18.1005 15.1716 20.6265 12.4298 23.4088C12.1963 23.6464 11.8141 23.6495 11.5766 23.416L11.5694 23.4088Z" fill="currentColor"/><circle cx="12.0008" cy="8.9998" r="4.2" fill="white"/></svg>'

    if (location.premierPartner) labelHtml = `<div class="body3 body3--bold physician-finder__item-label">
                                                  <span>Obagi Premier Partner</span>
                                                  <modal-opener>
                                                    <button class="btn--reset"
                                                      type="button"
                                                      aria-controls="#premier-partners-popup"
                                                      aria-haspopup="true"
                                                      aria-expanded="false"
                                                      aria-label="Obagi Premier Partner Info"><sup>ⓘ</sup></button>
                                                  </modal-opener>
                                                </div>`;
    if (location.skintrinsiqProvider) providerHtml = `<div class="physician-finder__item-provider">
                                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                      <circle cx="20" cy="20" r="19" stroke="currentColor" stroke-width="2"/>
                                                      <path d="M15 20.8074L17.6622 24L25 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                    </svg>
                                                    <span class="body3">SKINTRINSIQ™ Provider</span>
                                                 </div>`;

    return `<li class="physician-finder__item" data-location-id="${location.id}">
              ${icon}
              <div>
                <h5 class="physician-finder__item-heading">${location.name}</h5>
                ${labelHtml}
                ${providerHtml}
                <div class="physician-finder__item-address">${location.street}<br>${location.city}, ${location.state} ${location.zipCode}</div>
                <a href="tel:${location.phoneNumber}" class="physician-finder__item-phone">${formattedPhone}</a><br>
                <a href="${detailUrl}" class="a underline physician-finder__item-link">View Details</a>
              </div>
            </li>`

  }

  getLocationByZipcode(zipcode) {
    const geocoder = new google.maps.Geocoder();
    const countries = ['USA', 'PR'];
    const geocodePromises = countries.map(country => geocodeForCountry(country, zipcode));

    function geocodeForCountry(countryCode, postalCode) {
      return new Promise((resolve, reject) => {
        geocoder.geocode(
          {componentRestrictions: { country: countryCode, postalCode: postalCode }}, (results) => resolve(results))
      });
    }

    Promise.all(geocodePromises)
      .then((results) => {
        const successResult = results.filter(elem => elem != null);
        if (successResult.length) {
          this.searchState = successResult[0][0].address_components[3]?.long_name || '';
          this.map.setCenter({lat: successResult[0][0].geometry.location.lat(), lng: successResult[0][0].geometry.location.lng()});
          this.map.setZoom(this.zoomTriggerLevel);
        } else {
          alert('Please enter a valid zip code');
        }
      })
      .catch(error => {
        alert('Please enter a valid zip code');
        console.error(error);
      });
  }

  searchSubmit(e) {
    e.preventDefault();
    this.searchZipCode = this.searchForm.querySelector('#physician-finder-search').value;
    this.getLocationByZipcode(this.searchZipCode);

    window.dataLayer.push({
      'event': 'generate_lead',
      'customer': {
        'b2b_specialty': '',
        'b2b_role': '',
        'b2b_city': '',
        'b2b_state': '',
        'b2b_registration_reason': ''
      },
      'user': {
        'lead': {
          'lead_type': 'B2C',
          'lead_driver': 'Find a Physician'
        }
      }
    });
  }

  showNoResultBanner() {
    this.noResultBanners.forEach((item) => {
      const noResutsText = item.querySelector('.finder-no-result__heading span');
      if (this.searchZipCode) noResutsText.innerHTML = `for ${this.searchZipCode}`;
      item.classList.remove('hidden');
    });
    this.resultContainers.forEach(container => {container.classList.add('hidden')});
    this.resutsHeadingMob.classList.add('hide');
    this.showMoreLocationsBtn.classList.add('hidden');

    if (this.searchZipCode) {
      dataLayer.push({
        'event': 'find_a_physician_no_results',
        'pf': {
          'physician_finder_show': Array.from(this.searchForm.querySelectorAll('input[type=checkbox]:checked')).map(input => input.dataset.name).join(' | '),
          'physician_find_zip_code': this.searchZipCode,
          'physician_find_state': this.searchState || '',
        },
        'search':{
          'refine': {
            'refine_by_category':'',
            'refine_by_item':'',
            'refine_by_action':''
          }}
      })
    }
  }

  hideNoResultBanner() {
    this.noResultBanners.forEach(item => {item.classList.add('hidden')});
    this.resultContainers.forEach(container => {container.classList.remove('hidden')});
    this.resutsHeadingMob.classList.remove('hide');
  }

  getUserGeolocation() {
    if (navigator.geolocation) {
      const successCallback = (position) => {
        this.map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
        this.map.setZoom(this.zoomTriggerLevel);
      };
      const errorCallback = (error) => {console.log(error)};
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    }
  }

  getLocations(location, radius = 50, setMapCenter = false) {
    fetch(window.googleMap.apiSrc + `/api/locations/radius?longitude=${location.longitude || 35.13}&latitude=${location.latitude || -95.15}&radius=${radius}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any'
      }})
      .then(response => response.json())
      .then(data => {
        this.locations = this.filterData(data.locations);
        this.clearAllMarkers();
        if (data.locations.length > 0) {
          this.setMarkers();

          if (this.searchZipCode) {
            window.dataLayer.push({
              'event': 'find_a_physician_success',
              'pf': {
                'physician_finder_show': Array.from(this.searchForm.querySelectorAll('input[type=checkbox]:checked')).map(input => input.dataset.name).join(' | '),
                'physician_find_zip_code': this.searchZipCode,
                'physician_find_state': this.searchState || ''
              },
              'search':{
                'refine': {
                  'refine_by_category':'',
                  'refine_by_item':'',
                  'refine_by_action':''
                }}
            });
          }
        }

        this.renderContent(this.locations);
        this.updateMapMarker();
        this.setAllLocationsCount()
        this.showMoreLocationsBtn.classList.add('hidden');

        if (setMapCenter) {
          this.map.setCenter({lat: location.latitude, lng: location.longitude});
          this.map.setZoom(this.zoomTriggerLevel);
        }

      })
      .catch((error) => {console.log(error)})
  }

  clearAllMarkers() {
    this.markerCluster.clearMarkers();
    this.mapMarkers = [];
  }

  updateMapMarker() {
    this.mapMarkers.forEach((marker, i) => {
      marker.setIcon(window.googleMap.markerNumbered);
      marker.setLabel( {text: `${i + 1}`, color: "white"});
    })
  }

  getAllLocationsCords() {
    fetch(window.googleMap.apiSrc + '/api/locations/coordinates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any'
      }})
      .then(response => response.json())
      .then(data => {
        this.locations = this.filterData(data.locations);
        this.setAllLocationsCount();
        if (!this.map) {
          this.loadScript();
        } else {
          this.setMarkers();
        }

      })
      .catch((error) => {console.log(error); this.showBadRequestMessage()})
  }

  getLocationsData(showMore = false) {
    const premierPartnerFilter = this.searchForm.querySelector('[name="premierPartner"]').checked;
    const skintrinsiqProviderFilter = this.searchForm.querySelector('[name="skintrinsiqProvider"]').checked;
    let url = window.googleMap.apiSrc + `/api/locations/parts?limit=${this.locationsPaginateBy}&offset=${this.locationsPaginateOffset}&premierPartner=${premierPartnerFilter}&skintrinsiqProvider=${skintrinsiqProviderFilter}`;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any'
      }})
      .then(response => response.json())
      .then(data => {
        if (this.locationsPaginateOffset === 0) this.mainListContainer.innerHTML = ''; // clear locations container if initial state request
        this.renderContent(data.locations, showMore);
        this.locationsPaginateOffset = this.locationsPaginateOffset + this.locationsPaginateBy;

        if (data.locations.length !== this.locationsPaginateBy) { // Hide show more button is the last paginate page or is not show more btn
          this.showMoreLocationsBtn.classList.add('hidden');
        } else {
          this.showMoreLocationsBtn.classList.remove('hidden');
        }
      })
      .catch((error) => {console.log(error)})
  }

  getInitialState() {
    this.locationsPaginateOffset = 0;
    this.searchZipCode = '';
    this.searchState = '';

    this.getAllLocationsCords();
    this.getLocationsData();
  }

  setAllLocationsCount () {
    this.resultsNumberElem.forEach(elem => {elem.innerHTML = `${this.locations.length}`});
  }

  showBadRequestMessage() {
    this.spinner.classList.add('hidden');
    this.errorMessage.classList.remove('hidden');
  }

  getCheckedFilters() {
    return Array.from(this.searchForm.querySelectorAll('input[type=checkbox]:checked')).map(input => input.value);
  }

  filterData(locations) {
    const checkedFilters = this.getCheckedFilters();
    let filteredLocations = [];

    if (!checkedFilters.length) return locations;

    if (checkedFilters.length === 1) {
      filteredLocations = locations.filter(location => location[checkedFilters[0]] === true);
    } else {
      // filteredLocations = locations.filter(location => {
      //   const matches = checkedFilters.filter(filter => location[filter] === true);
      //   return matches.length === checkedFilters.length;
      // })
      filteredLocations = locations.filter(location => location[checkedFilters[0]] === true && location[checkedFilters[1]] === true);
    }
    return filteredLocations
  }

  formChange(e) {
    if (e.target.type === 'checkbox') {
      if (this.map.getZoom() >= this.zoomTriggerLevel) {
        this.updateLocationsByMapWidth();
      } else {
        this.clearAllMarkers()
        this.getInitialState()
      }
    }
  }
}

customElements.define('physician-finder', PhysicianFinder);
