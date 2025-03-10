import { closeBuyBox, openBuyBox } from "../utils/buy-box";

export default class RaMediaGallery extends HTMLElement {
  constructor() {
    super();
    this.open = false;
    this.primarySwiper = this.querySelector(
      ".ra-gallery-carousel__main swiper-container"
    );

    this.loadVideoTriggers = this.querySelectorAll("[data-action-load-video]");
    this.setupEventListeners();
  }

  pauseGalleryVideos() {
    document.querySelectorAll(".ra-iframe--vimeo").forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', "*");
    });
    document.querySelectorAll("video").forEach((video) => video.pause());
  }

  playCurrentVideo() {
    document
      .querySelectorAll(
        ".ra-gallery-carousel__main swiper-container .swiper-slide-active .ra-iframe--vimeo"
      )
      .forEach((video) => {
        video.contentWindow.postMessage('{"method":"play"}', "*");
      });

    document
      .querySelectorAll(
        ".ra-gallery-carousel__main swiper-container .swiper-slide-active video"
      )
      .forEach((video) => {
        video.play();
      });
  }

  setupEventListeners() {
    this.pauseGalleryVideos();

    this.primarySwiper?.addEventListener("slidechange", () => {
      this.pauseGalleryVideos();

      const header = document.querySelector(".header");
      header?.classList?.add("show-mobile-logo");
      setTimeout(() => {
        this.playCurrentVideo();
        document
          .querySelectorAll(
            ".ra-gallery-carousel__main swiper-container .swiper-slide-active button[data-action-load-video]"
          )
          .forEach((el) => {
            el.click();
          });
      }, 100);
    });

    this.primarySwiper?.addEventListener("slideprevtransitionstart", () => {
      setTimeout(() => {
        closeBuyBox();
      }, 10);
    });

    this.primarySwiper?.addEventListener("beforeslidechangestart", () => {
      const isLastSlide = document.querySelectorAll(
        ".ra-gallery-carousel__main swiper-container .swiper-slide-active.swiper-last-slide"
      ).length;

      if (isLastSlide && window.innerWidth < 1024) {
        openBuyBox();
      }
    });

    this.primarySwiper?.addEventListener("beforeinit", () => {
      this.primarySwiper.querySelectorAll("swiper-slide").forEach((slide) => {
        slide.classList.remove("hidden");
      });
    });

    this.loadVideoTriggers.forEach((trigger) => {
      const videoContent = trigger.nextElementSibling.innerHTML;
      trigger.parentElement.innerHTML = videoContent;
    });
  }
}
