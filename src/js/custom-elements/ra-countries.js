export default class RaCountries extends HTMLElement {
  constructor() {
    super();
    this.title = "Countries";
    this.elements = {
      country_input: this.querySelector("input[name='country_code']"),
      language_input: this.querySelector("input[name='language_code']"),
      form: this.querySelector("form"),
    };
    this.querySelectorAll("a[data-country]").forEach((item) =>
      item.addEventListener("click", this.countryClick.bind(this))
    );
    this.initialize();
  }

  async fetchCountry() {
    try {
      const response = await fetch(
        window.Shopify.routes.root +
          "browsing_context_suggestions.json" +
          "?country[enabled]=true" +
          `&country[exclude]=${window.Shopify.country}` +
          "&language[enabled]=true" +
          `&language[exclude]=${window.Shopify.language}`
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching country:", error);
      throw error;
    }
  }

  async initialize() {
    try {
      const countryData = await this.fetchCountry();
      this.countryData = countryData;
    } catch (error) {
      return false;
    }
    if (this.countryData) {
      const detected_country = this.countryData.detected_values.country;
      window.shopify_detected_country = detected_country.handle;
      const detected_country_object = window.shopify_available_countries.find(
        (x) =>
          x.iso_code?.toLowerCase() === detected_country.handle?.toLowerCase()
      );
      if (
        window.shopify_country_default !==
        this.countryData?.detected_values.country.handle.toLowerCase()
      ) {
        const country_checker_modal = this.querySelector(
          "[data-dialog-id=country-checker-modal]"
        );
        const country_toggles = this.querySelectorAll("[data-toggle-country]");
        const tab_containers = this.querySelectorAll("[data-tab-container]");
        if (country_checker_modal && detected_country_object)
          this.countryModalToggle(
            country_checker_modal,
            detected_country_object
          );
        country_toggles.forEach((country_toggle) =>
          country_toggle.addEventListener("click", () => {
            tab_containers.forEach((tab_container) =>
              tab_container.classList.toggle("hidden")
            );
          })
        );
      }
    }
  }

  countryModalToggle(modal, detectedCountry) {
    const local_country_code = localStorage.getItem("shopify_country_code");
    const country_image = modal.querySelector("[data-country-image]");
    const country_names = Array.from(
      modal.querySelectorAll("[data-country-name]")
    );
    const currency_name = modal.querySelector("[data-currency-name]");
    const currency_symbol = modal.querySelector("[data-currency-symbol]");
    const submit_button = modal.querySelector("[data-set-country]");
    const close_button = modal.querySelector("[data-modal-close]");
    if (country_image) {
      country_image.src = detectedCountry.flag_image;
      country_image.alt = detectedCountry.country_name;
    }
    if (country_names) {
      country_names.forEach((country_name) => {
        country_name.innerText = detectedCountry.country_name;
      });
    }
    if (currency_name) currency_name.innerText = detectedCountry.currency_name;
    if (currency_symbol)
      currency_symbol.innerText = detectedCountry.currency_symbol;
    if (submit_button) {
      submit_button.addEventListener("click", (e) => {
        e.preventDefault();
        this.setCountry(
          detectedCountry.iso_code,
          detectedCountry.language_code
        );
      });
    }
    if (close_button) {
      close_button.addEventListener("click", () => {
        localStorage.setItem("shopify_country_code", window.Shopify.country);
        localStorage.setItem("shopify_language_code", window.Shopify.locale);
      });
    }
    if (
      window.shopify_country_default !== "" &&
      (local_country_code?.toLowerCase() !==
        window.shopify_detected_country?.toLowerCase() ||
        window.shopify_country_default?.toLowerCase() !==
          window.shopify_detected_country?.toLowerCase())
    ) {
      modal?.showModal();
    }
  }

  countryClick(e) {
    e.preventDefault();
    const { countryCode, languageCode } = e.target.dataset;
    this.setCountry(countryCode, languageCode);
  }

  setCountry(country_code, language_code) {
    this.elements.country_input.value = country_code;
    this.elements.language_input.value = language_code;
    if (this.elements.form) {
      localStorage.setItem("shopify_country_code", country_code);
      localStorage.setItem("shopify_language_code", language_code);
      this.elements.form.submit();
    }
  }
}
