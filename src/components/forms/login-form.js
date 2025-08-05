import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useLoginUserMutation } from "src/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@utils/toast";

const schema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});

const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginUser] = useLoginUserMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

 const onSubmit = async (data) => {
  try {
    const result = await loginUser(data);
    if (result?.error) {
      const errorData = result.error?.data;
      const errorMsg =
        errorData?.message || errorData?.error || result.error?.statusText || "Internal Server Error";
      notifyError(errorMsg);
    } else {
      const { id, accountType, action,committeetype, authToken } = result?.data?.user || {};
      if (!id) return notifyError("Unexpected error: User ID is missing.");

      sessionStorage.setItem("userID", id);
      sessionStorage.setItem("accountType", accountType);
      if (typeof action !== "undefined") {
        sessionStorage.setItem("staffAction", action);
      }
      if (typeof committeetype !== "undefined") {
        sessionStorage.setItem("committeetype", committeetype);
      }
      
      notifySuccess("Login successfully");

      document.cookie = `authToken=${authToken}; path=/; Secure; SameSite=Strict;`;

      const fromPage = router.query.from;

      // ✅ Handle redirect after login based on source
      if (fromPage === "cart") {
        router.push("/cart?triggerCheckout=true"); // ✅ re-run pricing logic in cart
      } else if (fromPage === "checkout") {
        router.push("/dashboardheader?tab=Checkout");
      } else {
        router.push("/dashboardheader");
      }
    }
  } catch (error) {
    notifyError(error?.response?.data?.error || error?.message || "Something went wrong.");
  }
};


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email address</label>
        <input
          {...register("email")}
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          id="email"
          placeholder="Enter email"
        />
        <div className="invalid-feedback">{errors.email?.message}</div>
      </div>

      <div className="mb-3 position-relative">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          {...register("password")}
          type={showPass ? "text" : "password"}
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          id="password"
          placeholder="Password"
        />
        <span
          className="position-absolute top-50 end-0 translate-middle-y me-3"
          style={{ cursor: "pointer" }}
          onClick={() => setShowPass(!showPass)}
        >
          {showPass ? <i className="fa fa-eye-slash text-light"></i> : <i className="fa fa-eye text-light"></i>}
        </span>
        <div className="invalid-feedback">{errors.password?.message}</div>
      </div>

      <div className="mb-3 form-check d-flex justify-content-end align-items-center">
        {/* <div>
          <input type="checkbox" className="form-check-input" id="rememberMe" />
          <label className="form-check-label" htmlFor="rememberMe">Keep me logged in</label>
        </div> */}
        <Link href="/forgot" className="text-info small">Forgot password?</Link>
      </div>

      <button type="submit" className="btn btn-primary w-100">Log In</button>

      {/* <div className="text-center mt-3">
        <small>Or login using:</small>
        <div className="d-flex justify-content-center gap-3 mt-2">
          <button type="button" className="btn btn-outline-light btn-sm rounded-circle">
            <i className="fab fa-facebook-f"></i>
          </button>
          <button type="button" className="btn btn-outline-light btn-sm rounded-circle">
            <i className="fab fa-twitter"></i>
          </button>
          <button type="button" className="btn btn-outline-light btn-sm rounded-circle">
            <i className="fab fa-google-plus-g"></i>
          </button>
        </div> 
      </div>*/}
    </form>
  );
};

export default LoginForm;
