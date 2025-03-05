import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { notifyError, notifySuccess } from "@utils/toast";
const PaymentCardElement = ({
  stripe,
  cardError,
  cart_products,
  isCheckoutSubmit,
}) => {
  const router = useRouter();
  const id = localStorage.getItem("userID");
  const [formData, setFormData] = useState({
    cardNumber: "4485688823591498", // Remove spaces to avoid formatting issues
    cvc: "630",
    cardholderName: "David J.Frias",
    expirationDate: "2020-01", // Default format for 'month' type
    paymentType: "Credit", // Default payment type
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const cleanedValue =
      id === "cardNumber" || id === "cvc" ? value.replace(/\D/g, "") : value;

    setFormData((prevData) => ({
      ...prevData,
      [id]: cleanedValue,
    }));
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      paymentType: e.target.value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
  
    // Basic validation check
    if (!formData.cardNumber || !formData.cvc || !formData.expirationDate || !formData.cardholderName) {
      notifyError("Please fill in all required fields.");
      return;
    }
  
    const paymentData = {
      cardholder_name: formData.cardholderName,
      card_number: formData.cardNumber,
      card_expiry: formData.expirationDate,
      card_cvc: formData.cvc,
      payment_type: formData.paymentType,
    };
  
    console.log("Payment", paymentData);
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/${id}`, paymentData);
  
      if (response.data.status && response.data.status !== 200) {
        // If the backend sends a custom status code in response.data, handle it as an error
        notifyError(response.data.message || "Something went wrong.");
      } else {
        // Success case
        notifySuccess(response.data.message);
        reset();
      }
    } catch (error) {
      console.error("Error placing order:", error);
  
      if (error.response) {
        // Handle specific response errors
        notifyError(error.response.data.message || "An unexpected error occurred.");
      } else if (error.request) {
        // Network error (no response received)
        notifyError("Network error, please try again.");
      } else {
        // Other unexpected errors
        notifyError("An unexpected error occurred. Please try again.");
      }
    }
  };
  
  
  
  
  
  return (
    <div className="my-2">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <form>
              <div className="mb-4">
                <label className="form-label" htmlFor="cardholderName">
                  Cardholder Name
                </label>
                <input
                  id="cardholderName"
                  className="form-control"
                  type="text"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="Name"
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="cardNumber">
                  Card Number
                </label>
                <input
                  id="cardNumber"
                  className="form-control"
                  type="text"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234567812345678"
                />
              </div>

              <div className="row mb-4" style={{ display: "flex" }}>
                <div
                  className="col-sm-12 col-md-6"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label className="form-label" htmlFor="expirationDate">
                    Expiration Date
                  </label>
                  <input
                    id="expirationDate"
                    className="form-control form-control-lg"
                    type="month"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    placeholder="MM/YYYY"
                  />
                </div>

                <div
                  className="col-sm-12 col-md-6"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <label className="form-label" htmlFor="cvc">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    className="form-control"
                    type="text"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="XXX"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Payment Type</label>
                <div className="d-flex">
                  <div className="form-check me-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentType"
                      value="Credit"
                      checked={formData.paymentType === "Credit"}
                      onChange={handleRadioChange}
                    />
                    <label className="form-check-label">Credit</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentType"
                      value="Debit"
                      checked={formData.paymentType === "Debit"}
                      onChange={handleRadioChange}
                    />
                    <label className="form-check-label">Debit</label>
                  </div>
                </div>
              </div>

              <div className="order-button-payment mt-25">
                <button
                  type="submit"
                  className="tp-btn"
                  onClick={handlePlaceOrder}
                >
                  Place order
                </button>
              </div>

              {cardError && (
                <p className="mt-15" style={{ color: "red" }}>
                  {cardError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCardElement;
