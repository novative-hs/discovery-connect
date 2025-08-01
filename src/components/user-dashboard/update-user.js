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
  ResearcherName: Yup.string()
    .required("Researcher Name is required")
    .label("Researcher Name"),

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
  fullAddress: Yup.string()
    .required("Full Address is required")
    .label("Full Address"),
});

const UpdateUser = () => {
  const id = sessionStorage.getItem("userID");
  const [cityname, setcityname] = useState([]);
  const [researcher, setResearcher] = useState(null);
  const [organization, setOrganization] = useState(null); // Set initial state as null
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setcountryname] = useState([]);
  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Reset form with new data
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: researcher || {}, // Wait until organization is available
  });

  useEffect(() => {
    fetchcityname();
    fetchOrganization();
    fetchdistrictname();
    fetchcountryname();
  }, []);
  useEffect(()=>{
if(id){
   const fetchResearcher = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`
      );
      setResearcher(response.data[0]); // Store fetched researcher data in state
    } catch (error) {
      console.error("Error fetching researcher:", error);
    }
  };
  fetchResearcher();
}
  },[id])

  useEffect(() => {
    if (researcher) {
      reset({
        ...researcher,
        OrganizationName: researcher.nameofOrganization, // Ensure correct mapping
      });
    }
  }, [researcher, reset]);

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`
      );

      // Filter organizations where status is "active"
      const approvedOrganizations = response.data.filter(
        (organization) => organization.status === "active"
      );

      setOrganization(approvedOrganizations); // Store only active organizations
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

      notifySuccess("Researcher updated successfully");
      
    } catch (error) {
      
      notifyError("Failed to update Researcher");
    }
  };

  return (
    <div className="profile__info-content">
      <form onSubmit={handleSubmit(onSubmit)}>
        
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
              htmlFor="ResearcherName"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
                fontSize: "15px",
                color: "black",
                marginBottom: 30,
              }}
            >
              Researcher Name
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <input
                id="ResearcherName"
                {...register("ResearcherName")}
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
              <ErrorMessage message={errors.ResearcherName?.message} />
            </div>
          </div>
          {/* Organization Name */}
          <div
            className="col-xxl-12 col-md-12"
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <label
              htmlFor="OrganizationName"
              style={{
                fontWeight: "bold",
                width: "150px",
                marginRight: "20px",
              }}
            >
              Organization Name
            </label>
            <div className="profile__input" style={{ flexGrow: 1 }}>
              <select
                id="OrganizationName"
                {...register("OrganizationName")}
                defaultValue={researcher?.nameofOrganization || ""}
                style={{
                  width: "100%",
                  padding: "20px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  height: "60px",
                  backgroundColor: "#fff",
                }}
              >
                <option value="" disabled>
                  Select Organization
                </option>
                {organization &&
                  organization.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.OrganizationName}
                    </option>
                  ))}
              </select>

              <ErrorMessage message={errors.OrganizationName?.message} />
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
                defaultValue={organization?.cityid || ""} // Set the default value from the organization data
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
                defaultValue={organization?.districtid || ""} // Set the default value from the organization data
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
                defaultValue={organization?.countryid || ""} // Set the default value from the organization data
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
              placeholder="XXXX-XXXXXXX"
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
            Update Researcher
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;
