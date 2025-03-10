export default class RaRecommendation extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset?.recommendation;
  }

  connectedCallback() {
    if (!this.type || !this.type.length) return;
    this.recommendations = this.querySelector(`[data-type=${this.type}]`);
    this.url = this.recommendations?.dataset?.url;
    if (!this.url || !this.url.length) return;
    this.getRecommendations();
  }

  async fetchData(url) {
    const cachedData = sessionStorage.getItem(url);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const now = new Date();
      if (now - new Date(parsedData.timestamp) < 24 * 60 * 60 * 1000) {
        return parsedData.data;
      }
    }

    const response = await fetch(url);
    const html = await response.text();
    const responseDOM = new DOMParser().parseFromString(html, "text/html");
    const desktop =
      responseDOM.querySelector("[data-recommendation=desktop]")?.innerHTML ||
      "";
    const mobile =
      responseDOM.querySelector("[data-recommendation=mobile]")?.innerHTML ||
      "";
    const data = desktop + mobile;
    const dataToCache = {
      data: data,
      timestamp: new Date().toISOString(),
    };
    sessionStorage.setItem(url, JSON.stringify(dataToCache));

    return data;
  }

  getRecommendations() {
    this.fetchData(this.url)
      .then((text) => {
        const html = new DOMParser().parseFromString(text, "text/html");
        const recommendations = html.querySelector(`[data-type=${this.type}]`);
        if (recommendations && recommendations.innerHTML.trim().length) {
          this.recommendations.innerHTML = recommendations.innerHTML;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

// const productRecommendationsSections = document.querySelectorAll(
//   ".product-recommendations"
// );
//
// const handleIntersection = (entries, observer) => {
//   const sectionID = entries[0].target.dataset.section;
//   const productRecSection = document.querySelector(
//     `[data-section='${sectionID}']`
//   );
//   const desktopRecs = document.getElementById("desktop-recs");
//
//   if (!entries[0].isIntersecting) return;
//
//   observer.unobserve(productRecSection);
//   const url = productRecSection.dataset.url;
//
//   fetch(url)
//     .then((response) => response.text())
//     .then((text) => {
//       const html = document.createElement("div");
//       html.innerHTML = text;
//       const recommendations = html.querySelectorAll(".product-recommendations");
//
//       if (recommendations[0] && recommendations[0].innerHTML.trim().length) {
//         productRecSection.innerHTML = recommendations[0].innerHTML;
//       }
//       if (recommendations[1] && recommendations[1].innerHTML.trim().length) {
//         desktopRecs.innerHTML = recommendations[1].innerHTML;
//       }
//     })
//     .catch((e) => {
//       console.error(e);
//     });
// };
//
// productRecommendationsSections.forEach((carousel) => {
//   if (carousel) {
//     const observer = new IntersectionObserver(handleIntersection, {
//       rootMargin: "0px 0px 200px 0px",
//     });
//
//     observer.observe(carousel);
//   }
// });
