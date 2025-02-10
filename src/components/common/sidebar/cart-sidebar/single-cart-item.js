import React from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { remove_product } from "src/redux/features/cartSlice";
import Quantity from "@components/products/quantity";

const SingleCartItem = ({ item }) => {
  const { _id, samplename, price, title, quantity, discount } =
    item || {};
  const dispatch = useDispatch();
  const item = useSelector((state) =>
    state.cart.cart_product.find((item) => item.id === sample.id)
  );

  const quantity = item ? item.orderQuantity : 1;

  useEffect(() => {
    if (sample && !item) {
      dispatch(add_cart_product(sample)); // Add sample if not already in cart
    }
  }, [sample, item, dispatch]);

  const handleQuantityChange = (delta) => {
    if (delta > 0) {
      dispatch(quantityIncrement(sample.id)); // Increase quantity
    } else {
      dispatch(quantityDecrement(sample.id)); // Decrease quantity
    }
  };

  const getCurrencySymbol = (currency) => {
    switch (currency?.toLowerCase()) {
      case "pkr":
        return "Rs";
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "gbp":
        return "£";
      default:
        return currency || ""; // Default to empty if currency is unknown
    }
  };

  return (
    <div className="cartmini__widget-item">
      <div className="cartmini__thumb">
        <Link href={`/product-details/${_id}`}>
   <span>{samplename}</span>
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
    </div>
  );
};

export default SingleCartItem;
