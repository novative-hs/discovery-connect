import React from "react";
import Link from "next/link";
// internal
import Shapes from "./shapes";
import RegisterForm from "@components/forms/register-form";

const RegisterArea = () => {
  return (
    <section className="login__area position-relative mb-5 mt-50">
      <div className="container-sm position-relative z-index-1">
        <div className="d-flex justify-content-center">
          {/* <Shapes/> */}
          <div
            className="col-lg-3 col-md-5 col-sm-8 p-5 w-100 flex-grow-1"
            style={{ maxWidth: "550px", minWidth: "280px" }}
          >
            <div className="login__wrapper bg-white border rounded shadow-sm p-2">
              <div className="login__top mb-2 text-center">
                <p className="login__title fw-bold text-black fs-5 mb-1">
                  Register Now!
                </p>
                <p className="text-muted small mb-2">
                  Sign up with your social account below
                </p>
              </div>
              <div className="login__form">
                <RegisterForm
                  inputClass="form-control-sm"
                  buttonClass="btn-sm"
                />
                <div className="login__register-now text-center mt-2">
                  <p className="small mb-1">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary fw-bold">
                      Log in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterArea;
