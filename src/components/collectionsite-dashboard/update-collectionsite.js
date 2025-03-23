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
  cityid: Yup.string().required("City is required").label("City"),
  districtid: Yup.string().required("District is required").label("District"),
  countryid: Yup.string().required("Country is required").label("Country"),
  phoneNumber: Yup.string()
    .required("Phone Number is required")
    .matches(
      /^\d{4}-\d{7}$/,
      "Phone number must be in the format 0123-4567890 and numeric"
    )
    .label("Phone Number"),
  fullAddress: Yup.string()
    .required("Full Address is required")
    .label("Full Address"),
  CollectionSiteType: Yup.string().required("Type is required").label("Type"),
});

const UpdateCollectionSite = () => {
  const id = localStorage.getItem("userID");
  const { user } = useSelector((state) => state.auth);
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setcountryname] = useState([]);
  const [collectionsite, setCollectionSite] = useState([]);
  const [logo, setLogo] = useState("");
  const logoHandler = (file) => {
    setLogo(file);
  };
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/get/${id}`
      );
      setCollectionSite(response.data);
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchcityname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/get-city`
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
    }
  }, [collectionsite, reset]);

  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/district/get-district`
      );
      setdistrictname(response.data);
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };

  const fetchcountryname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
      );
      setcountryname(response.data);
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };
  const onSubmit = async (data) => {
    let formData = new FormData();

    // Add all the regular fields to the FormData
    for (let key in data) {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    }

    // If a new logo is provided, append it to the FormData
    if (logo) {
      formData.append("logo", logo); // Assuming `logo` is a File object (binary)
    } else {
      // If no new logo is uploaded, append the existing logo's binary data
      const binaryLogo = data.logo.data; // This is the existing logo buffer (e.g., Buffer or array)

      // Convert the binary data to a Blob (binary file-like object)
      const blob = new Blob([new Uint8Array(binaryLogo)], {
        type: "image/png",
      }); // Use the appropriate MIME type for the logo

      // Append the Blob as a file object
      formData.append("logo", blob, "existing-logo.png"); // "existing-logo.png" can be the default name for the existing logo
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/updatedetail/${id}`,
        formData, // Sending the FormData object with both fields and the file
        {
          headers: {
            "Content-Type": "multipart/form-data", // Make sure it's set to multipart/form-data
          },
        }
      );
      notifySuccess("Collection site updated successfully!");
    } catch (error) {
      notifyError("An error occurred while updating the collection site.");
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

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Profile Picture Section */}
        <div className="col-lg-3 col-md-4 text-center mb-3">
          <div
            className="profile__logo d-flex justify-content-center p-2 align-items-center border border-2 border-black rounded-circle"
            style={{
              width: "150px",
              height: "150px",
              overflow: "hidden",
              marginLeft: "50px",
            }}
          >
            <img
              src={
                logo
                  ? URL.createObjectURL(logo)
                  : collectionsite?.logo?.data
                  ? bufferToBase64(collectionsite.logo.data, "jpeg")
                  : "/default-logo.png"
              }
              alt="Collection Site Logo"
              className="w-100 h-100 rounded-circle"
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="mt-2">
            <label htmlFor="logo" className="btn btn-outline-success btn-sm">
              Upload Logo
            </label>
            <input
              {...register("logo")}
              name="logo"
              type="file"
              id="logo"
              onChange={(e) => logoHandler(e.target.files[0])}
              className="d-none"
            />
            <ErrorMessage message={errors.logo?.message} />
          </div>
          <p className="small text-muted mt-2">
            Maximum upload size is <strong>1 MB</strong>
          </p>
        </div>

        {/* Form Section */}
        <div className="col-lg-9 col-md-8">
          <h4 className="mb-3">Update Profile</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className=" pb-1">Email</label>
                <input
                  {...register("useraccount_email")}
                  type="email"
                  className="form-control"
                  placeholder="Enter Email"
                />
                <ErrorMessage message={errors.useraccount_email?.message} />
              </div>
              <div className="col-md-6">
                <label className=" pb-1">Phone Number</label>
                <input
                  {...register("phoneNumber")}
                  type="text"
                  className="form-control"
                  placeholder="Enter Phone Number"
                />
                <ErrorMessage message={errors.phoneNumber?.message} />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className=" pb-1">City</label>
                <select {...register("cityid")} className="form-select">
                  <option value="">Select a city</option>
                  {cityname.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.cityid?.message} />
              </div>
              <div className="col-md-6">
                <label className=" pb-1">Country</label>
                <select {...register("countryid")} className="form-select">
                  <option value="">Select a Country</option>
                  {countryname.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.countryid?.message} />
              </div>
            
            </div>
            <div className="row mb-3">
            <div className="col-md-6">
                <label className="pb-1">District</label>
                <select {...register("districtid")} className="form-select">
                  <option value="">Select a district</option>
                  {districtname.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.districtid?.message} />
              </div>
              <div className="col-md-6">
                <label className="pb-1">Type</label>
                <select
                  id="CollectionSiteType"
                  {...register("CollectionSiteType")}
                  className="form-select p-2"
                >
                  <option value="">Select Type</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Independent Lab">Independent Lab</option>
                  <option value="Bio Bank">Bio Bank</option>
                </select>
                <ErrorMessage message={errors.CollectionSiteType?.message} />
              </div>
            </div>

            <div className="mb-3">
              <label className="pb-1">Full Address</label>
              <textarea
                {...register("fullAddress")}
                className="form-control"
                rows="3"
                placeholder="Enter Full Address"
              ></textarea>
              <ErrorMessage message={errors.fullAddress?.message} />
            </div>

            <div className="text-end">
              <button type="submit" className="tp-btn-3">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCollectionSite;
