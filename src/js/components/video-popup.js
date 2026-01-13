if (!customElements.get('video-popup')) {
  customElements.define(
    'video-popup',

    class VideoPopup extends HTMLElement {
      constructor() {
        super();
      }

      connectedCallback() {
        this.querySelectorAll('[data-video-play]')?.forEach((button) => {
          button.addEventListener('click', (e) => {
            const button = e.currentTarget;
            if (button.getAttribute('data-video-play').trim() !== '') {
              e.preventDefault();

              const items = [
                {
                  html: button.dataset.videoPlay,
                },
              ];

              const options = {
                mainClass: 'pswp--video',
                closeOnScroll: false,
                closeOnVerticalDrag: false,
              };

              new window.theme.LoadPhotoswipe(items, options);
              window.theme.a11y.lastElement = button;
            }
          });
        });
      }
    }
  );
}
