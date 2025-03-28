import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { clear_cart } from "../../redux/features/cartSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { notifyError, notifySuccess } from "@utils/toast";
import PaymentCardElement from "@components/order/pay-card-element";
const OrderArea = ({ sampleCopyData, stripe, isCheckoutSubmit, error }) => {
  console.log("Received Sample Copy Data:", sampleCopyData);

  const { cart_products } = useSelector((state) => state.cart);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  console.log("cart items are nnnn", cart_products);
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

  const validateDocuments = () => {
    let missingFields = [];
    if (!sampleCopyData.studyCopy) missingFields.push("Study Copy");
    if (!sampleCopyData.reportingMechanism)
      missingFields.push("Reporting Mechanism");
    if (!sampleCopyData.irbFile) missingFields.push("IRB File");

    if (missingFields.length > 0) {
      notifyError(`Please upload the following: ${missingFields.join(", ")}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (paymentId) => {
    if (!validateDocuments()) return false; // Ensure documents are validated first

    const userID = localStorage.getItem("userID");
    const accountType = localStorage.getItem("accountType");

    const formData = new FormData();
    formData.append("researcher_id", userID);
    formData.append("payment_id", paymentId);
    formData.append(
      "cart_items",
      JSON.stringify(
        cart_products.map((item) => ({
          sample_id: item.id,
          price: Number(item.price),
          samplequantity: Number(item.orderQuantity),
          total: Number(item.orderQuantity) * Number(item.price),
        }))
      )
    );

    formData.append("study_copy", sampleCopyData.studyCopy);
    formData.append("reporting_mechanism", sampleCopyData.reportingMechanism);
    formData.append("irb_file", sampleCopyData.irbFile);

    if (sampleCopyData.nbcFile) {
      formData.append("nbc_file", sampleCopyData.nbcFile);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (
        response.status === 201 &&
        response.data.message === "Cart created successfully"
      ) {
        const cartId = response.data.result?.[0]?.cartId; // Access the first item in the array
        const created_at = response.data.result?.[0]?.created_at; // Access the first item in the array

        if (!cartId) {
          notifyError("Cart ID not found in response.");
          return false;
        }

        // Store cart ID in local storage
        localStorage.setItem("cartID", cartId);
        localStorage.setItem("created_at", created_at);

        dispatch(clear_cart());

        setTimeout(() => {
          router.push(`/order-confirmation`); // Pass order ID as query param
        }, 500);
        return true;
      } else {
        notifyError("Unexpected response from the server.");
        return false;
      }
    } catch (error) {
      console.error("Error placing order:", error);
      notifyError(
        error.response?.data?.error ||
          "Failed to place order. Please try again."
      );
      return false;
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
                  <td>
                    {((item.orderQuantity || 0) * (item.price || 0)).toFixed(2)}{" "}
                    {item.SamplePriceCurrency || "N/A"}
                  </td>
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
                  <span className="amount">
                    {subtotal.toFixed(2)}{" "}
                    {cart_products.length > 0
                      ? cart_products[0].SamplePriceCurrency || "N/A"
                      : "N/A"}
                  </span>
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* <div className="payment-method faq__wrapper tp-accordion">
        <div className="accordion" id="checkoutAccordion">
          
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

        
        </div>
      </div> */}
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
                  cart_products={cart_products}
                  isCheckoutSubmit={isCheckoutSubmit}
                  handleSubmit={handleSubmit}
                  validateDocuments={validateDocuments}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderArea;
