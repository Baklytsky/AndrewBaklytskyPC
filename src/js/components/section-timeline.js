if (!customElements.get('timeline-component')) {
  customElements.define(
    'timeline-component',
    class Timeline extends HTMLElement {
      constructor() {
        super();

        this.contentRows = this.querySelectorAll('[data-timeline-row-content]');
        this.imageRows = this.querySelectorAll('[data-timeline-row-image]');
        this.titles = this.querySelectorAll('[data-timeline-title]');
        this.selectedIndex = 0;
        this.intervalId = null;
        this.isPaused = false;
      }

      connectedCallback() {
        if (this.contentRows.length === 0) return;

        this.titles.forEach((title) => {
          title.addEventListener('click', () => {
            const row = title.closest('[data-timeline-row-content]');
            const index = [...this.contentRows].indexOf(row);
            if (index !== -1) this.selectRow(index);
          });
        });

        this.addEventListener('mouseenter', () => this.pause());
        this.addEventListener('mouseleave', () => this.resume());

        this.startAutoplay();
      }

      disconnectedCallback() {
        this.stopAutoplay();
      }

      clearRowSelection() {
        this.contentRows.forEach((row) => row.classList.remove('is-selected'));
        this.imageRows.forEach((row) => row.classList.remove('is-selected'));
      }

      applyRowSelection(index) {
        this.contentRows[index]?.classList.add('is-selected');
        this.imageRows[index]?.classList.add('is-selected');
      }

      selectRow(index) {
        this.selectedIndex = index;
        this.clearRowSelection();
        this.applyRowSelection(this.selectedIndex);
        if (!this.isPaused) this.startAutoplay();
      }

      startAutoplay() {
        this.stopAutoplay();
        this.intervalId = setInterval(() => {
          this.selectedIndex = (this.selectedIndex + 1) % this.contentRows.length;
          this.clearRowSelection();
          this.applyRowSelection(this.selectedIndex);
        }, 5000);
      }

      stopAutoplay() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }

      pause() {
        this.isPaused = true;
        this.stopAutoplay();
        this.classList.add('is-paused');
      }

      resume() {
        this.isPaused = false;
        this.classList.remove('is-paused');
        this.startAutoplay();
      }
    }
  );
}
