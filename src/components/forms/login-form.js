import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
// internal
import { EyeCut, Lock, UserTwo } from "@svg/index";
import ErrorMessage from "@components/error-message/error";
import { useLoginUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";

const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginUser, {}] = useLoginUserMutation();
  const router = useRouter();
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await loginUser({
        email: data.email,
        password: data.password,
      });
  
      if (result?.error) {
        notifyError(result?.error?.data?.error);
      } else {
        const { id, accountType, authToken } = result?.data?.user || {};
        if (!id) {
          return notifyError("Unexpected error: User ID is missing.");
        }

        localStorage.setItem("userID", id); // Store 'id' as userID
        localStorage.setItem("accountType", accountType);
        notifySuccess("Login successfully");
        document.cookie = `authToken=${authToken}; path=/; Secure; SameSite=Strict;`;

        // Redirect based on account type
        if (accountType) {
          router.push("/dashboardheader");
        } else {
          router.push("/default-dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      notifyError("An unexpected error occurred.");
    }
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-100 w-md-50 mx-auto p-2"
    >
      {/* Email Field */}
      <div className="mb-2 position-relative">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white border-end-0 px-2">
            <UserTwo />
          </span>
          <input
            {...register("email")}
            name="email"
            type="email"
            placeholder="Enter your email"
            className="form-control form-control-sm border-start-0"
            id="email"
          />
        </div>
        <small className="text-danger">
          <ErrorMessage message={errors.email?.message} />
        </small>
      </div>

      {/* Password Field */}
      <div className="mb-2 position-relative">
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-white border-end-0 px-2">
            <Lock />
          </span>
          <input
            {...register("password")}
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="form-control form-control-sm border-start-0"
            id="password"
          />
          <button
            type="button"
            className="btn btn-light border btn-sm"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <i className="fa-regular fa-eye"></i> : <EyeCut />}
          </button>
        </div>
        <small className="text-danger">
          <ErrorMessage message={errors.password?.message} />
        </small>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="remember" />
          <label className="form-check-label" htmlFor="remember">
            Remember me
          </label>
        </div>
        <div className="login__forgot">
          <Link href="/forgot" className="small">
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Submit Button */}
      <button type="submit" className="tp-btn w-100 py-2">
        Sign In
      </button>
    </form>
  );
};

export default LoginForm;
