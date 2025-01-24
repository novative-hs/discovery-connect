import React, { useState, useEffect } from "react";
import OrderDetails from "./order-details";
import PaymentCardElement from "@components/order/pay-card-element";
import OrderSingleCartItem from "./order-single-cart-item";

const OrderArea = ({
  stripe,
  error,
  register,
  errors,
  discountAmount,
  shippingCost,
  cartTotal,
  handleShippingCost,
  setClientSecret,
  isCheckoutSubmit,
}) => {
  const id = localStorage.getItem("userID");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Fetch cart from localStorage and parse it to an object
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart)); // Store the parsed cart in state
    }
  }, []);

  console.log("Cart from localStorage:", cart);

  return (
    <div className="your-order mb-30">
      <h3>Your order</h3>
      <div className="your-order-table table-responsive">
        <table>
          <thead>
            <tr>
              <th className="product-name">Product</th>
              <th className="product-name text-center">Price</th>
              <th className="product-name text-center">Quantity</th>
              <th className="product-name text-center">Discount</th>
              <th className="product-total text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart && cart.length > 0 ? (
              cart.map((item, i) => (
                <OrderSingleCartItem
                  key={i}
                  title={item.samplename}
                  quantity={item.samplequantity}
                  price={item.price}
                  discount={item.discount}
                  total={item.totalpayment}
                  Currency={item.Currency}
                />
              ))
            ) : (
              <tr>
                <td colSpan="3">No items in cart</td>
              </tr>
            )}
          </tbody>
          {/* Uncomment this block if you want to include order details */}
          <tfoot>
            <OrderDetails cart={cart} />
          </tfoot>
        </table>
      </div>

      <div className="payment-method faq__wrapper tp-accordion">
        <div className="accordion" id="checkoutAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="checkoutOne">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#bankOne"
                aria-expanded="true"
                aria-controls="bankOne"
              >
                Direct Bank Transfer
                <span className="accordion-btn"></span>
              </button>
            </h2>
            <div
              id="bankOne"
              className="accordion-collapse collapse show"
              aria-labelledby="checkoutOne"
              data-bs-parent="#checkoutAccordion"
            >
              <div className="accordion-body">
                <PaymentCardElement
                  stripe={stripe}
                  cardError={error}
                  cart_products={cart}
                  isCheckoutSubmit={isCheckoutSubmit}
                />
              </div>
              <div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderArea;
