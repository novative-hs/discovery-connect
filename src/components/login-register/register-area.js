import React from "react";
import Link from "next/link";
import RegisterForm from "@components/forms/register-form";
import bg from "@assets/img/slider/13/bg-reg.png";

const RegisterArea = () => {
  return (
    <section
      className="position-relative"
      style={{
        backgroundImage: `url(${bg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        }}
      ></div>

      {/* Form Area */}
   <div className="container position-relative z-index-2 py-5" style={{ zIndex: 2 }}>
  <div className="row justify-content-center align-items-center min-vh-100">
    <div className="col-md-10 col-lg-6 col-xl-5">
      <div className="card shadow border-0 rounded-4 p-3 p-sm-4">
         <div className="login__top mb-30 text-center">
                  <h3 className="login__title">Register Now!</h3>
                  <p>You can signup with you social account below</p>
                </div>

        <RegisterForm />

        <div className="text-center mt-3">
          <p className="small text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-primary fw-semibold text-decoration-none">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

    </section>
  );
};

export default RegisterArea;
