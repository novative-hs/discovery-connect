import ErrorMessage from "@components/error-message/error";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";

// Validation Schema
const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  city: Yup.string().required().label("City"),
  country: Yup.string().required().label("Country"),
  district: Yup.string().required().label("District"),
});

const BillingDetails = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const id = localStorage.getItem("userID");
  const [researcher, setResearcher] = useState(null);
  const [cityname, setCityname] = useState([]);
  const [districtname, setDistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);

  // Checkout Form List with support for dropdowns
  function CheckoutFormList({
    col,
    label,
    type = "text",
    placeholder,
    isRequired = true,
    name,
    options = [],
    defaultValue,
  }) {
    return (
      <div className={`col-md-${col}`}>
        <div className="checkout-form-list">
          {label && (
            <label>
              {label} {isRequired && <span className="required">*</span>}
            </label>
          )}
          {options.length > 0 ? (
            <select {...register(name)} defaultValue={defaultValue} className="form-select">
              <option value="">Select {label}</option>
              {options.map((option, index) => (
                <option key={index} value={option.id || option}>
                  {option.name || option}
                </option>
              ))}
            </select>
          ) : (
            <input
              {...register(name)}
              type={type}
              className="form-control"
              placeholder={placeholder}
              defaultValue={defaultValue}
            />
          )}
          {errors[name] && <ErrorMessage message={errors[name]?.message} />}
        </div>
      </div>
    );
  }

  const fetchResearcher = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/user/getAccountDetail/${id}`);
      setResearcher(response.data[0]); // Store fetched researcher data in state
    } catch (error) {
      console.error("Error fetching researcher:", error);
    }
  };

  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>; // Or redirect to login
    } else {
      fetchResearcher();
      fetchcityname();
      fetchdistrictname();
      fetchcountryname();
      console.log("account_id on city page is:", id);
    }
  }, [id]);

  const fetchcityname = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/city/get-city");
      setCityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  const fetchdistrictname = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/district/get-district");
      setDistrictname(response.data); // Store fetched District in state
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };

  const fetchcountryname = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/country/get-country");
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };

  useEffect(() => {
    if (researcher) {
      // Set default values in the form
      setValue("ResearcherName", researcher.ResearcherName);
      setValue("fullAddress", researcher.fullAddress);
      setValue("city", researcher.city);
      setValue("district", researcher.district);
      setValue("country", researcher.country);
      setValue("email", researcher.useraccount_email);
      setValue("contact", researcher.phoneNumber);
    }
  }, [researcher, setValue]);

  return (
    <>
      <div className="row">

        <CheckoutFormList
          name="ResearcherName"
          col="12"
          label="Researcher Name"
          placeholder="Researcher Name"
          defaultValue={researcher?.ResearcherName}
        />
         <CheckoutFormList
          col="12"
          type="email"
          label="Email Address"
          placeholder="Your Email"
          name="email"
          defaultValue={researcher?.useraccount_email}
        />
        <CheckoutFormList
          name="contact"
          col="12"
          label="Phone"
          placeholder="Phone number"
          defaultValue={researcher?.phoneNumber}
        />
        <CheckoutFormList
          name="fullAddress"
          col="12"
          label="Full Address"
          placeholder="Full Address"
          defaultValue={researcher?.fullAddress}
        />
        <CheckoutFormList
          col="6"
          label="Town / City"
          placeholder="Select City"
          name="city"
          options={cityname}
          defaultValue={researcher?.cityname}
        />
        <CheckoutFormList
          col="6"
          label="State / Country"
          placeholder="Select Country"
          name="country"
          options={countryname}
          defaultValue={researcher?.countryname}
        />
        <CheckoutFormList
          col="6"
          label="District"
          placeholder="Select District"
          name="district"
          options={districtname}
          defaultValue={researcher?.districtname}
        />
        
       

      </div>
    </>
  );
};

export default BillingDetails;
