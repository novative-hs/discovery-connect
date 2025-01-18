import React, { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { notifyError, notifySuccess } from "@utils/toast";
import ErrorMessage from "@components/error-message/error";
import axios from "axios";

// Validation schema
const schema = Yup.object().shape({
  useraccount_email: Yup.string().required("Email is required").label("Email"),
  CollectionSiteName: Yup.string()
    .required("CollectionSiteName is required")
    .label("CollectionSiteName"),
  cityid: Yup.string().required("City is required").label("City"),
  districtid: Yup.string().required("District is required").label("District"),
  countryid: Yup.string().required("Country is required").label("Country"),
  phoneNumber: Yup.string()
    .required("Phone Number is required")
    .min(11, "Phone Number must be at least 11 characters")
    .label("Phone Number"),
  ntnNumber: Yup.string()
    .required("NTN Number is required")
    .label("NTN Number"),
  fullAddress: Yup.string()
    .required("Full Address is required")
    .label("Full Address"),
  type: Yup.string().required("Type is required").label("Type"),
});

const UpdateCollectionSite = () => {
  const id = localStorage.getItem("userID");
  const { user } = useSelector((state) => state.auth);
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setcountryname] = useState([]);
  const [collectionsite, setCollectionSite] = useState({});
  const [preview, setPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Reset form with new data
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: collectionsite || {}, // Wait until organization is available
  });

  useEffect(() => {
    fetchcityname();
    fetchdistrictname();
    fetchcountryname();
    fetchcollectionsite();
  }, []);

  const fetchcollectionsite = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/getAccountDetail/${id}`
      );
      setCollectionSite(response.data[0]);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchcityname = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/city/get-city"
      );
      setcityname(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  useEffect(() => {
    if (collectionsite) {
      console.log("Logo Data:", collectionsite.logo?.data);
      console.log(
        "Logo URL:",
        bufferToBase64(collectionsite.logo?.data, "jpeg")
      );
      reset(collectionsite); // Reset form with the organization data when available
      console.log("Collection", collectionsite);
    }
  }, [collectionsite, reset]);

  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/district/get-district"
      );
      setdistrictname(response.data);
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };

  const fetchcountryname = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/country/get-country"
      );
      setcountryname(response.data);
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        e.target.result; // Update the preview with the Base64 string
      };
      reader.readAsDataURL(file); // Convert the file to a Base64 string
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (logoFile) {
      formData.append("logo", logoFile);
    }

    // Debugging: log the FormData keys
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/updateProfile/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notifySuccess("Collectionsite updated successfully");
      console.log("Collectionsite updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating Collectionsite:", error);
      notifyError("Failed to update Collectionsite");
    }
  };

  const bufferToBase64 = (buffer, format = "jpeg") => {
    if (!buffer) return null;
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `data:image/${format};base64,${window.btoa(binary)}`;
  };

  useEffect(() => {
    if (collectionsite) {
      setPreview(
        collectionsite?.logo?.data
          ? `data:image/jpeg;base64,${Buffer.from(
              collectionsite?.logo.data
            ).toString("base64")}`
          : null
      );
      reset(collectionsite); // Reset form with the organization data when available
    }
  }, [collectionsite, reset]);

  return (
    <div className="profile__info-content">
      <form encType="multipart/form-data" onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          {/* Image */}
          <div
            className="col-xxl-12 col-md-12"
            style={{ marginBottom: "15px" }}
          >
            <div className="profile__logo" style={{ textAlign: "center" }}>
              {preview ? (
                <img
                  src={preview}
                  alt="Collection Site Logo"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    objectFit: "contain",
                    marginBottom: "20px",
                    borderColor: "black",
                    borderWidth: "2px",
                    borderStyle: "solid",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: "70px",
                    height: "70px",
                    display: "inline-block",
                    borderRadius: "50%",
                    backgroundColor: "#eaeaea",
                    color: "#aaa",
                    fontSize: "30px",
                    lineHeight: "70px",
                    textAlign: "center",
                  }}
                >
                  <i className="fa-solid fa-user"></i>
                </span>
              )}
            </div>
          </div>
          {/* Upload New Logo */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="logo"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
                display: "inline-block", // Ensures label is inline
              }}
            >
              Upload New Logo
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <input
                {...register("logo")}
                name="logo"
                type="file"
                id="logo"
                onChange={handleLogoUpload}
                className="form-control form-control-sm"
                accept="image/*"
              />

              <ErrorMessage message={errors.logo?.message} />
            </div>
          </div>
        </div>
        <div className="row">
          {/* Email */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="useraccount_email"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
                fontSize: "15px",
                color: "black",
                marginBottom: 30,
              }}
            >
              Email
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <input
                id="useraccount_email"
                {...register("useraccount_email")}
                type="text"
                placeholder="Enter Email"
                style={{
                  width: "100%",
                  padding: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "50px",
                }}
              />
              <ErrorMessage message={errors.useraccount_email?.message} />
            </div>
          </div>

          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="CollectionSiteName"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
                fontSize: "15px",
                color: "black",
                marginBottom: 30,
              }}
            >
              Collectionsite Name
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <input
                id="CollectionSiteName"
                {...register("CollectionSiteName")}
                type="text"
                placeholder="Enter Email"
                style={{
                  width: "100%",
                  padding: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "50px",
                }}
              />
              <ErrorMessage message={errors.CollectionSiteName?.message} />
            </div>
          </div>

          {/* Type */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="type"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
              }}
            >
              Type
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <select
                id="type"
                {...register("type")}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "50px",
                }}
              >
                <option value="">Select Type</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
                <option value="NGO">NGO</option>
              </select>
              <ErrorMessage message={errors.type?.message} />
            </div>
          </div>
          {/* City */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="cityid"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
              }}
            >
              City
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <select
                id="cityid"
                {...register("cityid")}
                defaultValue={collectionsite?.cityid || ""} // Set the default value from the collectionsite data
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "50px",
                }}
              >
                <option value="">Select a city</option>
                {cityname.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.cityname?.message} />
            </div>
          </div>

          {/* District */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="districtid"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
              }}
            >
              District
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <select
                id="districtid"
                {...register("districtid")}
                defaultValue={collectionsite?.districtid || ""} // Set the default value from the collectionsite data
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "50px",
                }}
              >
                <option value="">Select a district</option>
                {districtname.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.districtname?.message} />
            </div>
          </div>

          {/* Country */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="countryid"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
              }}
            >
              Country
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <select
                id="countryid"
                {...register("countryid")}
                defaultValue={collectionsite?.countryid || ""} // Set the default value from the collectionsite data
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "50px",
                }}
              >
                <option value="">Select a country</option>
                {countryname.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              <ErrorMessage message={errors.countryname?.message} />
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div
          className="col-xxl-12 col-md-12"
          style={{
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="phoneNumber"
            style={{
              fontWeight: "bold",
              width: "150px",
              marginRight: "20px",
            }}
          >
            Phone Number
          </label>
          <div className="profile__input" style={{ flexGrow: 1 }}>
            <input
              id="phoneNumber"
              {...register("phoneNumber")}
              type="text"
              placeholder="Enter Phone Number"
              style={{
                width: "100%",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                height: "50px",
              }}
            />
            <ErrorMessage message={errors.phoneNumber?.message} />
          </div>
        </div>

        {/* NTN Number */}
        <div
          className="col-xxl-12 col-md-12"
          style={{
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="ntnNumber"
            style={{
              fontWeight: "bold",
              width: "150px",
              marginRight: "20px",
            }}
          >
            NTN Number
          </label>
          <div className="profile__input" style={{ flexGrow: 1 }}>
            <input
              id="ntnNumber"
              {...register("ntnNumber")}
              type="text"
              placeholder="Enter NTN Number"
              style={{
                width: "100%",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                height: "50px",
              }}
            />
            <ErrorMessage message={errors.ntnNumber?.message} />
          </div>
        </div>

        {/* Full Address */}
        <div
          className="col-xxl-12 col-md-12"
          style={{
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="fullAddress"
            style={{
              fontWeight: "bold",
              width: "150px",
              marginRight: "20px",
            }}
          >
            Full Address
          </label>
          <div className="profile__input" style={{ flexGrow: 1 }}>
            <textarea
              id="fullAddress"
              {...register("fullAddress")}
              placeholder="Enter Full Address"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                height: "100px",
              }}
            ></textarea>
            <ErrorMessage message={errors.fullAddress?.message} />
          </div>
        </div>

        {/* Submit Button */}
        <div
          className="profile__btn"
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <button type="submit" className="tp-btn-3">
            Update Collectionsite
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateCollectionSite;
