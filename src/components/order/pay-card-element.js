import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { notifyError, notifySuccess } from "@utils/toast";

const PaymentCardElement = ({ handleSubmit, validateDocuments }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvc: "",
    paymentType: "Credit",
  });

  const [errors, setErrors] = useState({});

  const validateFields = () => {
    let newErrors = {};

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(formData.cardholderName)) {
      newErrors.cardholderName = "Invalid name format.";
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required.";
    } else if (!/^\d{16}$/.test(formData.cardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits.";
    }

    if (!formData.expirationDate) {
      newErrors.expirationDate = "Expiration date is required.";
    } else {
      const today = new Date();
      const selectedDate = new Date(formData.expirationDate);
      if (selectedDate < today) {
        newErrors.expirationDate = "Expiration date must be in the future.";
      }
    }

    if (!formData.cvc.trim()) {
      newErrors.cvc = "CVC is required.";
    } else if (!/^\d{3}$/.test(formData.cvc)) {
      newErrors.cvc = "CVC must be 3 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    let cleanedValue = value;
    if (id === "cardNumber" || id === "cvc") {
      cleanedValue = value.replace(/\D/g, ""); // Only allow numbers
    }

    setFormData({ ...formData, [id]: cleanedValue });
  };


  const handleRadioChange = (e) => {
    setFormData({ ...formData, paymentType: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateDocuments()) return;
    if (!validateFields()) return;

    const paymentData = {
      cardholder_name: formData.cardholderName,
      card_number: formData.cardNumber,
      card_expiry: formData.expirationDate,
      card_cvc: formData.cvc,
      payment_type: formData.paymentType,
      payment_status: "Paid",
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/createPayment`,
        paymentData
      );

      if (!response.data.insertedId) {
        notifyError(response.data.message || "Payment failed.");
        return;
      }

      const orderPlaced = await handleSubmit(response.data.insertedId);
      if (orderPlaced) notifySuccess("Order placed successfully!Now your cart is empty");
    } catch (error) {
      notifyError(error.response?.data?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="my-2">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label className="form-label">Cardholder Name</label>
                <input id="cardholderName" placeholder="Enter Cardholder Name" className="form-control" type="text" value={formData.cardholderName} onChange={handleInputChange} />
                {errors.cardholderName && <small className="text-danger">{errors.cardholderName}</small>}
              </div>

              <div className="mb-3">
                <label className="form-label">Card Number</label>
                <input id="cardNumber" placeholder="378282246310005" className="form-control" type="text" value={formData.cardNumber} onChange={handleInputChange} />
                {errors.cardNumber && <small className="text-danger">{errors.cardNumber}</small>}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Expiration Date (MM-YYYY)</label>

                  <input id="expirationDate" placeholder="mm-yy" className="form-control p-2" type="month" value={formData.expirationDate} onChange={handleInputChange} />
                  {errors.expirationDate && <small className="text-danger">{errors.expirationDate}</small>}
                </div>
                <div className="col-md-6">
                  <label className="form-label">CVC</label>
                  <input id="cvc" placeholder="Enter 3 digit CVC Number" className="form-control" type="text" maxLength={3} value={formData.cvc} onChange={handleInputChange} />
                  {errors.cvc && <small className="text-danger">{errors.cvc}</small>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Payment Type</label>
                <div className="d-flex">
                  <div className="form-check me-3">
                    <input className="form-check-input" type="radio" name="paymentType" value="Credit" checked={formData.paymentType === "Credit"} onChange={handleRadioChange} />
                    <label className="form-check-label">Credit</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="paymentType" value="Debit" checked={formData.paymentType === "Debit"} onChange={handleRadioChange} />
                    <label className="form-check-label">Debit</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="tp-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCardElement;
