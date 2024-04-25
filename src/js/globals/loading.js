function loading() {
  document.documentElement.classList.remove('is-loading');
  document.documentElement.classList.add('is-loaded');
}

export {loading};
