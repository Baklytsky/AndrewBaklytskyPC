if (!customElements.get('show-more-button')) {
  customElements.define(
    'show-more-button',
    class ShowMoreButton extends HTMLElement {
      constructor() {
        super();
        const button = this.querySelector('button');
        button.addEventListener('click', (event) => {
          this.expandShowMore(event);
          const nextElementToFocus = event.target.closest('[data-parent-display]').querySelector('[data-show-more]');
          if (nextElementToFocus && !nextElementToFocus.classList.contains('hidden') && nextElementToFocus.querySelector('input')) {
            nextElementToFocus.querySelector('input').focus();
          }
        });
      }
      expandShowMore(event) {
        const parentDisplay = event.target.closest('[id^="Show-More-"]').closest('[data-parent-display]');
        const parentWrap = parentDisplay.querySelector('[data-parent-wrap]');
        this.querySelectorAll('[data-label-text]').forEach((element) => element.classList.toggle('hidden'));
        parentDisplay.querySelectorAll('[data-show-more]').forEach((item) => item.classList.toggle('hidden'));
        if (!this.querySelector('[data-show-less]')) {
          this.classList.add('hidden');
        }
      }
    }
  );
}
