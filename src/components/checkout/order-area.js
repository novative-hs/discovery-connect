import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { clear_cart } from "../../redux/features/cartSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { notifyError, notifySuccess } from "@utils/toast";
import PaymentCardElement from "@components/order/pay-card-element";
const OrderArea = ({ sampleCopyData, stripe, isCheckoutSubmit, error }) => {


  const { cart_products } = useSelector((state) => state.cart);
console.log(cart_products)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);

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
    if (!validateDocuments()) return false;

    const userID = sessionStorage.getItem("userID");
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
          volume: item.Volume,
          VolumeUnit: item.VolumeUnit,
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

    // Then process API request in background
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order/place-order`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { tracking_id, created_at } = response.data;
      sessionStorage.setItem("tracking_id", tracking_id);
      sessionStorage.setItem("created_at", created_at);
      router.push("/order-confirmation");
      dispatch(clear_cart());
      notifySuccess("Order placed successfully!");

      // Redirect to confirmation page
      setTimeout(() => {
        router.push({
          pathname: "/order-confirmation",
          query: { id: tracking_id, created_at },
        });
      }, 500);
    } catch (error) {
      console.error("Error placing order:", error);
      notifyError(error.response?.data?.error || "Failed to place order.");
    }
  };




  return (
    <div className="container py-4" style={{ maxWidth: "750px" }}>

      {/* Payment Accordion */}
      <div className="accordion" id="paymentAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="false"  // It should be false for collapse
              aria-controls="collapseOne"
            >
              Direct Bank Transfer
            </button>
          </h2>
          <div
            id="collapseOne"
            className="accordion-collapse collapse"  // Remove the "show" class
            aria-labelledby="headingOne"
            data-bs-parent="#paymentAccordion"
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
  );
};

export default OrderArea;
