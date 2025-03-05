import React, { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import axios from "axios";
// internal
import { useChangePasswordMutation } from "src/redux/features/auth/authApi";
import ErrorMessage from "@components/error-message/error";
import { notifyError, notifySuccess } from "@utils/toast";
import { EyeCut } from "@svg/index"; // Adjust the import according to your setup

const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  newPassword: Yup.string().required().min(6).label("New Password"),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref("newPassword"), null],
    "Passwords must match"
  ),
});

const ChangePassword = () => {
  const id = localStorage.getItem("userID");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [userDetail, setUserDetail] = useState();
  const [changePassword] = useChangePasswordMutation();
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>; // Or redirect to login
    } else {
      fetchUser(); // Call the function when the component mounts
      console.log("account_id on city page is:", id);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${id}`);
      const userEmail = response.data?.data[0]; // Extract email from the response
      setUserDetail(userEmail); // Set only the email in state
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  };

  // on submit
  const onSubmit = async (data) => {
    try {
      // Prepare request data
      const formData = {
        email: data.email,
        password: data.password,
        newPassword: data.newPassword,
      };
      // Send the change password request
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/changepassword`,
        formData
      );

      // Handle successful response
      console.log("Password changed successfully:", response.data);
      notifySuccess(response?.data?.message);

      // Optional: Reset form after success
      reset();
    } catch (error) {
      // Handle errors
      console.error("Error changing password:", error);
      notifyError(
        error?.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="profile__password p-2 mx-auto w-100 w-md-75 w-lg-50">
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row g-2">
        <div className="col-12">
          <div className="profile__input-box">
            <h6 className="fs-7 mb-1">Email Address</h6>
            <div className="profile__input">
              <input
                {...register("email", {
                  required: userDetail?.email ? false : "Email is required!",
                })}
                type="email"
                placeholder="Enter Email Address"
                value={userDetail?.email || ""}
                readOnly
                className="form-control form-control-sm"
              />
              <ErrorMessage message={errors.email?.message} />
            </div>
          </div>
        </div>
  
        <div className="col-12">
          <div className="profile__input-box">
            <h6 className="fs-7 mb-1">Current Password</h6>
            <div className="position-relative">
              <input
                {...register("password", { required: "Password is required!" })}
                type={showCurrentPass ? "text" : "password"}
                className="form-control form-control-sm"
                placeholder="Enter your password"
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ cursor: "pointer" }}
              >
                {showCurrentPass ? (
                  <i className="fa-regular fa-eye fs-7"></i>
                ) : (
                  <i className="fa-regular fa-eye-slash fs-7"></i>
                )}
              </span>
            </div>
          </div>
        </div>
  
        <div className="col-12">
          <div className="profile__input-box">
            <h6 className="fs-7 mb-1">New Password</h6>
            <div className="position-relative">
              <input
                {...register("newPassword", { required: "New Password is required!" })}
                type={showNewPass ? "text" : "password"}
                className="form-control form-control-sm"
                placeholder="Enter your new password"
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ cursor: "pointer" }}
              >
                {showNewPass ? (
                  <i className="fa-regular fa-eye fs-7"></i>
                ) : (
                  <i className="fa-regular fa-eye-slash fs-7"></i>
                )}
              </span>
            </div>
          </div>
        </div>
  
        <div className="col-12">
          <div className="profile__input-box">
            <h6 className="fs-7 mb-1">Confirm Password</h6>
            <div className="position-relative">
              <input
                {...register("confirmPassword")}
                type={showConfirmPass ? "text" : "password"}
                className="form-control form-control-sm"
                placeholder="Confirm your new password"
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                style={{ cursor: "pointer" }}
              >
                {showConfirmPass ? (
                  <i className="fa-regular fa-eye fs-7"></i>
                ) : (
                  <i className="fa-regular fa-eye-slash fs-7"></i>
                )}
              </span>
            </div>
          </div>
        </div>
  
        <div className="col-12">
          <div className="profile__btn">
            <button type="submit" className="tp-btn-3">
              Update
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
  
  );
};

export default ChangePassword;
