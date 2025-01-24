import React from "react";

const OrderSingleCartItem = ({ title, price,quantity,total,discount,Currency }) => {

  const getCurrencySymbol = (Currency) => {
    switch (Currency?.toLowerCase()) {
      case "pkr":
        return "Rs";
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "gbp":
        return "£";
      default:
        return Currency || ""; // Default to empty if currency is unknown
    }
  };

  return (
    <tr className="cart_item">
      <td className="product-name">
      <span className="product-name">{title} </span>
      </td>
      <td className="product-name text-center">
        <strong className="product-quantity ">  {getCurrencySymbol(Currency)} {price}</strong>
      </td>
      <td className="product-name text-center">
        <strong className="product-quantity">{quantity}</strong>
      </td>
      <td className="product-total text-center">
      <strong className="product-quantity "> {discount}%</strong>
      </td>
      <td className="product-total text-end">
  <span className="amount"> {getCurrencySymbol(Currency)}{parseFloat(price * quantity).toFixed(2)}</span>
</td>

    </tr>
  );
};

export default OrderSingleCartItem;
