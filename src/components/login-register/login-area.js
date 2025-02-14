import React from "react";
import Link from "next/link";
// Internal
import Shapes from "./shapes";
import LoginForm from "@components/forms/login-form";

const LoginArea = () => {
  return (
    <section className="d-flex align-items-center justify-content-center min-vh-100">
    <div className="container-sm d-flex justify-content-center">
    <div className="card shadow-lg p-2 w-56 h-32 md:w-64 md:h-40 sm:w-80 sm:h-48">
    {/* <Shapes/> */}

        <div className="card-body text-center">
          <h4 className="fw-bold">Hello Again</h4>
          <p className="text-muted small">
            Enter your credentials to access your account.
          </p>
  
          {/* Login Form */}
          <LoginForm />
  
          {/* Register Link */}
          <div className="mt-2">
            <p className="text-muted small">
              Don’t have an account?{" "}
              <Link href="/register" className="text-primary fw-bold">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  
    {/* Background Shapes */}
    {/* <Shapes /> */}
  </section>
  
  
  );
};

export default LoginArea;
