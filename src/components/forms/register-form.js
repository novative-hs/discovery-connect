import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from "yup";
// internal
import { Email, EyeCut, Lock, UserTwo } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useRegisterUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";


const schema = Yup.object().shape({
  username: Yup.string().required().label("User Name"),
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
    is: ['Organization', 'CollectionSites'],
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
  // react hook form
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema)
  });

  // Watch accountType to conditionally render fields
  const accountType = watch("accountType");

  // on submit
  const onSubmit = (data) => {
    registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      accountType: data.accountType,
      // Include researcher-specific fields if account type is Researcher
      ...(data.accountType === 'Researcher' && {
        ResearcherName: data.ResearcherName,
        phoneNumber: data.phoneNumber,
        // researcherImage: data.researcherImage,
        fullAddress: data.fullAddress,
        city: data.city,
        district: data.district,
        country: data.country,
        nameofOrganization: data.nameofOrganization,
      }),
      // Include Organization-specific fields if account type is Organization
      ...(data.accountType === 'Organization' && {
        OrganizationName: data.OrganizationName,
        // logo: data.logo,
        type: data.type,
        HECPMDCRegistrationNo: data.HECPMDCRegistrationNo,
        ntnNumber: data.ntnNumber,
        fullAddress: data.fullAddress,
        city: data.city,
        district: data.district,
        country: data.country,
        phoneNumber: data.phoneNumber,
      }),
      // Include collectionsite-specific fields if account type is CollectionSites
      ...(data.accountType === 'CollectionSites' && {
        CollectionSiteName: data.CollectionSiteName,
        // labLogo: data.labLogo,
        ntnNumber: data.ntnNumber,
        fullAddress: data.fullAddress,
        city: data.city,
        district: data.district,
        country: data.country,
        phoneNumber: data.phoneNumber,
      }),
    }).then((result) => {
      if (result?.error) {
        notifyError('Register Failed');
      }
      else {
        notifySuccess(result?.data?.message);
      }
    })
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("username", { required: `Username is required!` })}
              name="username"
              type="text"
              placeholder="Enter username"
              id="username"
            />
            <span>
              <UserTwo />
            </span>
          </div>
          <ErrorMessage message={errors.username?.message} />
        </div>

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
              <option value="CollectionSites">CollectionSites</option>
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

            {/* <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("researcherImage")}
                  name="researcherImage"
                  type="file"
                  id="researcherImage"
                  style={{ width: "100%" }}
                />
                <span>
                  <i className="fa-solid fa-image"></i>
                </span>
              </div>
              <ErrorMessage message={errors.researcherImage?.message} />
            </div> */}

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
                <input
                  {...register("city")}
                  name="city"
                  type="text"
                  placeholder="City"
                  id="city"
                />
                <span>
                  <i className="fa-solid fa-city"></i>
                </span>
              </div>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("district")}
                  name="district"
                  type="text"
                  placeholder="District"
                  id="district"
                />
                <span>
                  <i className="fa-solid fa-map-marker-alt"></i>
                </span>
              </div>
              <ErrorMessage message={errors.district?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("country")}
                  name="country"
                  type="text"
                  placeholder="Country"
                  id="country"
                />
                <span>
                  <i className="fa-solid fa-globe"></i>
                </span>
              </div>
              <ErrorMessage message={errors.country?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("nameofOrganization")}
                  name="nameofOrganization"
                  type="text"
                  placeholder="Name of Organization"
                  id="nameofOrganization"
                />
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

            {/* <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("logo")}
                  name="logo"
                  type="file"
                  id="logo"
                  style={{ width: "100%" }}
                />
                <span>
                  <i className="fa-solid fa-image"></i>
                </span>
              </div>
              <ErrorMessage message={errors.logo?.message} />
            </div> */}

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
                <input
                  {...register("city")}
                  name="city"
                  type="text"
                  placeholder="City"
                  id="city"
                />
                <span>
                  <i className="fa-solid fa-city"></i>
                </span>
              </div>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("district")}
                  name="district"
                  type="text"
                  placeholder="District"
                  id="district"
                />
                <span>
                  <i className="fa-solid fa-map-marker-alt"></i>
                </span>
              </div>
              <ErrorMessage message={errors.district?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("country")}
                  name="country"
                  type="text"
                  placeholder="Country"
                  id="country"
                />
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

            {/* <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("labLogo")}
                  name="labLogo"
                  type="file"
                  id="labLogo"
                  style={{ width: "100%" }}
                />
                <span>
                  <i className="fa-solid fa-image"></i>
                </span>
              </div>
              <ErrorMessage message={errors.labLogo?.message} />
            </div> */}

            {/* Common CollectionSites and Organization */}
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
                <input
                  {...register("city")}
                  name="city"
                  type="text"
                  placeholder="City"
                  id="city"
                />
                <span>
                  <i className="fa-solid fa-city"></i>
                </span>
              </div>
              <ErrorMessage message={errors.city?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("district")}
                  name="district"
                  type="text"
                  placeholder="District"
                  id="district"
                />
                <span>
                  <i className="fa-solid fa-map-marker-alt"></i>
                </span>
              </div>
              <ErrorMessage message={errors.district?.message} />
            </div>

            <div className="login__input-item">
              <div className="login__input">
                <input
                  {...register("country")}
                  name="country"
                  type="text"
                  placeholder="Country"
                  id="country"
                />
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
