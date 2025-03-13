const debounce = (fn, wait) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
};
/**
 *
 * @param {tags, currentVariant, isPreOrder, shipOnDate, productId, fewItemsLeft, sellingFast, badge} args
 * @returns
 */

const atcBuilder = (
  args = {
    tags: [],
    currentVariant: "",
    isPreOrder: false,
    isBundle: false,
    delayed: false,
    shipOnDate: "",
    productId: false,
    fewItemsLeft: false,
    sellingFast: false,
    badge: "",
    giftCardName: "",
    giftCardEmail: "",
    giftCardMessage: "",
    giftCardFrom: "",
    compareAtPrice: false,
  }
) => {
  let _tag = null;
  if (args.tags?.includes("FinalSale")) {
    _tag = "FinalSale";
  } else if (args.tags?.includes("gift-card")) {
    _tag = "gift-card";
  } else if (args.tags?.includes("coming-soon")) {
    _tag = "waitlist";
  }

  let itemProps = {
    id: args.currentVariant,
    quantity: 1,
  };

  if (_tag) {
    itemProps = {
      id: args.currentVariant,
      quantity: 1,
      properties: {
        _tag: _tag,
      },
    };
  }

  if (
    !!args.giftCardName ||
    !!args.giftCardEmail ||
    !!args.giftCardMessage ||
    !!args.giftCardFrom
  ) {
    itemProps = {
      id: args.currentVariant,
      quantity: 1,
      properties: {
        "Recipient name": args.giftCardName,
        "Recipient email": args.giftCardEmail,
        __shopify_send_gift_card_to_recipient: true,
        Message: args.giftCardMessage,
        from: args.giftCardFrom,
      },
    };
  }

  if (args.badge) {
    itemProps = {
      id: args.currentVariant,
      quantity: 1,
      properties: {
        _BADGE: args.badge.toUpperCase(),
      },
    };
  }

  if (args.fewItemsLeft) {
    if (itemProps.properties) {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          ...itemProps.properties,
          _fewItemsLeft: `${args.fewItemsLeft}`,
        },
      };
    } else {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          _fewItemsLeft: `${args.fewItemsLeft}`,
        },
      };
    }
  }

  if (args.sellingFast) {
    if (itemProps.properties) {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          ...itemProps.properties,
          _sellingFast: `${args.sellingFast}`,
        },
      };
    } else {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          _sellingFast: `${args.sellingFast}`,
        },
      };
    }
  }

  if (args.shipOnDate) {
    if (itemProps.properties) {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          ...itemProps.properties,
          "Pre-Order": `Ships By ${args.shipOnDate.toUpperCase()}`,
        },
      };
    } else {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          "Pre-Order": `Ships By ${args.shipOnDate.toUpperCase()}`,
        },
      };
    }
  }

  if (args.isBundle) {
    if (itemProps.properties) {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          ...itemProps.properties,
          _BUNDLE: true,
        },
      };
    } else {
      itemProps = {
        id: args.currentVariant,
        quantity: 1,
        properties: {
          _BUNDLE: true,
        },
      };
    }
  }

  if (args.delayed) {
    itemProps.properties["_DELAYED"] = args.delayed;
  }

  if (args.productId) {
    itemProps.productId = args.productId;
  }

  if (args.compareAtPrice) {
    if (itemProps.properties !== undefined) {
      itemProps.properties._COMPARE_AT_PRICE = args.compareAtPrice;
    } else {
      itemProps.properties = { _COMPARE_AT_PRICE: args.compareAtPrice };
    }
  }

  return itemProps;
};

export { debounce, atcBuilder };

document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href").trim();
    if (targetId === "#") return;
    const targetElement = document.querySelector(targetId);

    if (!targetElement) return;

    const offset =
      targetElement.getBoundingClientRect().top + window.scrollY - 50;

    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  });
});
