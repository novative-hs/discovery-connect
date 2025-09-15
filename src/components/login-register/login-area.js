import React from "react";
import Link from "next/link";
import LoginForm from "@components/forms/login-form";
import cleanBg from "@assets/img/slider/13/samplelogin.jpg"; // Replace with the clean background image
import Image from "next/image";

const LoginArea = () => {
  return (
    <section
      className="position-relative"
      style={{
        backgroundImage: `url(${cleanBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Overlay with blur */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(81, 81, 81, 0.75)",
          backdropFilter: "blur(5px)", // This softens background text
          zIndex: 1,
        }}
      ></div>

      {/* Login Container */}
      <div className="container position-relative z-index-2" style={{ zIndex: 2 }}>
        <div className="row justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
          <div className="col-xl-5 col-lg-6 col-md-8">
            <div className="bg-dark bg-opacity-75 p-4 p-md-5 rounded shadow text-white">
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">Login</h3>
                
              </div>

              {/* Login Form */}
              <LoginForm />

              <div className="text-center mt-3">
                <p className="text-white">
                  Don’t have an account?{" "}
                  <Link href="/register" className="text-info text-decoration-underline">
                    Register Yourself Now
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

export default LoginArea;
