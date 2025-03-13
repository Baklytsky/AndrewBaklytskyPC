const openBuyBox = () => {
  const buyBoxEl = document.getElementById("product-buy-box");
  const translateHeight =
    window.innerHeight -
    (document.getElementsByClassName("ra-preheader")?.[0]?.offsetHeight || 46) -
    (document.getElementsByClassName("header__wrapper")?.[0]?.offsetHeight ||
      0);

  if (buyBoxEl) {
    buyBoxEl.style.cssText = `height: ${translateHeight}px;`;
    buyBoxEl.classList.add("product-buy-box--open");
  }
};

const closeBuyBox = () => {
  const buyBoxEl = document.getElementById("product-buy-box");

  if (buyBoxEl) {
    buyBoxEl.style.cssText = `height: 185px; overflow: none`;
    buyBoxEl.classList.remove("product-buy-box--open");
  }
};

export { openBuyBox, closeBuyBox };
