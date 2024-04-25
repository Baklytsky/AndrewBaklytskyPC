import {formatMoney} from '@shopify/theme-currency';

export function formatPrices(product) {
  const onSale = product.price < product.compare_at_price;
  const soldOut = !product.available;
  const showSoldOut = theme.settings.showSoldBadge;
  const showSale = theme.settings.showSaleBadge;
  const showSavingBadge = theme.settings.showSavingBadge;
  const savingBadgeType = theme.settings.savingBadgeType;
  let soldBadgeText = false;
  let saleBadgeText = false;
  let savingBadgeText = false;
  let price = product.price;
  let priceCompare = product.compare_at_price;
  let priceDifference = priceCompare - price;

  // Custom and Preorder badges
  if (showSavingBadge) {
    if (product.variants.length > 1) {
      product.variants.forEach((variant) => {
        const variantPriceDifference = variant.compare_at_price - variant.price;

        if (variantPriceDifference > priceDifference) {
          priceDifference = variantPriceDifference;
          price = variant.price;
          priceCompare = variant.compare_at_price;
        }
      });
    }

    if (priceDifference > 0) {
      if (savingBadgeType === 'percentage') {
        price = `${Math.round(((-(price / priceCompare) + 1) * 100).toFixed(2))}%`;
      } else {
        price = formatMoney(priceDifference, theme.moneyFormat);
      }

      savingBadgeText = theme.strings.saving_badge.replace('{{ discount }}', price);

      if (product.variants.length > 1) {
        savingBadgeText = theme.strings.saving_up_to_badge.replace('{{ discount }}', price);
      }
    }
  }

  // Sold out badge
  if (showSoldOut && soldOut) {
    soldBadgeText = theme.strings.sold_out;
  }

  // Sale badge
  if (showSale && onSale && !soldOut && !savingBadgeText) {
    saleBadgeText = theme.strings.sale_badge_text;
  }

  const formatted = {
    ...product,
    soldBadgeText,
    saleBadgeText,
    savingBadgeText,
    compare_at_price_max: formatMoney(product.compare_at_price_max, theme.moneyFormat),
    compare_at_price_min: formatMoney(product.compare_at_price_min, theme.moneyFormat),
    price_max: formatMoney(product.price_max, theme.moneyFormat),
    price_min: formatMoney(product.price_min, theme.moneyFormat),
    unit_price: formatMoney(product.unit_price, theme.moneyFormat),
  };

  return formatted;
}
