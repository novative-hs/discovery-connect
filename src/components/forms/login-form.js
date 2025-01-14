import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
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
  const [loginUser, { }] = useLoginUserMutation();
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
  
      console.log("Login result:", result); // Debug log for result
  
      if (result?.error) {
        notifyError(result?.error?.data?.error);
      } else {
        const { id, accountType, authToken } = result?.data?.user || {}; // Use 'id' instead of 'userID'
        if (!id) {
          console.error("id is undefined in the API response.");
          return notifyError("Unexpected error: User ID is missing.");
        }
  
        localStorage.setItem("userID", id); // Store 'id' as userID
        notifySuccess("Login successfully");
        document.cookie = `authToken=${authToken}; path=/; Secure; SameSite=Strict;`;
  
        // Redirect based on account type
        if (accountType?.toLowerCase() === "registrationadmin") {
          router.push("/registrationadmin-dashboard");
        } else if (accountType?.toLowerCase() === "researcher") {
          router.push("/user-dashboard");
        } else if (accountType?.toLowerCase() === "organization") {
          router.push("/organization-dashboard");
        } else if (accountType?.toLowerCase() === "collectionsites") {
          router.push("/collectionsite-dashboard");
        }else if (accountType?.toLowerCase() === "biobank") {
          router.push("/biobank-dashboard");
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="login__input-wrapper">
        <div className="login__input-item">
          <div className="login__input">
            <input
              {...register("email")}
              name="email"
              type="email"
              placeholder="Enter your email"
              id="email"
            />
            <span>
              <UserTwo />
            </span>
          </div>
          <ErrorMessage message={errors.email?.message} />
        </div>

        <div className="login__input-item">
          <div className="login__input-item-inner p-relative">
            <div className="login__input">
              <input
                {...register("password")}
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
            {/* error msg start */}
            <ErrorMessage message={errors.password?.message} />
            {/* error msg end */}
          </div>
        </div>
      </div>

      <div className="login__option mb-25 d-sm-flex justify-content-between">
        <div className="login__remember">
          <input type="checkbox" id="tp-remember" />
          <label htmlFor="tp-remember">Remember me</label>
        </div>
        <div className="login__forgot">
          <Link href="/forgot">forgot password?</Link>
        </div>
      </div>
      <div className="login__btn">
        {/* <Link href="/user-dashboard"> */}
          <button type="submit" className="tp-btn w-100">
            Sign In
          </button>
        {/* </Link> */}
      </div>
    </form>
  );
};

export default LoginForm;
