const currencySymbol = window?.CURRENCY_DATA?.currencySymbol
  ? window.CURRENCY_DATA.currencySymbol
  : "";

const currencyCode = window?.CURRENCY_DATA?.currencyCode
  ? window.CURRENCY_DATA.currencyCode
  : "";

export const money = (val) => {
  val = val / 100;
  const locale_root = window.shopify_locale_current;
  const currency_code = window.shopify_currency_code;
  const default_currency_code = window.shopify_currency_default;
  if (default_currency_code != currency_code) {
    val = new Intl.NumberFormat(locale_root.split("/").pop(), {
      style: "currency",
      currency: currency_code,
    }).format(val);
    return `${val} ${currency_code}`;
  } else {
    let str = String(val);
    str += str.indexOf(".") < 0 ? ".00" : "00";
    return `${currencySymbol}${str.substring(
      0,
      str.indexOf(".") + 3
    )} ${currencyCode}`;
  }
};

export const moneyWithoutDecimals = (val) => {
  return money(val).replace(/\.00/g, "");
};
