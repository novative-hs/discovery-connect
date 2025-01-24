import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  quantityIncrement,
  quantityDecrement,
  remove_product,
  add_cart_product,
} from "src/redux/features/cartSlice";

const SingleCartItem = ({ sample }) => {
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
    <div className="cartmini__widget-item d-flex justify-content-between align-items-center p-3 mb-4 border rounded shadow-sm bg-light">
      <div className="cartmini__content d-flex">
        {/* Sample details */}
        {sample && (
          <div className="cartmini__details">
             <h5 className="fw-bold mb-3 fs-5">
              <strong className="text-dark">Sample Name: </strong>
              <span className="text-primary">{sample.samplename}</span>
            </h5>
            <p className="text-dark fs-5 mb-3">
              <strong>Price:</strong>{" "}
              {getCurrencySymbol(sample.SamplePriceCurrency)}
              {sample.price}
            </p>
            <div className="d-flex align-items-center mb-3 gap-2">
              <h6 className="fw-bold text-dark fs-5 mb-0">
                <strong>Quantity:</strong>
              </h6>
              <button
                onClick={() => handleQuantityChange(-1)}
                className="btn btn-outline-secondary btn-sm fw-bold"
              >
                -
              </button>
              <span className="fs-5 fw-bold">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="btn btn-outline-secondary btn-sm fw-bold"
              >
                +
              </button>
            </div>
            <p className="text-dark fs-5 mb-3">
              <strong>Lab Name:</strong> {sample.labname}
            </p>
            <p className="text-dark fs-5 mb-3">
              <strong>Condition:</strong> {sample.samplecondition}
            </p>
            <p className="text-danger fw-bold fs-5 mb-3">
              <strong>Discount:</strong> {sample.discount}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleCartItem;
