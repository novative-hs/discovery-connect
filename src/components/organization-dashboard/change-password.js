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
  email: Yup.string().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  newPassword: Yup.string().required().min(6).label("New Password") .min(6, "Password must be at least 6 characters long")
  .matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/,
    "Password must contain at least one letter, one number, and one special character"
  ),
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
    setValue, // Add this line
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/${id}`
      );
      const userEmail = response.data?.data[0]; // Extract email from the response
      setUserDetail(userEmail); // Set only the email in state
      setValue("email", userEmail);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  };

  // on submit
  const onSubmit = async (data) => {
    if (data.password === data.newPassword) {
        notifyError("New password cannot be the same as the old password.");
        return;
    }

    const formData = {
        email: data.email,
        password: data.password,
        newPassword: data.newPassword,
    };

    axios
        .put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/changepassword`, formData)
        .then((response) => {
            notifySuccess(response.data.message);
            reset();
        }, (error) => {
            // Error handling inside .then()
            if (error.response) {
                notifyError(error.response.data.message || "An error occurred.");
            } else {
                notifyError("An unexpected error occurred.");
            }
        });
};



  return (
    <div className="profile__password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          {" "}
          {/* Use g-3 for consistent spacing between rows */}
          <div className="col-12">
            <div className="profile__input-box">
              <h4>Email Address</h4>
              <div className="profile__input">
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Enter Email Address"
                  value={userDetail?.email || ""}
                  readOnly
                  className="form-control form-control-sm"
                />
              </div>
              <ErrorMessage message={errors.email?.message} />
            </div>
          </div>
          <div className="col-12">
            <div className="profile__input-box">
              <h4>Current Password</h4>
              <div className="position-relative">
                <input
                  {...register("password", {
                    required: `Password is required!`,
                  })}
                  type={showCurrentPass ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter your password"
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  style={{ cursor: "pointer" }}
                >
                  {showCurrentPass ? (
                    <i className="fa-regular fa-eye"></i>
                  ) : (
                    <i className="fa-regular fa-eye-slash"></i>
                  )}
                </span>
              </div>
              <ErrorMessage message={errors.password?.message} />
            </div>
          </div>
          <div className="col-12">
            <div className="profile__input-box">
              <h4>New Password</h4>
              <div className="position-relative">
                <input
                  {...register("newPassword", {
                    required: `New Password is required!`,
                  })}
                  type={showNewPass ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter your new password"
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={{ cursor: "pointer" }}
                >
                  {showNewPass ? (
                    <i className="fa-regular fa-eye"></i>
                  ) : (
                    <i className="fa-regular fa-eye-slash"></i>
                  )}
                </span>
              </div>
              <ErrorMessage message={errors.newPassword?.message} />
            </div>
          </div>
          <div className="col-12">
            <div className="profile__input-box">
              <h4>Confirm Password</h4>
              <div className="position-relative">
                <input
                  {...register("confirmPassword", {
                    required: `Confirm Password is required!`,
                  })}
                  type={showConfirmPass ? "text" : "password"}
                  className="form-control"
                  placeholder="Confirm your new password"
                />
                <span
                  className="position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{ cursor: "pointer" }}
                >
                  {showConfirmPass ? (
                    <i className="fa-regular fa-eye"></i>
                  ) : (
                    <i className="fa-regular fa-eye-slash"></i>
                  )}
                </span>
              </div>
              <ErrorMessage message={errors.confirmPassword?.message} />
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
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
