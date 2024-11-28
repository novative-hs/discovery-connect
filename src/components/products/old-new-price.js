import React from "react";

const OldNewPrice = ({ originalPrice, discount }) => {
  // Calculate the discounted price
  const discountedPrice = (
    Number(originalPrice) -
    (Number(originalPrice) * Number(discount)) / 100
  );

  return (
    <div className="product__price">
      <del className="product__ammount old-price">
        ${originalPrice?.toFixed(2) || "0.00"}
      </del>
      <span className="product__ammount new-price">
        ${discountedPrice?.toFixed(2) || "0.00"}
      </span>
    </div>
  );
};

export default OldNewPrice;
