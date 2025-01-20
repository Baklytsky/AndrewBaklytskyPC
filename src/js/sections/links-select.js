window.addEventListener('DOMContentLoaded', () => {
  const linksSelect = document.getElementById('mobile-links-select');

  linksSelect.addEventListener('change', () => {
    const item = linksSelect.options[linksSelect.selectedIndex];
    const newUrl = item.value.toString();

    if (window.location.pathname !== newUrl) {
      window.location = `${newUrl}`;
    }
  })
})
