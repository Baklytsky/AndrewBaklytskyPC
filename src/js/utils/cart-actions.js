const EVENT_TOGGLE_CART = "toggleCart";

const cartToggle = () => {
  window.dispatchEvent(new Event(EVENT_TOGGLE_CART));
};

export { cartToggle };
