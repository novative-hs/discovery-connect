import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
// Internal
import Email from "@svg/email";
import Lock from "@svg/lock";

import ErrorMessage from "@components/error-message/error";
import { notifyError, notifySuccess } from "@utils/toast";
import { useSendOTPMutation, useVerifyOTPMutation } from "src/redux/features/auth/authApi";

// ✅ Validation Schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
});

const ForgotForm = () => {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // ✅ OTP state

  // ✅ Redux Mutations
  const [sendOTP, { isLoading }] = useSendOTPMutation();
  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();

  // ✅ React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  // Step 1: Send OTP to user email
  const onSubmit = async (data) => {
    try {
      
      const response = await sendOTP(data.email).unwrap();
      notifySuccess("✅ OTP sent to your email!");
      setEmail(data.email);
      setOtpSent(true);
      // ✅ Corrected condition
      if (!response || !response.otp) { 
        notifyError(response.message || "Error sending OTP");
        return;
      }

    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      notifyError(error.data?.message || "Something went wrong!");
    }
  };

  // Step 2: Verify OTP
  const handleOTPSubmit = async () => {
    

    if (!otp) {
      notifyError("Please enter the OTP.");
      return;
    }

    try {
      const response = await verifyOTP({ email, otp }).unwrap();
      notifySuccess("✅ OTP verified! Redirecting...");
      router.push(`/forget-password/${email}`); // ✅ Redirect to reset password

    } catch (error) {
      // Log the full error object to inspect its structure
      console.error("❌ Error verifying OTP:", error);

      // Check if the error has the expected structure
      const errorMessage = error?.data?.error || error?.response?.data?.error;

      if (errorMessage) {
        // Handle OTP expiration specifically
        if (errorMessage === "OTP has expired. Please request a new one.") {
          // Reset the OTP flow
          setOtp("");  // Clear OTP state
          setOtpSent(false); // Reset the OTP sent state
          notifyError("❌ OTP has expired. Please request a new one.");
        } else {
          notifyError(errorMessage); // Display the error message from the backend
        }
      } else {
        notifyError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email Input */}
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input">
            <input 
              {...register("email")} 
              type="email" 
              placeholder="Email" 
              disabled={otpSent} 
            />
            <span><Email /></span>
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>
      </div>

      {/* Send OTP Button */}
      {!otpSent ? (
        <div className="login__btn">
          <button type="submit" className="tp-btn w-100" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <>
          {/* OTP Input Field */}
          <div className="login__input-item">
            <div className="login__input">
              <input 
                type="text" 
                name="otp" 
                placeholder="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
              />
              <span><Lock /></span>
            </div>
          </div>

          {/* Verify OTP Button */}
          <div className="login__btn">
            <button type="button" className="tp-btn w-100" onClick={handleOTPSubmit} disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </>
      )}
    </form>
  );
};


export default ForgotForm;
