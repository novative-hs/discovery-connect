import React, { useState } from "react";
import { CardElement } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import OrderSummary from "./order-summary";

const PaymentCardElement = ({
  stripe,
  cardError,
  cart_products,
  isCheckoutSubmit,
}) => {
  const router = useRouter(); // Move useRouter outside the function
  
  const [formData, setFormData] = useState({
    cardNumber: "4485 6888 2359 1498",
    cvc: "630",
    cardholderName: "David J.Frias",
    expirationDate: "2020-01", // Default format for 'month' type
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    // Apply the numeric cleaning logic only to cardNumber and cvc
    const cleanedValue =
      id === "cardNumber" || id === "cvc" ? value.replace(/\D/g, "") : value;

    setFormData((prevData) => ({
      ...prevData,
      [id]: cleanedValue, // Dynamically update the correct field based on the id
    }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    <OrderSummary/>
  };
  
  

  return (
    <div className="my-2">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handlePlaceOrder}>
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
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="expirationDate">
                    Expiration Date
                  </label>
                  <input
                    id="expirationDate"
                    className="form-control"
                    type="month"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    placeholder="MM/YYYY"
                  />
                </div>

                <div className="col-md-6">
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

              {/* Here you can integrate your Stripe CardElement */}
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
