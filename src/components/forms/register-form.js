import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
// internal
import { Email, EyeCut, Lock, UserTwo } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useRegisterUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import axios from "axios";
const schema = Yup.object().shape({
  // username: Yup.string().required().label("User Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  accountType: Yup.string().required().label("Account Type"),

  // Researcher-specific fields (conditional validation)
  ResearcherName: Yup.string().when('accountType', {
    is: 'Researcher',
    then: Yup.string().required('Researcher Name is required!'),
  }),
  nameofOrganization: Yup.string().when('accountType', {
    is: 'Researcher',
    then: Yup.string().required('Name of Organization is required!'),
  }),
  phoneNumber: Yup.string().when('accountType', {
    is: ['Researcher', 'Organization', 'CollectionSites'],
    then: Yup.string().required('Phone Number is required!'),
  }),
  fullAddress: Yup.string().when('accountType', {
    is: ['Researcher', 'Organization', 'CollectionSites'],
    then: Yup.string().required('Full Address is required!'),
  }),
  city: Yup.string().when('accountType', {
    is: ['Researcher', 'Organization', 'CollectionSites'],
    then: Yup.string().required('City is required!'),
  }),
  district: Yup.string().when('accountType', {
    is: ['Researcher', 'Organization', 'CollectionSites'],
    then: Yup.string().required('District is required!'),
  }),
  country: Yup.string().when('accountType', {
    is: ['Researcher', 'Organization', 'CollectionSites'],
    then: Yup.string().required('Country is required!'),
  }),

  // Organization-specific fields (conditional validation)
  OrganizationName: Yup.string().when('accountType', {
    is: 'Organization',
    then: Yup.string().required('Organization Name is required!'),
  }),
  type: Yup.string()
    .oneOf(["Public", "Private", "NGO"], "Invalid type selected")
    .when('accountType', {
      is: 'Organization',  // Condition: if accountType is 'Organization'
      then: Yup.string().required('Type is required!'),  // 'type' field becomes required
      otherwise: Yup.string().nullable(),  // Optional when condition is not met
    }),
  HECPMDCRegistrationNo: Yup.string().when('accountType', {
    is: 'Organization',
    then: Yup.string().required('HEC / PMDC Registration No is required!'),
  }),
  ntnNumber: Yup.string().when('accountType', {
    is: ['Organization'],
    then: Yup.string().required('NTN Number is required!'),
  }),
  // CollectionSites-specific fields (conditional validation)
  CollectionSiteName: Yup.string().when('accountType', {
    is: 'CollectionSites',
    then: Yup.string().required('CollectionSites Name is required!'),
  }),
});


const RegisterForm = () => {

  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [registerUser, { }] = useRegisterUserMutation();
  const [cityname, setcityname] = useState([]);
  const [Org_name, setOrganizationname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setcountryname] = useState([]);
  const router = useRouter();
  // react hook form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema)
  });

  // Watch accountType to conditionally render fields
  const accountType = watch("accountType");
  // Fetch City from backend when component loads
  useEffect(() => {
    const fetchcityname = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/get-city`);
        setcityname(response.data); // Store fetched City in state
      } catch (error) {
        console.error("Error fetching City:", error);
      }
    };

    fetchcityname(); // Call the function when the component mounts
  }, []);

  useEffect(() => {
    const fetchOrganizationname = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`);
        const approvedOrganizations = response.data.filter(
          (organization) => organization.status === "approved"
        );
        setOrganizationname(approvedOrganizations); // Store fetched City in state
      } catch (error) {
        console.error("Error fetching Organization:", error);
      }
    };

    fetchOrganizationname(); // Call the function when the component mounts
  }, []);
  useEffect(() => {
    const fetchdistrictname = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/district/get-district`);
        setdistrictname(response.data); // Store fetched City in state
      } catch (error) {
        console.error("Error fetching City:", error);
      }
    };

    fetchdistrictname(); // Call the function when the component mounts
  }, []);

  useEffect(() => {
    const fetchcountryname = async () => {
      try {
        const response = await axios.get( `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`);
        setcountryname(response.data); // Store fetched City in state
      } catch (error) {
        console.error("Error fetching City:", error);
      }
    };

    fetchcountryname(); // Call the function when the component mounts
  }, []);
  // on submit
  const onSubmit = (data) => {
    const formData = new FormData();

    // Append other form data
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("accountType", data.accountType);

    // Append Researcher-specific fields
    if (data.accountType === 'Researcher') {
      formData.append("ResearcherName", data.ResearcherName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("fullAddress", data.fullAddress);
      formData.append("city", data.city);
      formData.append("district", data.district);
      formData.append("country", data.country);
      formData.append("nameofOrganization", data.nameofOrganization);
    }

    // Append Organization-specific fields
    if (data.accountType === 'Organization') {
      formData.append("OrganizationName", data.OrganizationName);
      formData.append("type", data.type);
      formData.append("HECPMDCRegistrationNo", data.HECPMDCRegistrationNo);
      formData.append("ntnNumber", data.ntnNumber);
      formData.append("fullAddress", data.fullAddress);
      formData.append("city", data.city);
      formData.append("district", data.district);
      formData.append("country", data.country);
      formData.append("phoneNumber", data.phoneNumber);
    }

    // Append CollectionSite-specific fields
    if (data.accountType === 'CollectionSites') {
      formData.append("CollectionSiteName", data.CollectionSiteName);
      formData.append("fullAddress", data.fullAddress);
      formData.append("city", data.city);
      formData.append("district", data.district);
      formData.append("country", data.country);
      formData.append("phoneNumber", data.phoneNumber);
    }

    // Append logo (if a file is selected)
    if (data.logo && data.logo[0]) {
      formData.append("logo", data.logo[0]);
    }

    // Send the formData to the backend
    registerUser(formData)
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || 'Register Failed';
          notifyError(errorMessage);
        } else {
          notifySuccess(result?.data?.message || 'Registered Successfully');
          router.push('/login');
        }
      })
      .catch((error) => {
        notifyError(error?.response?.data?.error || 'An unexpected error occurred');
      });

    reset();
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("email", { required: `Email is required!` })}
              name="email"
              type="email"
              placeholder="Enter your email"
              id="email"
            />
            <span>
              <Email />
            </span>
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input-item-inner p-relative">
            <div className="login__input">
              <input
                {...register("password", { required: `Password is required!` })}
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Password"
                id="password"
              />
              <span>
                <Lock />
              </span>
            </div>
            <span
              className="login-input-eye"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <i className="fa-regular fa-eye"></i> : <EyeCut />}
            </span>
          </div>
          <ErrorMessage message={errors.password?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input-item-inner p-relative">
            <div className="login__input">
              <input
                {...register("confirmPassword")}
                name="confirmPassword"
                type={showConPass ? "text" : "password"}
                placeholder="Confirm Password"
                id="confirmPassword"
              />
              <span>
                <Lock />
              </span>
            </div>
            <span
              className="login-input-eye"
              onClick={() => setShowConPass(!showConPass)}
            >
              {showConPass ? <i className="fa-regular fa-eye"></i> : <EyeCut />}
            </span>
          </div>
          <ErrorMessage message={errors.confirmPassword?.message} />
        </div>
        {/* Account Type Dropdown */}
        <div className="login__input-item">
          <div className="login__input">
            <select
              {...register("accountType", { required: `Account Type is required!` })}
              name="accountType"
              id="accountType"
              style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}
            >
              <option value="">Select Account Type</option>
              <option value="Researcher">Researcher</option>
              <option value="Organization">Organization</option>
              <option value="CollectionSites">Collection Site</option>
            </select>
            <span>
              <i className="fa-regular fa-user"></i>
            </span>
          </div>
          <ErrorMessage message={errors.accountType?.message} />
        </div>
        {/* Researcher-specific fields */}
        {accountType === "Researcher" && (
          <>
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("ResearcherName")}
                  name="ResearcherName"
                  type="text"
                  placeholder="Researcher Name"
                  id="ResearcherName"
                />
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>
              </div>
              <ErrorMessage message={errors.ResearcherName?.message} />
            </div>


            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("phoneNumber")}
                  name="phoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  id="phoneNumber"
                />
                <span>
                  <i className="fa-solid fa-phone"></i>
                </span>
              </div>
              <ErrorMessage message={errors.phoneNumber?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("logo")}
                  name="logo"
                  type="file"
                  id="logo"
                  className="form-control form-control-sm"
                />
                <span>
                  <i className="fa-solid fa-image"></i>
                </span>
              </div>
              <ErrorMessage message={errors.logo?.message} />
            </div> 

            {/* Common Researcher and Organization */}
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("fullAddress")}
                  name="fullAddress"
                  type="text"
                  placeholder="Full Address"
                  id="fullAddress"
                />
                <span>
                  <i className="fa-solid fa-location-dot"></i>
                </span>
              </div>
              <ErrorMessage message={errors.fullAddress?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select
                  {...register("city")}
                  name="city" id="city"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}
                >
                  <option value="">Select City</option>
                  {cityname.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>

                <span>
                  <i className="fa-solid fa-city"></i>
                </span>
              </div>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("district")} name="district" id="district"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select District</option>
                  {districtname.map((district) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-map-marker-alt"></i>
                </span>
              </div>
              <ErrorMessage message={errors.district?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("country")} name="country" id="country"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select Country</option>
                  {countryname.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-globe"></i>
                </span>
              </div>
              <ErrorMessage message={errors.country?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select
                  {...register("nameofOrganization")}
                  name="nameofOrganization" id="nameofOrganization"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}
                >
                  <option value="">Name of Organization</option>
                  {Org_name.map((org) => (
                    <option key={org.id} value={org.id}>{org.OrganizationName}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-building"></i>
                </span>
              </div>
              <ErrorMessage message={errors.nameofOrganization?.message} />
            </div>
          </>
        )}

        {/* Organization-specific fields */}
        {accountType === "Organization" && (
          <>
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("OrganizationName")}
                  name="OrganizationName"
                  type="text"
                  placeholder="Organization Name"
                  id="OrganizationName"
                />
                <span>
                  <i className="fa-solid fa-building"></i>
                </span>
              </div>
              <ErrorMessage message={errors.OrganizationName?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("logo")}
                  name="logo"
                  type="file"
                  id="logo"
                  className="form-control form-control-sm"
                />
                <span>
                  <i className="fa-solid fa-image"></i>
                </span>
              </div>
              <ErrorMessage message={errors.logo?.message} />
            </div> 

            <div className="login__input-item">
              <div className="login__input">
                <select
                  {...register("type")}
                  name="type"
                  id="type"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}
                >
                  <option value="">Select Type</option>
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="NGO">NGO</option>
                </select>
                <span>
                  <i className="fa-solid fa-id-card"></i>
                </span>
              </div>
              <ErrorMessage message={errors.type?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("HECPMDCRegistrationNo")}
                  name="HECPMDCRegistrationNo"
                  type="text"
                  placeholder="HEC / PMDC Registration No"
                  id="HECPMDCRegistrationNo"
                />
                <span>
                  <i className="fa-solid fa-id-card"></i>
                </span>
              </div>
              <ErrorMessage message={errors.HECPMDCRegistrationNo?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("ntnNumber")}
                  name="ntnNumber"
                  type="text"
                  placeholder="NTN Number"
                  id="ntnNumber"
                />
                <span>
                  <i className="fa-solid fa-id-card"></i>
                </span>
              </div>
              <ErrorMessage message={errors.ntnNumber?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("phoneNumber")}
                  name="phoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  id="phoneNumber"
                />
                <span>
                  <i className="fa-solid fa-phone"></i>
                </span>
              </div>
              <ErrorMessage message={errors.phoneNumber?.message} />
            </div>

            {/* Common Researcher and Organization */}
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("fullAddress")}
                  name="fullAddress"
                  type="text"
                  placeholder="Full Address"
                  id="fullAddress"
                />
                <span>
                  <i className="fa-solid fa-location-dot"></i>
                </span>
              </div>
              <ErrorMessage message={errors.fullAddress?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("city")} name="city" id="city"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select City</option>
                  {cityname.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-city"></i>
                </span>
              </div>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("district")} name="district" id="district"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select District</option>
                  {districtname.map((district) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-map-marker-alt"></i>
                </span>
              </div>
              <ErrorMessage message={errors.district?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("country")} name="country" id="country"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>

                  <option value="">Select Country</option>
                  {countryname.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-globe"></i>
                </span>
              </div>
              <ErrorMessage message={errors.country?.message} />
            </div>

          </>
        )}
        {/* CollectionSites-specific fields */}
        {accountType === "CollectionSites" && (
          <>
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("CollectionSiteName")}
                  name="CollectionSiteName"
                  type="text"
                  placeholder="CollectionSites Name"
                  id="CollectionSiteName"
                />
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>
              </div>
              <ErrorMessage message={errors.CollectionSiteName?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("phoneNumber")}
                  name="phoneNumber"
                  type="text"
                  placeholder="Phone Number"
                  id="phoneNumber"
                />
                <span>
                  <i className="fa-solid fa-phone"></i>
                </span>
              </div>
              <ErrorMessage message={errors.phoneNumber?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("logo")}
                  name="logo"
                  type="file"
                  id="logo"
                  className="form-control form-control-sm"
                />
                <span>
                  <i className="fa-solid fa-image"></i>
                </span>
              </div>
              <ErrorMessage message={errors.logo?.message} />
            </div>
            {/* CollectionSites */}
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("fullAddress")}
                  name="fullAddress"
                  type="text"
                  placeholder="Full Address"
                  id="fullAddress"
                />
                <span>
                  <i className="fa-solid fa-location-dot"></i>
                </span>
              </div>
              <ErrorMessage message={errors.fullAddress?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("city")} name="city" id="city"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select City</option>
                  {cityname.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-city"></i>
                </span>
              </div>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("district")} name="district" id="district"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select District</option>
                  {districtname.map((district) => (
                    <option key={district.id} value={district.id}>{district.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-map-marker-alt"></i>
                </span>
              </div>
              <ErrorMessage message={errors.district?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <select {...register("country")} name="country" id="country"
                  style={{ width: "100%", height: "50px", paddingLeft: "50px", borderColor: "#f0f0f0", color: "#808080" }}>
                  <option value="">Select Country</option>
                  {countryname.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
                <span>
                  <i className="fa-solid fa-globe"></i>
                </span>
              </div>
              <ErrorMessage message={errors.country?.message} />
            </div>
          </>
        )}

      </div>


      <div className="login__btn mt-25">
        <button type="submit" className="tp-btn w-100">
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
