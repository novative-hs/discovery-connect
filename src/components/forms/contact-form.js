import React, { useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import axios from "axios"; // Import Axios
import ErrorMessage from "@components/error-message/error";

const schema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  phone: Yup.string().required().min(11).label("Phone"),
  company: Yup.string().required().label("Company"),
  message: Yup.string().required().min(20).label("Message"),
});

const ContactForm = () => {
  const [serverMessage, setServerMessage] = useState(null);         // State to handle server response message
  // react hook form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });
  setTimeout(() => {
    setServerMessage(null);
  }, 1000);
  // API Call
  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contactus`, // Ensure this is set in your .env.local
        data
      );
      setServerMessage({
        type: "success",
        text: response.data.message || "Message sent successfully!",
      });
      reset(); // Reset form on success
    } catch (error) {
      setServerMessage({
        type: "error",
        text: error.response?.data?.message || "Something went wrong!",
      });
    }
  };


  return (
    <form id="contact-form" onSubmit={handleSubmit(onSubmit)}>
  {/* Server Message Display */}
  {serverMessage && (
    <div className={`alert alert-${serverMessage.type === "success" ? "success" : "danger"}`}>
      {serverMessage.text}
    </div>
  )}

  <div className="row">
    {/* Name */}
    <div className="col-md-6 mb-3">
      <input
        name="name"
        {...register("name")}
        type="text"
        className="form-control"
        placeholder="Enter your name"
      />
      <ErrorMessage message={errors.name?.message} />
    </div>

    {/* Email */}
    <div className="col-md-6 mb-3">
      <input
        name="email"
        {...register("email")}
        type="email"
        className="form-control"
        placeholder="Enter your email"
      />
      <ErrorMessage message={errors.email?.message} />
    </div>

    {/* Phone */}
    <div className="col-md-6 mb-3">
      <input
        name="phone"
        {...register("phone")}
        type="text"
        className="form-control"
        placeholder="Mobile no"
      />
      <ErrorMessage message={errors.phone?.message} />
    </div>

    {/* Company */}
    <div className="col-md-6 mb-3">
      <input
        name="company"
        {...register("company")}
        type="text"
        className="form-control"
        placeholder="Company"
      />
      <ErrorMessage message={errors.company?.message} />
    </div>

    {/* Message */}
    <div className="col-md-12 mb-3">
      <textarea
        name="message"
        {...register("message")}
        className="form-control"
        placeholder="Your message"
        rows="4"
      ></textarea>
      <ErrorMessage message={errors.message?.message} />
    </div>

    {/* Terms Checkbox */}
    <div className="col-md-12 mb-3">
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id="e-agree" />
        <label className="form-check-label" htmlFor="e-agree">
          I am bound by the terms of the Service I accept Privacy Policy.
        </label>
      </div>
    </div>

    {/* Submit Button */}
    <div className="col-12 text-center">
      <button type="submit" className="btn btn-dark px-4 py-2" style={{backgroundColor:"black"}}>
        Send Message
      </button>
    </div>
  </div>
</form>

  
  );
};

export default ContactForm;