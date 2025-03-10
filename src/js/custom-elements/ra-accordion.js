import { getToken } from "@bva/ui-shared/helpers";
export default class RaAccordion extends HTMLElement {
  constructor() {
    super();
    this.items = this.querySelectorAll(".ra-accordion-item");
    this.allowMultipleOpen = this.getAttribute("data-multi-open");
    this.toggleAccordion = this.toggleAccordion.bind(this);
  }

  connectedCallback() {
    const breakpointMd = getToken("breakpoints.px.md"); // 768px
    let breakpoint = getToken("breakpoints.px.md");
    this.items.forEach((btn) => {
      if (btn.classList.contains("filter-accordion")) {
        breakpoint = getToken("breakpoints.px.lg");
      }
      this.toggleHeight(btn);
      if (btn.classList.contains("open") && window.innerWidth < breakpoint) {
        const accordionContent = btn.querySelector(
          ".ra-accordion-item__content"
        );
        accordionContent.style.height = `auto`;
      }
      const btnHeader = btn.querySelector(".ra-accordion-item__header");
      const accordionTrigger = btnHeader ? btnHeader : btn;
      accordionTrigger?.addEventListener("click", () =>
        this.toggleAccordion(btn)
      );
    });

    window.addEventListener("resize", () => {
      this.items.forEach((btn) => {
        if (
          btn.classList.contains("open") &&
          window.innerWidth > breakpointMd
        ) {
          this.toggleHeight(btn);
        }
      });
    });
  }

  toggleAccordion(btn) {
    btn.classList.toggle("open");
    this.toggleHeight(btn);
    if (this.allowMultipleOpen !== "true") {
      this.items.forEach((item) => {
        if (item !== btn) {
          item.classList.remove("open");
          this.toggleHeight(item);
        }
      });
    }
  }

  toggleHeight(btn) {
    const accordionContent = btn.querySelector(".ra-accordion-item__content");
    const contentHeight = accordionContent.children[0].offsetHeight;
    if (btn.classList.contains("open")) {
      accordionContent.style.height = `${contentHeight}px`;
    } else {
      accordionContent.style.height = "0px";
    }
  }
}
