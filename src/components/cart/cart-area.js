import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus } from "@svg/index";
// Internal Imports
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { remove_product, increment, decrement } from "src/redux/features/cartSlice";

const CartArea = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const userID = typeof window !== "undefined" ? localStorage.getItem("userID") : null;

  // Redirect based on userID
  const handleProceedToCheckout = () => {
    if (userID) {
      router.push("/checkout");
    } else {
      router.push("/login?from=checkout");
    }
  };
  

  // Handle Remove Product
  const handleRemovePrd = (prd) => dispatch(remove_product(prd));

  // Handle Quantity Increase/Decrease
  const handleIncrease = (item) => dispatch(increment({ id: item.id }));
  const handleDecrease = (item) => dispatch(decrement({ id: item.id }));

  // Calculate subtotal
  const subtotal = cart_products.reduce(
    (acc, item) => acc + item.price * item.orderQuantity,
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
                  <div className="tp-continue-shopping">
                    <p>
                      <Link href="/shop">
                        Continue Shopping <i className="fal fa-reply"></i>
                      </Link>
                    </p>
                  </div>
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th className="product-thumbnail">Sample</th>
                        <th className="product-price">Price</th>
                        <th className="product-quantity">Quantity</th>
                        <th className="product-subtotal">Total</th>
                        <th className="product-remove">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart_products.map((item, i) => (
                        <tr key={i}>
                          <td className="product-name">
                            <Link href={`product-details/${item._id || item.id}`}>
                              {item.samplename}
                            </Link>
                          </td>
                          <td className="product-price">
                            <span className="amount">{item.price.toFixed(2)}</span>
                          </td>
                          <td className="product-quantity">
                            <div className="tp-product-quantity mt-10 mb-10">
                              <span className="tp-cart-minus" onClick={() => handleDecrease(item)}>
                                <Minus />
                              </span>
                              <input
                                className="tp-cart-input"
                                type="text"
                                value={item.orderQuantity}
                                readOnly
                              />
                              <span className="tp-cart-plus" onClick={() => handleIncrease(item)}>
                                <Plus />
                              </span>
                            </div>
                          </td>
                          <td className="product-subtotal">
                            <span className="amount">{(item.price * item.orderQuantity).toFixed(2)}</span>
                          </td>
                          <td className="product-remove">
                            <button type="button" onClick={() => handleRemovePrd(item)}>
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
                      <button className="tp-btn cursor-pointer" onClick={handleProceedToCheckout}>
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
