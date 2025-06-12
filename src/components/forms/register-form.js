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

  phoneNumber: Yup.string()
    .matches(
      /^\d{4}-\d{7}$/,
      "Phone number must be in this format e.g. 0123-4567892"
    )
    .required("Phone number is required")
    .label("Phone number is required"),

  fullAddress: Yup.string().required("Full Address is required"),
  city: Yup.string().required("City is required"),
  district: Yup.string().required("District is required"),
  country: Yup.string().required("Country is required"),

  ResearcherName: Yup.string()
    .required("Researcher Name is required!")
    .matches(
      /^[A-Za-z\s]+$/,
      "Researcher Name must only contain letters and spaces!"
    ),


  nameofOrganization: Yup.string().when("accountType", {
    is: "Researcher",
    then: Yup.string().required("Name of Organization is required!"),
  }),


});

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);
  const [Org_name, setOrganizationname] = useState([]);
  const [CNIC, setCNIC] = useState("");
  const [Org_card, setOrg_card] = useState("");
  const [cityname, setCityname] = useState([]);
  const [districtname, setDistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const fileInputRefCNIC = useRef(null);
  const fileInputRefOrgCard = useRef(null);
  const router = useRouter();
  const [registerUser, { }] = useRegisterUserMutation();
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

    setSelectedCountry(country);
    setSearchCountry("");
    setShowCountryDropdown(false);
    setValue("country", country.id);
  };


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
        setOrganizationname(data.filter((org) => org.status === "active"));
      },
      "Organization"
    );
  }, []);
  const handleFileChange = (e, setFn, fieldName) => {
    const files = Array.from(e.target.files);

    // If more than 2 files are selected, prevent further selection
    if (files.length > 2) {
      notifyError("You can only select two images.");
      return;
    }

    // If less than or equal to 2 files, update the state and form value
    setValue(fieldName, files);
    setFn(files.map(file => file.name).join(", ")); // Set filenames as a comma-separated string
  };




  const triggerFileInput = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();

    // Append other form data
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("accountType", "Researcher");

    // Append Researcher-specific fields
    formData.append("ResearcherName", data.ResearcherName);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("fullAddress", data.fullAddress);
    formData.append("city", data.city);
    formData.append("district", data.district);
    formData.append("country", data.country);
    formData.append("nameofOrganization", data.nameofOrganization);

    // Check if CNIC file is selected and append to FormData
    if (data.CNIC && data.CNIC.length > 0) {
      formData.append("CNIC", data.CNIC[0]); 
    } else {
      
      notifyError("CNIC file is required.");
      return;
    }
    
    if (data.Org_card && data.Org_card.length > 0) {
      formData.append("Org_card", data.Org_card[0]); 
    } else {
      
      notifyError("Organization card file is required.");
      return;
    }

    registerUser(formData)
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Register Failed";
          notifyError(errorMessage);
        } else {
          setCNIC("");
          setOrg_card("");
          setValue("CNIC", "");
          setValue("Org_card", "");
          setSearchCountry("");
          setSearchDistrict("");
          setSelectedCity("")
          notifySuccess(
            "Your information is received, you'll get email once your account got approval from Registration Admin"
          );

          router.push("/login");
        }
      })
      .catch((error) => {
        notifyError(
          error?.response?.data?.error || "An unexpected error occurred"
        );
      });

    // Clear the file inputs and reset the form after submitting
    setCNIC("");
    setOrg_card("");
    setValue("CNIC", "");
    setValue("Org_card", "");
    setSearchCountry("");
    setSearchDistrict("");
    setSelectedCity("")
    reset(); // Reset form fields
  };


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

        {/* CNIC Image */}
        <div className="login__input-item">
          <div className="login-input form-control md-10 p-2">
            <i className="fa-solid fa-image text-black px-3 mt-2"></i>
            <label
              className="btn btn-outline-secondary bg-transparent border-0 px-0 m-0"
              onClick={() => triggerFileInput(fileInputRefCNIC)}
            >
              {CNIC ? (
                <span className="form-label">{CNIC}</span>
              ) : (
                "Choose CNIC Images"
              )}
            </label>

            <input
              type="file"
              multiple
              {...register("CNIC", {
                required: "CNIC is required",
              })}
              className="d-none"
              ref={fileInputRefCNIC}
              onChange={(e) => handleFileChange(e, setCNIC, "CNIC")}
            />
          </div>
          <ErrorMessage
            name="CNIC"
            component="div"
            className="error-message"
            message={errors.CNIC?.message}
          />
        </div>

        {/* Org Card Image */}
        <div className="login__input-item">
          <div className="login-input form-control md-10 p-2">
            <i className="fa-solid fa-image text-black px-3 mt-2"></i>
            <label
              className="btn btn-outline-secondary bg-transparent border-0 px-0 m-0"
              onClick={() => triggerFileInput(fileInputRefOrgCard)}
            >
              {Org_card ? (
                <span className="form-label">{Org_card}</span>
              ) : (
                "Choose Org Card Images"
              )}
            </label>

            <input
              type="file"
              multiple
              {...register("Org_card", {
                required: "Org card is required",
              })}
              className="d-none"
              ref={fileInputRefOrgCard}
              onChange={(e) => handleFileChange(e, setOrg_card, "Org_card")}
            />
          </div>
          <ErrorMessage
            name="Org_card"
            component="div"
            className="error-message"
            message={errors.Org_card?.message}
          />
        </div>


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
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <span>
              <i className="fa-solid fa-city text-black"></i>
            </span>

            {/* Bootstrap Dropdown */}
            {showDropdown && (
              <ul
                className="dropdown-menu show w-100 position-absolute bg-white shadow overflow-auto border-0 top-100"
                style={{ maxHeight: "350px" }}
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
        {/* District */}
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
                className="dropdown-menu show w-100 position-absolute bg-white shadow overflow-auto border-0 top-100"
                style={{ maxHeight: "320px" }}
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
                className="dropdown-menu show w-100 position-absolute bg-white shadow overflow-auto border-0 top-100"
                style={{ maxHeight: "250px" }}
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
