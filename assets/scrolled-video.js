class ScrolledVideo extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const desktop = window.innerWidth > 749;
    const windowHeight = window.innerHeight;
    const iOS = !window.MSStream && /iPad|iPhone|iPod|iPad Simulator|iPhone Simulator|iPod Simulator/.test(navigator.userAgent); // fails on iPad iOS 13
    const playbackConst = 200;
    const setHeight = this;
    const video = this.querySelector('video');

    this.sizeDeviceType = this.dataset.deviceType;

    if (this.sizeDeviceType === 'mobile' && desktop) {
      this.remove();
      return false;
    }

    if (this.sizeDeviceType === 'desktop' && !desktop) {
      this.remove();
      return false;
    }

    if (!desktop && !iOS) {
      video.setAttribute('loop', true);
      video.setAttribute('autoplay', true);
      return false;
    }

    if (video.readyState === 0) {
      video.addEventListener('loadedmetadata', function() {
        setHeight.style.height = Math.floor(video.duration) * playbackConst + windowHeight + "px";
      });
    } else {
      setHeight.style.height = Math.floor(video.duration) * playbackConst + windowHeight + "px";
    }

    function scrollPlay(){
      video.currentTime  = window.pageYOffset / playbackConst;
      window.requestAnimationFrame(scrollPlay);
    }

    window.requestAnimationFrame(scrollPlay);
  }
}
customElements.define('scrolled-video', ScrolledVideo);
