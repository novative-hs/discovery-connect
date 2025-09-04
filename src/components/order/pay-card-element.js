import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { notifyError, notifySuccess } from "@utils/toast";
import visa from "@assets/img/slider/13/visacard.png";
import master from "@assets/img/slider/13/mastercard.png";

const PaymentCardElement = ({ handleSubmit, validateDocuments }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [bankname, setbankname] = useState()


  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expirationDate: "",
    cvc: "",
    paymentType: "Credit",
    bankname: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  useEffect(() => {
    fetchBank();

  }, []);

  const fetchBank = async () => {
    try {
      const response = await axios.get(`${url}/bank/get-bank`);
      setbankname(response.data);
    } catch (err) {
      console.error("Error fetching bank:", err);
    }
  };
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
    if (loading) return; // 🔒 Prevent double-click
    setLoading(true);
    if (!validateDocuments()) {
      setLoading(false);
      return;
    }

    if (!validateFields()) {
      setLoading(false);
      return;
    }

    const paymentData = {
      cardholder_name: formData.cardholderName,
      card_number: formData.cardNumber,
      card_expiry: formData.expirationDate,
      card_cvc: formData.cvc,
      payment_type: formData.paymentType,
      payment_status: "Paid",
      bankname: formData.bankname,
    };

    try {
      setIsLoading(true); // Start loading
      const response = await axios.post(
        `${url}/payment/createPayment`,
        paymentData
      );

      if (!response.data.insertedId) {
        notifyError(response.data.message || "Payment failed.");
        return;
      }

      await handleSubmit(response.data.insertedId);
    } catch (error) {
      notifyError(error.response?.data?.message || "An unexpected error occurred.");
    }
    finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="my-2">
      <div className="col-12">
        <div className="card shadow border-0">
          <div className="card-body p-4">
            <form>
              {/* Cardholder Name */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Cardholder Name</label>
                <input
                  id="cardholderName"
                  placeholder="Enter Cardholder Name"
                  className="form-control"
                  type="text"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                />
                {errors.cardholderName && (
                  <small className="text-danger">{errors.cardholderName}</small>
                )}
              </div>

              {/* Card Number */}
              {/* Bank + Card Number in one row */}
              <div className="row mb-3">
                {/* Bank Dropdown */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Select Bank</label>
                  <select
                    id="bankname"
                    className="form-select"
                    value={formData.bankname}
                    onChange={(e) =>
                      setFormData({ ...formData, bankname: e.target.value })
                    }
                  >
                    <option value="">-- Select Bank --</option>
                    {bankname?.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Card Number */}
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Card Number</label>
                  <input
                    id="cardNumber"
                    placeholder="378282246310005"
                    className="form-control"
                    type="text"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                  {errors.cardNumber && (
                    <small className="text-danger">{errors.cardNumber}</small>
                  )}
                </div>
              </div>


              {/* Expiration and CVC */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Expiration Date (MM-YYYY)</label>
                  <input
                    id="expirationDate"
                    placeholder="mm-yy"
                    className="form-control"
                    type="month"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                  />
                  {errors.expirationDate && (
                    <small className="text-danger">{errors.expirationDate}</small>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">CVC</label>
                  <input
                    id="cvc"
                    placeholder="Enter 3 digit CVC Number"
                    className="form-control"
                    type="text"
                    maxLength={3}
                    value={formData.cvc}
                    onChange={handleInputChange}
                  />
                  {errors.cvc && (
                    <small className="text-danger">{errors.cvc}</small>
                  )}
                </div>
              </div>

              {/* Payment Type */}
              <div className="mb-4">
                <label className="form-label fw-semibold fs-5">Payment Type</label>
                <div className="d-flex gap-4">
                  {["Credit", "Debit"].map((type) => (
                    <div
                      key={type}
                      className={`border rounded p-3 d-flex align-items-center gap-3 ${formData.paymentType === type ? "border-primary" : ""
                        }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRadioChange({ target: { value: type, name: "paymentType" } })}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value={type}
                        checked={formData.paymentType === type}
                        onChange={handleRadioChange}
                        id={`${type}Radio`}
                        className="form-check-input m-0"
                      />
                      <label htmlFor={`${type}Radio`} className="mb-0">{type}</label>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                        alt="Visa"
                        width={30}
                        height={20}
                      />
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png"
                        alt="MasterCard"
                        width={30}
                        height={20}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn w-100 text-white"
                style={{ backgroundColor: "#0a1d4e" }}
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {isLoading ? (
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCardElement;