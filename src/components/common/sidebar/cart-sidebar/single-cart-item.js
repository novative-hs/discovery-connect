import React from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { remove_product } from "src/redux/features/cartSlice";
import Quantity from "@components/products/quantity";

const SingleCartItem = ({ item }) => {
  const { _id, diseasename, price, title, quantity, discount } =
    item || {};
  const dispatch = useDispatch();

  // handle remove cart
  const handleRemoveProduct = (prd) => {
    dispatch(remove_product(prd));
  };
  return (
    <div className="cartmini__widget-item">
      <div className="cartmini__thumb">
        <Link href={`/product-details/${_id}`}>
   <span>{diseasename}</span>
        </Link>
      </div>
      <div className="cartmini__content">
        <h5>
          <a href={`/product-details/${_id}`}>{title}</a>
        </h5>
        <div className="cartmini__price-wrapper">
          {!quantity && (
            <span className="cartmini__price">${quantity}</span>
          )}
          {discount > 0 && (
            <span className="cartmini__price">
              ${(price - (price * discount) / 100) * quantity}
            </span>
          )}
          {/* <span className="cartmini__quantity">{quantity}</span> */}
        </div>
      </div>
      <button
        className="cartmini__del"
        onClick={() => handleRemoveProduct(item)}
      >
        <i className="fal fa-times"></i>
      </button>
    </div>
  );
};

export default SingleCartItem;
