export default class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.endDate = this.dataset.endDate;
    this.action = this.dataset.action;
    if (!this.endDate || !this.endDate.length) return;
    if (this.preHeader && !sessionStorage.getItem("preheader-status")) {
      window.addEventListener("resize", () => this.setMargins());
    }
    this.countdownTimer();
  }

  setMargins() {
    this.header = document.querySelector("ra-header");
    this.preHeader = this.closest("pre-header");
    if (
      this.preHeader &&
      this.checkVisibility() &&
      !sessionStorage.getItem("preheader-status")
    ) {
      document.documentElement.style.setProperty(
        "--countdown-margin-top",
        this.clientHeight + "px"
      );
      this.preHeader.setPreHeaderHeight();
    }
  }

  timerText(period) {
    return period < 10 ? "0" + period : period;
  }

  countdownTimer() {
    if (this.preHeader && sessionStorage.getItem("preheader-status")) return;
    this.days = this.querySelector(".days");
    this.hours = this.querySelector(".hours");
    this.minutes = this.querySelector(".minutes");
    this.seconds = this.querySelector(".seconds");

    const second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;

    const endDate = this.dataset.endDate,
      countDown = new Date(endDate).getTime(),
      x = setInterval(() => {
        const now = new Date().getTime(),
          distance = countDown - now,
          days = Math.floor(distance / day),
          hours = Math.floor((distance % day) / hour),
          minutes = Math.floor((distance % hour) / minute),
          seconds = Math.floor((distance % minute) / second);

        this.setDateValues(days, hours, minutes, seconds);

        if (distance < 0) {
          if (this.action === "hide") {
            this.style.display = "none";
            document.documentElement.style.setProperty(
              "--countdown-margin-top",
              "0px"
            );
          }
          if (this.action === "leave") {
            this.style.display = "flex";
            this.setDateValues(0, 0, 0, 0);
          }
          this.setMargins();
          if (this.header) this.header.setHeaderPosition();
          clearInterval(x);
        }

        if (distance > 0 && !this.checkVisibility()) {
          this.style.display = "flex";
          this.setMargins();
          if (this.header) this.header.setHeaderPosition();
        }
      }, 1000);
  }

  setDateValues(days, hours, minutes, seconds) {
    if (this.days) this.days.innerHTML = this.timerText(days);
    if (this.hours) this.hours.innerHTML = this.timerText(hours);
    if (this.minutes) this.minutes.innerHTML = this.timerText(minutes);
    if (this.seconds) this.seconds.innerHTML = this.timerText(seconds);
  }
}
