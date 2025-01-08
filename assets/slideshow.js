if (!customElements.get('slideshow-swiper')) {
  class Slideshow extends HTMLElement {
    constructor() {
      super();
      this.config = this.getAttribute('data-config') ? JSON.parse(this.getAttribute('data-config')) : false;
      this.breakpoint = this.getAttribute('data-breakpoint') || false;
      this.arrowsApear = this.getAttribute('data-arrows-appear') || false;
      this.slideShow = this.querySelector('.swiper');
      this.controlSliderId =  this.getAttribute('data-control-slider') || false;
      this.autoplay = this.getAttribute('data-autoplay') || false;

      if (!this.config) {return}

      // Add a11ty parameters
      this.config.a11y = {
        slideRole: ''
      };

      if (this.breakpoint) {
        const breakpoint = window.matchMedia( `(${this.breakpoint})` );
        const breakpointChecker = () => {
          if (breakpoint.matches === true ) {
            if (this.slideShow.swiper) this.slideShow.swiper.destroy( true, true )
          } else { this.sliderSwiper = new Swiper(this.slideShow, this.config);}
        };
        breakpoint.addListener(breakpointChecker);
        breakpointChecker();
      } else {
        this.sliderSwiper = new Swiper(this.slideShow, this.config);
      }

      if ( this.arrowsApear) {
        const observer = new IntersectionObserver(onIntersection, {
          root: null,
          threshold: .5
        })
        function onIntersection(entries, opts){
          entries.forEach(entry => entry.target.classList.toggle('is-inViewport', entry.isIntersecting))
        }
        observer.observe(this)
      }

      if (this.controlSliderId) {
        const controlSlider = this.querySelector(this.controlSliderId)
        const controlSliderConfig = controlSlider.getAttribute('data-config') ? JSON.parse(controlSlider.getAttribute('data-config')) : false;

        if (controlSliderConfig) {
          const newControlSlider = new Swiper(controlSlider, controlSliderConfig);
          this.sliderSwiper.controller.control = newControlSlider;
          newControlSlider.controller.control = this.sliderSwiper;
        }
      }

      if (this.autoplay) {
        this.slideShow.addEventListener('mouseover', (e) => {
          if (!this.sliderSwiper) return
          this.sliderSwiper.autoplay.stop();
        });

        this.slideShow.addEventListener('mouseout', (e) => {
          if (!this.sliderSwiper) return
          this.sliderSwiper.autoplay.start();
        });
      }

      this.addEventListener('click', (e) => {
        if (e.target.closest('[data-custon-next]')) this.sliderSwiper.slideNext()
        if (e.target.closest('[data-custon-prev]')) this.sliderSwiper.slidePrev()
      })
    }
  }

  customElements.define('slideshow-swiper', Slideshow);
}
