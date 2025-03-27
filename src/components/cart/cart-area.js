import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus } from "@svg/index";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import {
  remove_product,
  increment,
  decrement,
  updateQuantity,
} from "src/redux/features/cartSlice";

const CartArea = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userID") : null;

  // Local state to track quantity input and errors
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities };
      cart_products.forEach((item) => {
        if (!newQuantities[item.id]) {
          newQuantities[item.id] = item.orderQuantity || 1; // Ensure default is 1
        }
      });
      return newQuantities;
    });
  }, [cart_products]);

  const handleProceedToCheckout = () => {
    if (userID) {
      router.push("/checkout");
    } else {
      router.push("/login?from=checkout");
    }
  };

  const handleRemovePrd = (prd) => dispatch(remove_product(prd));

  const handleIncrease = (item) => {
    setQuantities((prev) => {
      const newQuantity = (prev[item.id] ?? item.orderQuantity) + 1;
      if (newQuantity <= item.quantity) {
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
        return { ...prev, [item.id]: newQuantity };
      }
      return prev;
    });
  };

  const handleDecrease = (item) => {
    setQuantities((prev) => {
      const newQuantity = (prev[item.id] ?? item.orderQuantity) - 1;
      if (newQuantity >= 1) {
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
        return { ...prev, [item.id]: newQuantity };
      }
      return prev;
    });
  };

  const handleQuantityChange = (e, item) => {
    let value = e.target.value.trim();

    if (value === "") {
      setQuantities((prev) => ({ ...prev, [item.id]: "" }));
      return;
    }

    if (/^\d+$/.test(value)) {
      let quantity = parseInt(value, 10);
      if (quantity > item.quantity) {
        setErrors((prev) => ({
          ...prev,
          [item.id]: `Only ${item.quantity} in stock`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, [item.id]: "" }));
        setQuantities((prev) => ({ ...prev, [item.id]: quantity }));
        dispatch(updateQuantity({ id: item.id, quantity }));
      }
    }
  };

  const handleQuantityBlur = (item) => {
    let quantity = quantities[item.id];

    if (!quantity || quantity < 1) {
      quantity = 1;
      setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
      dispatch(updateQuantity({ id: item.id, quantity }));
    }
  };

  const subtotal = cart_products.reduce(
    (acc, item) => acc + item.price * (quantities[item.id] ?? 1),
    0
  );

  return (
    <section className="cart-area pt-100 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {cart_products.length > 0 ? (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="table-content table-responsive">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>Sample</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart_products.map((item, i) => (
                        <tr key={i}>
                          <td>{item.samplename}</td>
                          <td>{item.price.toFixed(2)}</td>
                          <td className="product-quantity">
                            <div className="tp-product-quantity mt-10 mb-10">
                              <span
                                className="tp-cart-minus"
                                onClick={() => handleDecrease(item)}
                              >
                                <Minus />
                              </span>
                              <input
                                className="tp-cart-input"
                                type="text"
                                value={quantities[item.id] ?? 1} // Always fallback to 1
                                onChange={(e) => handleQuantityChange(e, item)}
                                onBlur={() => handleQuantityBlur(item)}
                              />

                              <span
                                className="tp-cart-plus"
                                onClick={() => handleIncrease(item)}
                              >
                                <Plus />
                              </span>
                            </div>
                            {errors[item.id] && (
                              <p className="text-danger">{errors[item.id]}</p>
                            )}
                          </td>
                          <td className="product-subtotal">
                            <span className="amount">
                              {(
                                item.price *
                                (quantities[item.id] ?? item.orderQuantity)
                              ).toFixed(2)}
                            </span>
                          </td>

                          <td className="product-remove">
                            <button
                              type="button"
                              onClick={() => handleRemovePrd(item)}
                            >
                              <i className="fa fa-times"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="row justify-content-end">
                  <div className="col-md-5 mr-auto">
                    <div className="cart-page-total">
                      <h2>Cart Totals</h2>
                      <ul className="mb-20">
                        <li>
                          Subtotal <span>{subtotal.toFixed(2)}</span>
                        </li>
                        <li>
                          Total <span>{subtotal.toFixed(2)}</span>
                        </li>
                      </ul>
                      <button
                        className="tp-btn cursor-pointer"
                        onClick={handleProceedToCheckout}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <EmptyCart />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartArea;
