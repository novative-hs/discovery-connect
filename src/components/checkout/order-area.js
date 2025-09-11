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
// 🔹 Step 1: Calculate subtotal
const subtotal = cart_products.reduce((acc, item) => {
  const price = Number(item.price) || 0;
  const quantity = Number(item.orderQuantity) || 1;
  return acc + price * quantity;
}, 0);

// 🔹 Step 2: Extract overall charges (percent or amount)
const taxPercent = Number(cart_products[0]?.tax_percent || 0);
const taxAmount = Number(cart_products[0]?.tax_amount || 0);

const platformPercent = Number(cart_products[0]?.platform_percent || 0);
const platformAmount = Number(cart_products[0]?.platform_amount || 0);

const freightPercent = Number(cart_products[0]?.freight_percent || 0);
const freightAmount = Number(cart_products[0]?.freight_amount || 0);

// 🔹 Step 3: Calculate each charge (based on percent OR fixed amount)
const tax = taxPercent > 0 ? (subtotal * taxPercent) / 100 : taxAmount;
const platform =
  platformPercent > 0 ? (subtotal * platformPercent) / 100 : platformAmount;
const freight =
  freightPercent > 0 ? (subtotal * freightPercent) / 100 : freightAmount;

// 🔹 Step 4: Calculate grand total
const grandTotal = subtotal + tax + platform + freight;

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
  formData.append("subtotal", subtotal);
  formData.append("totalpayment", grandTotal);

  // 🔹 Tax
  formData.append("tax_value", taxAmount > 0 ? taxAmount : taxPercent);
  formData.append("tax_type", taxAmount > 0 ? "amount" : "percent");

  // 🔹 Platform
  formData.append("platform_value", platformAmount > 0 ? platformAmount : platformPercent);
  formData.append("platform_type", platformAmount > 0 ? "amount" : "percent");

  // 🔹 Freight
  formData.append("freight_value", freightAmount > 0 ? freightAmount : freightPercent);
  formData.append("freight_type", freightAmount > 0 ? "amount" : "percent");

  // 🔹 Cart Items
  formData.append(
    "cart_items",
    JSON.stringify(
      cart_products.map((item) => ({
        sample_id: item.id,
        price: Number(item.price),
        samplequantity: Number(item.orderQuantity),
        volume: item.Volume,
        VolumeUnit: item.VolumeUnit,
      }))
    )
  );

  // 🔹 Documents
  formData.append("study_copy", sampleCopyData.studyCopy);
  formData.append("reporting_mechanism", sampleCopyData.reportingMechanism);
  formData.append("irb_file", sampleCopyData.irbFile);
  if (sampleCopyData.nbcFile) {
    formData.append("nbc_file", sampleCopyData.nbcFile);
  }

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
