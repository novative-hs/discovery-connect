import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { clear_cart } from  "../../redux/features/cartSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router"; 
const OrderArea = ({
  stripe,
  isCheckoutSubmit,
}) => {
  const { cart_products } = useSelector((state) => state.cart);
  console.log("cart items are nnnn", cart_products)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const dispatch = useDispatch();
  const router = useRouter(); 
  // Calculate subtotal
  // const calculateSubtotal = () =>
  //   cart_products?.reduce(
  //     (total, item) => total + (item.quantity || 0) * (item.price || 0),
  //     0
  //   );
  // const subtotal = calculateSubtotal();

  // Calculate subtotal and total
  const subtotal = cart_products.reduce(
    (acc, item) => acc + item.price * item.orderQuantity,
    0
  );
  // Handle Payment Submission
  const handleSubmit = async () => {
    const userID = localStorage.getItem("userID"); // Retrieve user ID from local storage
    const accountType = localStorage.getItem("accountType"); // Retrieve account type
  
    const data = {
      researcher_id: userID,
      cart_items: cart_products.map((item) => ({
        sample_id: item.id,
        price: Number(item.price), // Ensure numeric conversion
        samplequantity: Number(item.orderQuantity),
        total: Number(item.orderQuantity) * Number(item.price), // Fix calculation
      })),
      payment_method: selectedPaymentMethod,
    };
    
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart`, data);
      console.log("Order Placed Successfully:", response.data);
      alert("Order placed successfully!");
      
      dispatch(clear_cart());
  
      // Redirect to user-specific dashboard after 1 second
      setTimeout(() => {
        if (accountType) {
          router.push(`/dashboardheader`);
        } else {
          router.push(`/default-dashboard`);
        }
      }, 1000); // 1-second delay
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };
  
  return (
    <div className="your-order mb-30">
      <h3>Your order</h3>
      <div className="your-order-table table-responsive">
        <table>
          <thead>
            <tr>
              <th className="product-name">Sample</th>
              <th className="product-price">Price</th>
              <th className="product-quantity">quantity</th>
              <th className="product-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {cart_products?.length > 0 ? (
              cart_products.map((item, i) => (
                <tr key={i}>
                  <td>{item.samplename || "N/A"}</td>
                  <td>{(item.price || 0).toFixed(2)}</td>
                  <td>{item.orderQuantity || 0}</td>
                  <td>{((item.orderQuantity || 0) * (item.price || 0)).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  Your cart is empty.
                </td>
              </tr>
            )}
          </tbody>
          {/* Uncomment this block if you want to include order details */}
          <tfoot>
            <tr className="shipping">
              <th>Sub Total</th>
              <td colSpan="2" className="text-end">
                <strong>
                  <span className="amount">{subtotal.toFixed(2)}</span>
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="payment-method faq__wrapper tp-accordion">
        <div className="accordion" id="checkoutAccordion">
          {/* Direct Bank Transfer */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="checkoutDBT">
              <button
                className={`accordion-button ${
                  selectedPaymentMethod === "DBT" ? "" : "collapsed"
                }`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#bankTransfer"
                aria-expanded={selectedPaymentMethod === "DBT"}
                aria-controls="bankTransfer"
                onClick={() => setSelectedPaymentMethod("DBT")}
              >
                Direct Bank Transfer
                <span className="accordion-btn"></span>
              </button>
            </h2>
            <div
              id="bankTransfer"
              className={`accordion-collapse collapse ${
                selectedPaymentMethod === "DBT" ? "show" : ""
              }`}
              aria-labelledby="checkoutDBT"
              data-bs-parent="#checkoutAccordion"
            >
              <div className="accordion-body">
                <div className="order-button-payment mt-25">
                  <button
                    onClick={handleSubmit}
                    type="button"
                    className="tp-btn"
                    disabled={!cart_products.length || isCheckoutSubmit}
                  >
                    Place order with Bank Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cash Payment */}
          <div className="accordion-item">
            <h2 className="accordion-header" id="checkoutCash">
              <button
                className={`accordion-button ${
                  selectedPaymentMethod === "Cash" ? "" : "collapsed"
                }`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#cashPayment"
                aria-expanded={selectedPaymentMethod === "Cash"}
                aria-controls="cashPayment"
                onClick={() => setSelectedPaymentMethod("Cash")}
              >
                Cash Payment
                <span className="accordion-btn"></span>
              </button>
            </h2>
            <div
              id="cashPayment"
              className={`accordion-collapse collapse ${
                selectedPaymentMethod === "Cash" ? "show" : ""
              }`}
              aria-labelledby="checkoutCash"
              data-bs-parent="#checkoutAccordion"
            >
              <div className="accordion-body">
                <div className="order-button-payment mt-25">
                  <button
                    onClick={handleSubmit}
                    type="button"
                    className="tp-btn"
                    disabled={!cart_products.length || isCheckoutSubmit}
                  >
                    Place order with Cash Payment
                  </button>
                </div>
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
