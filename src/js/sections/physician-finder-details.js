class PhysicianFinderDetails extends HTMLElement {
  constructor() {
    super();
    this.params = new URLSearchParams(window.location.search);
    this.locationId = this.params.get('locationId');

    if (!this.locationId) {
      this.dataset.loaded = 'false';
      return
    }

    this.detailsSource = this.querySelector('#finder-details__source');
    this.collectionSource = this.querySelector('#finder-collection__source');
    this.details = this.querySelector('#finder-details__inner');
    this.collection = this.querySelector('#finder-collection__inner');
    this.globalCollections = this.querySelector('#globalsCollections');
    if (this.globalCollections) this.globalCollectionsObj = JSON.parse(this.globalCollections.textContent);
    this.sectionId = this.dataset.sectionId;
    this.backBtn = this.querySelector('.finder-back-btn')

    if (this.locationId) {
      this.getLocation()
        .then(()=> {
          if (!this.location) {
            this.dataset.loaded = 'false';
            return
          }
          this.renderBackBtn()
          this.renderProducts()
          this.renderDetails();
          this.updateBanners();
          //this.renderCollection();
          this.dataset.loaded = 'true';
        })
    }
  }

  async getLocation() {
    const url = `https://obagi-api.westus.cloudapp.azure.com/api/locations/location?locationId=${this.locationId}&withProducts=true`

    await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any'
      }})
      .then(response => response.json())
      .then(data => {
        this.location = data.location;
        this.location.formattedPhone = phoneValidation(this.location.phoneNumber);
        if (!this.location.physicianImageUrl) this.location.physicianImageUrl = window.images.salesRepsPlaceholder;
        if (this.location) this.productsSample = data.location.products;
        console.log(this.location);
      })
      .catch(error => {console.log(error)})
  }

  renderBackBtn() {
    const {latitude, longitude} = this.location
    if (!latitude.toString().length || !longitude.toString().length || !this.backBtn) return
    this.backBtn.href = `/pages/physician-finder?lat=${latitude}&lng=${longitude}`
  }

  renderProducts() {
    if (!this.productsSample || !this.productsSample.length) return
    this.products = this.productsSample.filter(product => product.status === 'ACTIVE')

    this.products.map(product => {
      const {media, id, variants,
        tags, custom_info_label, custom_collection,
        bundle_variants_variant_picker, product_card_second_image, handle} = product;

      product.id = Number(id.split('/').pop());
      product.url = `/products/${handle}`;
      product.media = media['nodes'] ? media['nodes'] : false;
      product.featured_image_json = this.getFeaturedImageJson(product.media);
      product.custom_info_label = custom_info_label ? custom_info_label['value'] : false;
      product.product_card_second_image = product_card_second_image ? JSON.parse(product_card_second_image['value']) : false;
      product.bundle_variants = this.getBundleVariants(bundle_variants_variant_picker);
      product.bundle_available = product.bundle_variants ? product.bundle_variants.every(variant => variant['availableForSale']) : false;
      product.bundle_uniq_id = this.getBundleUniqId(product.bundle_variants, handle);
      product.collections = this.getCustomCollections(custom_collection);
      product.custom_collection = custom_collection ? JSON.parse(custom_collection['value']) : false;
      product.variants = this.getVariants(variants);
      product.firstAvailableVariant = this.getFirstAvailableVariant(product.variants);
      product.selectedVariant = product.firstAvailableVariant ? product.firstAvailableVariant : product.variants[0];
      product.available = product.variants.every(variant => variant['availableForSale']);
      product.percentageSale = this.getPercentageSale(product.selectedVariant);
      product.badge = this.getBadge(tags);
      product.pre_order = product.selectedVariant.preOrderDate ? product.selectedVariant.preOrderDate > product.selectedVariant.nowDate : false;
      product.sectionId = this.sectionId;
      product.product_form_id = `quick-add-${this.sectionId}${product.id}`;
      delete product['bundle_variants_variant_picker']
      return product
    })
  }

  getBundleVariants(bundle_picker) {
    if (!bundle_picker || !bundle_picker['references']) return false
    return bundle_picker['references']['nodes'].map(variant => {
      const {id} = variant
      variant.id = Number(id.split('/').pop())
      return variant
    })
  }

  getBundleUniqId(bundle_variants, handle) {
    if (!bundle_variants) return false
    let uniqId = handle;
    bundle_variants.forEach(variant => {
      uniqId += `-bundle-separator-${variant.id}`
    })
    return uniqId
  }

  getVariants(variants) {
    return variants['edges'].map(item => {
      const {id, metafield, compareAtPrice, price} = item['node'];
      const variant = {...item['node']};
      variant.id = Number(id.split('/').pop());
      variant.preOrderDate = metafield ? new Date(metafield.value).getTime() / 1000 : null;
      variant.nowDate = new Date().getTime() / 1000;
      variant.preOrderDateProp = variant.preOrderDate ? new Date(metafield.value): null;
      variant.compareAtPriceVal = Number(compareAtPrice) * 100;
      variant.priceVal = Number(price) * 100;
      delete variant['metafield'];
      return variant
    })
  }

  getFirstAvailableVariant(variants) {
    const firstAvailableVariant = variants.find(variant => variant['availableForSale'])
    return firstAvailableVariant ? firstAvailableVariant : false;
  }

  getPercentageSale(selectedVariant) {
    let percentageSale = 0;
    if (selectedVariant.compareAtPriceVal > selectedVariant.priceVal) {
      percentageSale = 100 - ((selectedVariant.priceVal * 100) / selectedVariant.compareAtPriceVal).toFixed()
    }
    return percentageSale + '%'
  }

  getCustomCollections(custom_collection) {
    const product_collections = custom_collection ? JSON.parse(custom_collection['value']) : false;
    if (!product_collections) return false
    if (this.globalCollectionsObj) {
      const collections = product_collections.reduce((arr, collection) => {
        const collection_handle = handleize(collection)
        const global_collection = this.globalCollectionsObj.find(glCol => glCol['heading_handle'] === collection_handle)
        return global_collection ? [...arr, global_collection] : [...arr]
      }, [])
      return collections.length ? collections: false
    }
  }

  getBadge(tags) {
    const badge = tags.find(tag => tag.includes('badge'))
    return badge ? badge : false
  }

  getFeaturedImageJson(media) {
    if (!media || !media.length) return false
    return media[0]['image']['src'].split('https:').pop()
  }

  renderDetails() {
    if (!this.detailsSource) return
    const detailsSource = this.detailsSource.innerHTML,
      template = Handlebars.compile(detailsSource);
    this.details.innerHTML = template(this.location);
    const {latitude, longitude} = this.location;
    if (latitude.toString().length && longitude.toString().length) this.loadGoogleMap();
  }

  renderCollection() {
    if (!this.collectionSource || !this.products) return
    const collectionSource = this.collectionSource.innerHTML,
      template = Handlebars.compile(collectionSource);
    const title = this.location['business'] ? `Shop ${this.location['business']}` : '';
    this.collection.innerHTML = template({
      products:this.products,
      title: title,
      banner_mobile_position: this.bannerPosition(2, 5),
      banner_desktop_position: this.bannerPosition(3, 4)
    })
  }

  bannerPosition(columnsCount, maxVal) {
    const rowsCount = this.products.length / columnsCount
    switch (true) {
      case Math.ceil(rowsCount) >= maxVal:
        return maxVal;
      case Math.ceil(rowsCount) <= 3:
        return 2;
      case Math.ceil(rowsCount) >= 3 && Math.ceil(rowsCount) < maxVal:
        return Math.ceil(rowsCount) - 1
    }
  }

  loadGoogleMap() {
    this.googleMapScript = document.createElement('script');
    this.googleMapScript.src = window.googleMap.scriptSrc;
    document.head.append(this.googleMapScript);
    this.googleMapScript.onload = () => this.initMap();
  }

  initMap() {
    const myLatLng = { lat: this.location.latitude, lng: this.location.longitude };
    const map = new google.maps.Map(this.querySelector('#map'), {
      zoom: 15,
      center: myLatLng,
      styles: window.googleMap.styles
    });

    const marker = new google.maps.Marker({
      position: myLatLng,
      icon: window.googleMap.marker,
      map,
      title: this.location.name,
    });
    this.querySelector('.finder-details__address-map-inner').removeAttribute('hidden')
    const direction = this.querySelector('.finder-details__address-direction')
    if (direction) {
      direction.addEventListener('mouseover', ()=> marker.setIcon(window.googleMap.markerHoverActive))
      direction.addEventListener('mouseleave', ()=> marker.setIcon(window.googleMap.marker))
    }
  }

  updateBanners() {
    const bannerGeneric = this.querySelector('.finder-details__banner_generic');
    const bannerSkintrinsiq = this.querySelector('.finder-details__banner_skintrinsiq');
    const phoneLink = this.querySelectorAll('.text-banner__btn-phone');

    if (this.location?.skintrinsiqProvider) {
      if (bannerSkintrinsiq) bannerSkintrinsiq.classList.remove('hide');
    } else {
      if (bannerGeneric) bannerGeneric.classList.remove('hide');
    }

    if (this.location.phoneNumber) {
      phoneLink.forEach((link) => {
        link.setAttribute('href', `tel:${this.location.phoneNumber}`);
        link.removeAttribute('disabled');
      })
    }
  }
}

customElements.define('physician-finder-details', PhysicianFinderDetails)
