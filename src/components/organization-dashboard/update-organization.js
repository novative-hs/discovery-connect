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
  OrganizationName: Yup.string()
    .required("Organization Name is required")
    .label("Organization Name"),
  HECPMDCRegistrationNo: Yup.string()
    .required("HEC/PMDC Registration Number is required")
    .label("HEC/PMDC Registration Number"),
  cityid: Yup.string().required("City is required").label("City"),
  districtid: Yup.string().required("District is required").label("District"),
  countryid: Yup.string().required("Country is required").label("Country"),
  phoneNumber: Yup.string()
    .matches(
      /^\d{4}-\d{7}$/,
      "Phone number must be in the format 0123-4567890 and numeric"
    )
    .required("Phone number is required")
    .label("Phone Number"),
  ntnNumber: Yup.string()
    .required("NTN Number is required")
    .label("NTN Number"),
  fullAddress: Yup.string()
    .required("Full Address is required")
    .label("Full Address"),
  type: Yup.string().required("Type is required").label("Type"),
});

const UpdateOrganization = () => {
  const id = localStorage.getItem("userID");
  const { user } = useSelector((state) => state.auth);
  const [cityname, setcityname] = useState([]);
  const [organization, setOrganization] = useState(null); // Set initial state as null
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setcountryname] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Reset form with new data
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: organization || {}, // Wait until organization is available
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchcityname();
    fetchOrganization();
    fetchdistrictname();
    fetchcountryname();
  }, []);

  useEffect(() => {
    if (organization) {
      setPreview(
        organization?.logo?.data
          ? `data:image/jpeg;base64,${Buffer.from(
              organization?.logo.data
            ).toString("base64")}`
          : null
      );
      if (organization.logo && organization.logo.data) {
        const blob = new Blob([new Uint8Array(organization.logo.data)], {
          type: "image/jpeg",
        });
        const file = new File([blob], "logo.jpg", { type: "image/jpeg" });
        setLogoFile(file);
      }
      reset(organization); // Reset form with the organization data when available
    }
    console.log("org", organization);
  }, [organization, reset]);

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

  const fetchOrganization = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`
      );

      setOrganization(response.data[0]); // Store fetched organization data
    } catch (error) {
      console.error("Error fetching Organization:", error);
    }
  };

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/updateProfile/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notifySuccess("Organization updated successfully");
      console.log("Organization updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating organization:", error);
      notifyError("Failed to update organization");
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
          <div className="profile__logo">
            {preview ? (
              <img
                src={preview}
                alt="Profile Logo"
                className="border border-2 border-primary rounded-circle"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            ) : (
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light text-secondary border border-dark fs-1"
                style={{ width: "150px", height: "150px" }}
              >
                <i className="fa-solid fa-user"></i>
              </span>
            )}
            <div className="mt-2">
              <label htmlFor="logo" className="btn btn-outline-success btn-sm">
                Upload Logo
              </label>
              <input
                {...register("logo")}
                type="file"
                id="logo"
                onChange={handleLogoUpload}
                className="d-none"
                accept="image/*"
              />
            </div>
            <p className="small text-muted mt-2">Maximum upload size is <strong>1 MB</strong></p>
          </div>
        </div>

        {/* Form Section */}
        <div className="col-lg-9 col-md-8">
          <h4 className="mb-3">Update Profile</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="pb-1">Organization Name</label>
                <input {...register("OrganizationName")} type="text" className="form-control" placeholder="Enter Organization Name" />
                <ErrorMessage message={errors.OrganizationName?.message} />
              </div>
              <div className="col-md-6">
                <label className="pb-1">Email</label>
                <input {...register("useraccount_email")} type="email" className="form-control" placeholder="Enter Email" />
                <ErrorMessage message={errors.useraccount_email?.message} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="pb-1">HEC/PMDC Registration No</label>
                <input {...register("HECPMDCRegistrationNo")} type="text" className="form-control" placeholder="Enter Registration Number" />
                <ErrorMessage message={errors.HECPMDCRegistrationNo?.message} />
              </div>
              <div className="col-md-6">
                <label className="pb-1">Type</label>
                <select {...register("type")} className="form-select">
                  <option value="">Select Type</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="NGO">NGO</option>
                </select>
                <ErrorMessage message={errors.type?.message} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="pb-1">Phone Number</label>
                <input {...register("phoneNumber")} type="text" className="form-control" placeholder="Enter Phone Number" />
                <ErrorMessage message={errors.phoneNumber?.message} />
              </div>
              <div className="col-md-6">
                <label className="pb-1">NTN Number</label>
                <input {...register("ntnNumber")} type="text" className="form-control" placeholder="Enter NTN Number" />
                <ErrorMessage message={errors.ntnNumber?.message} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-lg-4 col-md-6">
                <label className="pb-1">City</label>
                <select {...register("cityid")} className="form-select">
                  <option value="">Select a city</option>
                  {cityname.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.cityid?.message} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="pb-1">Country</label>
                <select {...register("countryid")} className="form-select">
                  <option value="">Select a Country</option>
                  {countryname.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.countryid?.message} />
              </div>
              <div className="col-lg-4 col-md-6">
                <label className="pb-1">District</label>
                <select {...register("districtid")} className="form-select">
                  <option value="">Select a district</option>
                  {districtname.map((district) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                <ErrorMessage message={errors.districtid?.message} />
              </div>
            </div>

            <div className="mb-3">
              <label className="pb-1">Full Address</label>
              <textarea {...register("fullAddress")} className="form-control" rows="3" placeholder="Enter Full Address"></textarea>
              <ErrorMessage message={errors.fullAddress?.message} />
            </div>

            <div className="text-end">
              <button type="submit" className="tp-btn-3">Update Organization</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrganization;