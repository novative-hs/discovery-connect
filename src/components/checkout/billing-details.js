import ErrorMessage from "@components/error-message/error";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const BillingDetails = () => {
  const id = localStorage.getItem("userID");
  const [userData, setUserData] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // Loading state

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    setValue,
    reset, // To reset form values dynamically
    formState: { errors },
  } = useForm();

  console.log("data on billing page is", id);

  // Fetch user data from API
  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`
          );
          const data = await response.json();
          console.log("Fetched data:", data); // Log the data to verify the response
          if (response.ok) {
            setUserData(data); // Store the fetched data
            if (data && data.length > 0) {
              // Populate form with fetched data
              reset({
                firstName: data[0]?.ResearcherName || "",
                lastName: "",
                address: data[0]?.fullAddress || "",
                cityname: data[0]?.cityname || "",
                countryname: data[0]?.countryname || "",
                email: data[0]?.useraccount_email || "",
                phone: data[0]?.phoneNumber || "",
              });
            }
          } else {
            console.error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false); // Set loading to false once data is fetched
        }
      };

      fetchUserData();
    } else {
      setLoading(false); // If no ID, set loading to false
    }
  }, [id, reset]);

  // Handle loading state
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // Handle case if user data is not available
  if (!userData) {
    return <div>No user data found.</div>;
  }

  // Checkout form list component
  function CheckoutFormList({
    col,
    label,
    type = "text",
    placeholder,
    isRequired = true,
    name,
    register,
    error,
  }) {
    return (
      <div className={`col-md-${col}`}>
        <div className="checkout-form-list">
          {label && (
            <label>
              {label} {isRequired && <span className="required">*</span>}
            </label>
          )}
          <input
  {...register(`${name}`, {
    required: isRequired && `${label} is required!`,
  })}
  type={type}
  placeholder={placeholder}
  defaultValue=""
  readOnly
/>

          {error && <ErrorMessage message={error} />}
        </div>
      </div>
    );
  }

  return (
    <form className="row" onSubmit={handleSubmit((data) => console.log(data))}>
      <CheckoutFormList
        name="firstName"
        col="12"
        label="Name"
        placeholder="Name"
        register={register}
        error={errors?.firstName?.message}
      />
      <CheckoutFormList
        name="address"
        col="12"
        label="Address"
        placeholder="Street address"
        register={register}
        error={errors?.address?.message}
      />
      <CheckoutFormList
        col="12"
        label="City"
        placeholder="City"
        name="cityname"
        register={register}
        error={errors?.cityname?.message}
      />
      <CheckoutFormList
        col="12"
        label="County"
        placeholder="County"
        name="countryname"
        register={register}
        error={errors?.countryname?.message}
      />
      <CheckoutFormList
        col="12"
        type="email"
        label="Email Address"
        placeholder="Your Email"
        name="email"
        register={register}
        error={errors?.email?.message}
      />
      <CheckoutFormList
        name="phone"
        col="12"
        label="Phone"
        placeholder="Phone number"
        register={register}
        error={errors?.phone?.message}
      />

      {/* <div className="order-notes">
        <div className="checkout-form-list">
          <label>Order Notes</label>
          <textarea
            id="checkout-mess"
            cols="30"
            rows="10"
            placeholder="Notes about your order, e.g. special notes for delivery."
          ></textarea>
        </div>
      </div> */}
{/* 
      <button type="submit">Submit</button> */}
    </form>
  );
};

export default BillingDetails;