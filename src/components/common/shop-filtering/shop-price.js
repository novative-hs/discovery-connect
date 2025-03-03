import React, { useState } from "react";
import PriceItem from "./price-item";

import { useRouter } from "next/router";

const ShopPrice = ({ all_products }) => {
  const router = useRouter();
  const handlePrice = (min, max) => {
    if (min) {
      router.push(`/shop?priceMin=${min}&max=${max}`);
    } else {
      router.push(`/shop?priceMax=${max}`);
    }
  };
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id="price__widget">
        <button
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#price_widget_collapse"
          aria-expanded="true"
          aria-controls="price_widget_collapse"
        >
          Price
        </button>
      </h2>
      <div
        id="price_widget_collapse"
        className="accordion-collapse collapse show"
        aria-labelledby="price__widget"
        data-bs-parent="#shop_price"
      >
        <div className="accordion-body">
          <div className="shop__widget-list">
                {/* <div className="shop__widget-list-item">
                <input
                  onChange={() => handlePrice(min, max)}
                  type="checkbox"
                  // id={`higher-${id}`}
                  checked={
                    // router.query.priceMin === `${min}` ||
                    router.query.priceMax === `${max}`
                      ? "checked"
                      : false
                  }
                />
                {max < 200 ? (
                  <label htmlFor={`higher-${id}`}>
                    ${min}.00 - ${max}.00
                  </label>
                ) : (
                  <label htmlFor={`higher-${id}`}>
                    ${max}.00+
                  </label>
                )}
              </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPrice;
