import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Email, EyeCut, Lock, User } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useRegisterUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import axios from "axios";

// Validation schema
const schema = Yup.object().shape({
  email: Yup.string().required("Email is required").email(),
  password: Yup.string()
    .required("Password is required!")
    .min(6, "Password must be at least 6 characters long")
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/,
      "Password must contain at least one letter, one number, and one special character"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required!"),
  accountType: Yup.string().required("Account Type is required"),
  phoneNumber: Yup.string()
    .matches(
      /^\d{4}-\d{7}$/,
      "Phone number must be in this format e.g. 0123-4567892"
    )
    .required("Phone number is required")
    .label("Phone number is required"),
  logo: Yup.mixed().required("Logo is required"),
  fullAddress: Yup.string().required("Full Address is required"),
  city: Yup.string().required("City is required"),
  district: Yup.string().required("District is required"),
  country: Yup.string().required("Country is required"),
  ResearcherName: Yup.string().when("accountType", {
    is: "Researcher",
    then: Yup.string()
      .required("Researcher Name is required!")
      .matches(
        /^[A-Za-z\s]+$/,
        "Researcher Name must only contain letters and spaces!"
      ),
  }),

  nameofOrganization: Yup.string().when("accountType", {
    is: "Researcher",
    then: Yup.string().required("Name of Organization is required!"),
  }),
  OrganizationName: Yup.string().when("accountType", {
    is: "Organization",
    then: Yup.string().required("Organization Name is required!"),
  }),
  type: Yup.string()
    .oneOf(["Public", "Private", "NGO"], "Invalid type selected")
    .when("accountType", {
      is: "Organization", // Condition: if accountType is 'Organization'
      then: Yup.string().required("Type is required!"), // 'type' field becomes required
      otherwise: Yup.string().nullable(), // Optional when condition is not met
    }),
  HECPMDCRegistrationNo: Yup.string().when("accountType", {
    is: "Organization",
    then: Yup.string().required("HEC / PMDC Registration No is required!"),
  }),
  ntnNumber: Yup.string().when("accountType", {
    is: ["Organization"],
    then: Yup.string().required("NTN Number is required!"),
  }),
  // CollectionSites-specific fields (conditional validation)
  CollectionSiteName: Yup.string().when("accountType", {
    is: "CollectionSites",
    then: Yup.string().required("Collection Site Name is required!"),
  }),
  CollectionSiteType: Yup.string().when("accountType", {
    is: "CollectionSites",
    then: Yup.string().required("Type is required!"),
  }),
});

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [logo, setLogo] = useState("");
  const [accountTypeLabel, setAccountTypeLabel] = useState("Choose Logo");
  const [cityname, setCityname] = useState([]);
  const [districtname, setDistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [Org_name, setOrganizationname] = useState([]);
  const router = useRouter();
  const [registerUser, {}] = useRegisterUserMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(null); // Store selected city object
  const [showDropdown, setShowDropdown] = useState(false);

  const [searchDistrict, setSearchDistrict] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const [searchCountry, setSearchCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const fileInputRef = useRef(null);
  const accountType = watch("accountType");
  const selectedAccountType = watch("accountType");
  
  // Dynamically change the "Choose Logo" label based on account type
  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setSearchTerm(""); 
    setShowDropdown(false);
    setValue("city", city.id);
  };
  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setSearchDistrict("");
    setShowDistrictDropdown(false);
    setValue("district", district.id);
  };

  const handleSelectCountry = (country) => {
    console.log("Country",country)
    setSelectedCountry(country);
    setSearchCountry("");
    setShowCountryDropdown(false);
    setValue("country", country.id);
    
  };

  useEffect(() => {
    const labels = {
      Researcher: "Choose Researcher Logo",
      Organization: "Choose Organization Logo",
      CollectionSites: "Choose Collection Site Logo",
    };
    setAccountTypeLabel(labels[accountType] || "Choose Logo");
  }, [accountType]);

  // Fetch cities, districts, and countries from backend
  useEffect(() => {
    const fetchData = async (url, setState, label) => {
      try {
        const response = await axios.get(url);
        setState(response.data);
      } catch (error) {
        console.error(`Error fetching ${label}:`, error);
      }
    };

    fetchData(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/get-city`,
      setCityname,
      "City"
    );
    fetchData(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/district/get-district`,
      setDistrictname,
      "District"
    );
    fetchData(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`,
      setCountryname,
      "Country"
    );

    // Fetch all organizations and filter approved ones
    fetchData(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`,
      (data) => {
        setOrganizationname(data);
        setOrganizationname(data.filter((org) => org.status === "approved"));
      },
      "Organization"
    );
  }, []);

  const handleLogoChange = (event) => {
    if (event.target.type === "file") {
      // Handle file selection
      const file = event.target.files[0];
      if (file) {
        setValue("logo", file);
        setLogo(file.name); // Update the input field with the file name
      }
    } else {
      // Handle button click (to trigger file input)
      document.getElementById("fileInput").click(); // Trigger file input click
    }
  };
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input
    }
  };

  const onSubmit = (data) => {
    console.log(data);
    const formData = new FormData();

    // Append other form data
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("accountType", data.accountType);

    // Append Researcher-specific fields
    if (data.accountType === "Researcher") {
      formData.append("ResearcherName", data.ResearcherName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("fullAddress", data.fullAddress);
      formData.append("city", data.city);
      formData.append("district", data.district);
      formData.append("country", data.country);
      formData.append("nameofOrganization", data.nameofOrganization);
    }

    // Append Organization-specific fields
    if (data.accountType === "Organization") {
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
    if (data.accountType === "CollectionSites") {
      formData.append("CollectionSiteName", data.CollectionSiteName);
      formData.append("CollectionSiteType", data.CollectionSiteType);
      formData.append("fullAddress", data.fullAddress);
      formData.append("city", data.city);
      formData.append("district", data.district);
      formData.append("country", data.country);
      formData.append("phoneNumber", data.phoneNumber);
    }

    // Append logo (if a file is selected)
    if (data.logo) {
      formData.append("logo", data.logo);
    }
    // Send the formData to the backend
    registerUser(formData)
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Register Failed";
          notifyError(errorMessage);
        } else {
          setLogo("");
          setValue("logo", "");
          notifySuccess(
            "Your information is received, you'll get email once your account got approval from registration admin"
          );

          router.push("/login");
        }
      })
      .catch((error) => {
        notifyError(
          error?.response?.data?.error || "An unexpected error occurred"
        );
        setLogo("");
        setValue("logo", "");
      });

    reset();
  };

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        {/* Email */}
        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("email")}
              type="email"
              className="form-control"
              placeholder="Enter your email"
            />
            <span>
              <Email />
            </span>
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>

        {/* Password */}
        <div className="login__input-item">
          <div className="login__input-item-inner p-relative">
            <div className="login__input">
              <input
                {...register("password")}
                type={showPass ? "text" : "password"}
                className="form-control"
                placeholder="Password"
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
        {/* Confirm Password*/}
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

        {/* Account Type */}
        <div className="login__input-item">
          <div className="login__input position-relative ">
            <span className="position-absolute start-0 top-50 translate-middle-y ps-3">
              <i className="fa-regular fa-user px-2"></i>
            </span>
            <select
              {...register("accountType", {
                required: "Account Type is required!",
              })}
              name="accountType"
              id="accountType"
              className="form-select ps-5 py-3 form-control-lg"
            >
              <option value="">Select Account Type</option>
              <option value="Researcher">Researcher</option>
              <option value="Organization">Organization</option>
              <option value="CollectionSites">Collection Site</option>
            </select>
          </div>
          <ErrorMessage message={errors.accountType?.message} />
        </div>

        {selectedAccountType && (
          <>
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
                    <select
                      {...register("nameofOrganization")}
                      name="nameofOrganization"
                      id="nameofOrganization"
                      style={{
                        width: "100%",
                        height: "50px",
                        paddingLeft: "50px",
                        borderColor: "#f0f0f0",
                        color: "#808080",
                      }}
                    >
                      <option value="">Name of Organization</option>
                      {Org_name.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.OrganizationName}
                        </option>
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
                    <select
                      {...register("type")}
                      name="type"
                      id="type"
                      style={{
                        width: "100%",
                        height: "50px",
                        paddingLeft: "50px",
                        borderColor: "#f0f0f0",
                        color: "#808080",
                      }}
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
                  <ErrorMessage
                    message={errors.HECPMDCRegistrationNo?.message}
                  />
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
              </>
            )}

            {accountType === "CollectionSites" && (
              <>
                <div className="login__input-item">
                  <div className="login__input">
                    <input
                      {...register("CollectionSiteName")}
                      name="CollectionSiteName"
                      type="text"
                      placeholder="Collection Site Name"
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
                    <select
                      {...register("CollectionSiteType")}
                      name="CollectionSiteType"
                      id="CollectionSiteType"
                      style={{
                        width: "100%",
                        height: "50px",
                        paddingLeft: "50px",
                        borderColor: "#f0f0f0",
                        color: "#808080",
                      }}
                    >
                      <option value="">Select Type</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Independent Lab">Independent Lab</option>
                      <option value="Blood Bank">Blood Bank</option>
                    </select>
                    <span>
                      <i className="fa-solid fa-id-card"></i>
                    </span>
                  </div>
                  <ErrorMessage message={errors.CollectionSiteType?.message} />
                </div>
              </>
            )}

            {/* Phone Number */}
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("phoneNumber")}
                  type="tel"
                  className="form-control"
                  placeholder="XXXX-XXXXXXX"
                />
                <span>
                  <i className="fa-solid fa-phone"></i>
                </span>
              </div>
              <ErrorMessage message={errors.phoneNumber?.message} />
            </div>

            {/* Logo Upload */}
            <div className="login__input-item">
              <div className="login-input form-control md-10 p-2">
                <i className="fa-solid fa-image text-black px-3 mt-2"></i>
                <label
                  className="btn btn-outline-secondary bg-transparent border-0 px-0 m-0"
                  onClick={triggerFileInput}
                >
                  {logo ? (
                    <span className="form-label">{logo}</span>
                  ) : (
                    accountTypeLabel
                  )}
                </label>

                <input
                  type="file"
                  {...register("logo", { required: "Logo is required" })}
                  className="d-none"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                />
              </div>
              <ErrorMessage
                    name="logo"
                component="div"
                className="error-message"
                message={errors.logo?.message}
              />
            </div>
            {/* {/ City Fields /} */}
            <div className="login__input-item">
              <div className="login__input d-flex align-items-center w-100 position-relative">
                <input
                  type="text"
                  placeholder="Type to search city..."
                  className="form-control"
                  {...register("city")}
                  value={searchTerm || (selectedCity ? selectedCity.name : "")} // Only show selected city when not searching
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) setSelectedCity(null); // Clear selected city when user deletes input
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowDropdown(false), 200)
                  }
                  
                  
                />
                <span>
                  <i className="fa-solid fa-city text-black"></i>
                </span>

                {/* Bootstrap Dropdown */}
                {showDropdown && (
                  <ul
                    className="dropdown-menu show w-100 position-absolute"
                    style={{
                      top: "100%",
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {cityname
                      .filter(
                        (city) =>
                          searchTerm
                            ? city.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            : true // Show all cities when searchTerm is empty
                      )
                      .map((city) => (
                        <li key={city.id}>
                          <button
                            className="dropdown-item"
                            type="button"
                            onMouseDown={() => handleSelectCity(city)}
                          >
                            {city.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <span className="ms-2">
                <i className="fa-solid fa-angle-down"></i>
              </span>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input d-flex align-items-center w-100 position-relative">
                <input
                  type="text"
                  placeholder="Type to search district..."
                  className="form-control"
                  {...register("district")}
                  value={
                    searchDistrict ||
                    (selectedDistrict ? selectedDistrict.name : "")
                  }
                  onChange={(e) => {
                    setSearchDistrict(e.target.value);
                    setShowDistrictDropdown(true);
                    if (!e.target.value) setSelectedDistrict(null);
                  }}
                  onFocus={() => setShowDistrictDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowDistrictDropdown(false), 200)
                  }
                />
                <span>
                  <i className="fa-solid fa-map-marker-alt text-black"></i>
                </span>

                {/* Bootstrap Dropdown for District */}
                {showDistrictDropdown && (
                  <ul
                    className="dropdown-menu show w-100 position-absolute"
                    style={{
                      top: "100%",
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {districtname
                      .filter((district) =>
                        searchDistrict
                          ? district.name
                              .toLowerCase()
                              .includes(searchDistrict.toLowerCase())
                          : true
                      )
                      .map((district) => (
                        <li key={district.id}>
                          <button
                            className="dropdown-item"
                            type="button"
                            onMouseDown={() => handleSelectDistrict(district)}
                          >
                            {district.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <span className="ms-2">
                <i className="fa-solid fa-angle-down"></i>
              </span>
              <ErrorMessage message={errors.district?.message} />
            </div>

            {/* Country Field */}
            <div className="login__input-item">
              <div className="login__input d-flex align-items-center w-100 position-relative">
                <input
                  type="text"
                  placeholder="Type to search country..."
                  className="form-control"
                  {...register("country")}
                  value={
                    searchCountry ||
                    (selectedCountry ? selectedCountry.name : "")
                  }
                  onChange={(e) => {
                    setSearchCountry(e.target.value);
                    setShowCountryDropdown(true);
                    if (!e.target.value) setSelectedCountry(null);
                  }}
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCountryDropdown(false), 200)
                  }
                />
                <span>
                  <i className="fa-solid fa-globe text-black"></i>
                </span>

                {/* Bootstrap Dropdown for Country */}
                {showCountryDropdown && (
                  <ul
                    className="dropdown-menu show w-100 position-absolute"
                    style={{
                      top: "100%",
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {countryname
                      .filter((country) =>
                        searchCountry
                          ? country.name
                              .toLowerCase()
                              .includes(searchCountry.toLowerCase())
                          : true
                      )
                      .map((country) => (
                        <li key={country.id}>
                          <button
                            className="dropdown-item"
                            type="button"
                            onMouseDown={() => handleSelectCountry(country)}
                          >
                            {country.name}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <span className="ms-2">
                <i className="fa-solid fa-angle-down"></i>
              </span>
              <ErrorMessage message={errors.country?.message} />
            </div>
            {/* Address Fields */}
            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("fullAddress")}
                  type="text"
                  className="form-control"
                  placeholder="Full Address"
                />
                <span>
                  <i className="fa-solid fa-location-dot"></i>
                </span>
              </div>
              <ErrorMessage message={errors.fullAddress?.message} />
            </div>
          </>
        )}
      </div>
      <div className="login__btn mt-25">
        <button type="submit" className="tp-btn w-100" disabled={false}>
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
