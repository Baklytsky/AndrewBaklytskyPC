export const money = (val) => {
  let str = String(parseFloat(val) / 100);
  str += str.indexOf(".") < 0 ? ".00" : "00";
  return `$${str.substring(0, str.indexOf(".") + 3)}`;
};

export const moneyWithoutDecimals = (val) => {
  return money(val).replace(/\.00/g, "");
};
