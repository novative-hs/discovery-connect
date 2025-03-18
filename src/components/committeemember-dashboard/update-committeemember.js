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
  CommitteeMemberName: Yup.string()
    .required("CommittememberName is required")
    .label("CommitteememberName"),
  city: Yup.string().required("City is required").label("City"),
  district: Yup.string().required("District is required").label("District"),
  country: Yup.string().required("Country is required").label("Country"),
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
  OrganizationName: Yup.string()
    .required("Organization Name is required")
    .label("Organization Name"),
  cnic: Yup.string().required("CNIC is required").label("CNIC"),
  committeetype: Yup.string().required("Type is required").label("Type"),
});

const UpdateCommitteemember = () => {
  const id = localStorage.getItem("userID");
  const { user } = useSelector((state) => state.auth);
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setcountryname] = useState([]);
  const [organization, setOrganization] = useState([]);
  const [committeemember, setCommitteemember] = useState([]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Reset form with new data
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: committeemember?.[0] || {},
  });

  useEffect(() => {
    fetchcityname();
    fetchdistrictname();
    fetchcountryname();
    fetchOrganization();
    fetchCommitteemember();
  }, []);

  useEffect(() => {
    if (committeemember && committeemember.length > 0) {
      reset({
        ...committeemember[0], 
        city: committeemember[0]?.city || "",
        country: committeemember[0]?.country || "",
        district: committeemember[0]?.district || "",
        OrganizationName: committeemember[0]?.organization || "",
      });
    }
  }, [committeemember, reset]);
  

  const fetchOrganization = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`
      );

      // Filter organizations where status is "approved"
      const approvedOrganizations = response.data.filter(
        (organization) => organization.status === "approved"
      );

      setOrganization(approvedOrganizations); // Store only approved organizations
    } catch (error) {
      console.error("Error fetching Organization:", error);
    }
  };
  const fetchCommitteemember = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`
      );
      setCommitteemember(response.data);
    } catch (error) {
      console.error("Error fetching Committee member:", error);
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

      notifySuccess("Committee member updated successfully");
      console.log("Committee member updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating Committee member:", error);
      notifyError("Failed to update Committee member");
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Form Section */}
        <div className="col-lg-12 col-md-12">
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
                <label className=" pb-1">Committee Member Name</label>
                <input
                  {...register("CommitteeMemberName")}
                  type="text"
                  className="form-control"
                  placeholder="Enter Committee Member Name"
                />
                <ErrorMessage message={errors.CommitteeMemberName?.message} />
              </div>
            </div>

            <div className="row mb-3">
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
              <div className="col-md-6">
                <label className=" pb-1">CNIC</label>
                <input
                  {...register("cnic")}
                  type="text"
                  className="form-control"
                  placeholder="Enter CNIC"
                />
                <ErrorMessage message={errors.cnic?.message} />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="pb-1">CommitteeType</label>
                <select
                  id="committeetype"
                  {...register("committeetype")}
                  className="form-select p-2"
                >
                  <option value="">Select Type</option>
                  <option value="Scientific">Scientific</option>
                  <option value="Ethical">Ethical</option>
                </select>
                <ErrorMessage message={errors.committeetype?.message} />
              </div>
              <div className="col-md-6">
                <label className=" pb-1">Organization Name</label>
                <select
                  {...register("OrganizationName")}
                  className="form-select p-2"
                >
                  <option value="">Select Organization Name</option>
                  {organization.map((org) => (
                   <option key={org.id} value={org.id}>
                   {org.OrganizationName}
                 </option>
                 
                  ))}
                </select>
                <ErrorMessage message={errors.OrganizationName?.message} />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="pb-1">City</label>
                <select {...register("city")} className="form-select">
                  <option value="">Select a city</option>
                  {cityname.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.cityid?.message} />
              </div>
              <div className="col-md-4">
                <label className="pb-1">Country</label>
                <select {...register("country")} className="form-select">
                  <option value="">Select a Country</option>
                  {countryname.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.countryid?.message} />
              </div>
              <div className="col-md-4">
                <label className="pb-1">District</label>
                <select {...register("district")} className="form-select">
                  <option value="">Select a district</option>
                  {districtname.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                <ErrorMessage message={errors.districtid?.message} />
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
                Update Collection Site
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCommitteemember;
