import React, { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import { EmailTwo, Location, MobileTwo, UserTwo } from "@svg/index";
import { useUpdateProfileMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";
import ErrorMessage from "@components/error-message/error";

// yup  schema
const schema = Yup.object().shape({
  username: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  phoneNumber: Yup.string().required().min(11).label("phoneNumber"),
  city: Yup.string().required().label("city"),
  ntn: Yup.string().required().label("ntn"),
  fullAddress: Yup.string().required().label("fullAddress"),
});

const UpdateUser = () => {
  const { user } = useSelector((state) => state.auth);
  console.log("User from Redux state:", user);
  const [updateProfile, {}] = useUpdateProfileMutation();
   // State to hold fetched user data
   const [userData, setUserData] = useState(null);
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

 // Fetch user details on component mount
 useEffect(() => {
  console.log("User object:", user);
  if (!user || !user._id || !user.accountType) {
    console.error('User data missing or incomplete');
    return;
  }
  const fetchUserProfile = async () => {
    if (user && user._id && user.accountType) {
      try {
        const response = await fetch(
          `/api/user-dashboard/profile/${user._id}?accountType=${user.accountType}`
        );
        const data = await response.json();
        console.log("API Response:", data); 
        if (data.status === "success") {
          setUserData(data.data);
          reset(data.data); // Reset form fields with fetched data
        } else {
          notifyError(data.error);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        notifyError("Failed to fetch user profile.");
      }
    }
  };

  fetchUserProfile();
}, [user, reset]);

  // on submit
  const onSubmit = (data) => {
    updateProfile({
      id:user?._id,
      username:data.username,
      email:data.email,
      phoneNumber:data.phoneNumber,
      city:data.city,
      ntn:data.ntn,
      fullAddress:data.fullAddress,
    }).then((result) => {
      console.log(result);
      if(result?.error){
        notifyError(result?.error?.data?.message);
      }
      else {
        notifySuccess(result?.data?.message);
      }
    })
    reset();
  };

  return (
    <div className="profile__info">
      <h3 className="profile__info-title">Personal Details</h3>
      <div className="profile__info-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("username", { required: `Name is required!` })}
                    type="text"
                    placeholder="Enter your username"
                    defaultValue={userData?.username}
                  />
                  <span>
                    <UserTwo />
                  </span>
                  <ErrorMessage message={errors.username?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("email", { required: `Email is required!` })}
                    type="email"
                    placeholder="Enter your email"
                    defaultValue={userData?.email}
                  />
                  <span>
                    <EmailTwo />
                  </span>
                  <ErrorMessage message={errors.email?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("phoneNumber", { required: true })}
                    type="text"
                    placeholder="Enter your phone number"
                    defaultValue={userData?.phoneNumber}
                  />
                  <span>
                    <MobileTwo />
                  </span>
                  <ErrorMessage message={errors.phoneNumber?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("city", { required: `city is required!` })}
                    type="text"
                    placeholder="Enter your city"
                    defaultValue={userData?.city}
                  />
                  <span>
                    <UserTwo />
                  </span>
                  <ErrorMessage message={errors.city?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-6 col-md-6">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("ntn", { required: `NTN number is required!` })}
                    type="text"
                    placeholder="Enter your NTN number"
                    defaultValue={userData?.ntn}
                  />
                  <span>
                    <UserTwo />
                  </span>
                  <ErrorMessage message={errors.ntn?.message} />
                </div>
              </div>
            </div>

            <div className="col-xxl-12">
              <div className="profile__input-box">
                <div className="profile__input">
                  <input
                    {...register("fullAddress", { required: true })}
                    type="text"
                    placeholder="Enter your fullAddress"
                    defaultValue={userData?.fullAddress}
                  />
                  <span>
                    <Location />
                  </span>
                  <ErrorMessage message={errors.fullAddress?.message} />
                </div>
              </div>
            </div>
            <div className="col-xxl-12">
              <div className="profile__btn">
                <button type="submit" className="tp-btn">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
