import React from "react";
import Link from "next/link";
import Image from "next/image";
// internal
import ForgotForm from "@components/forms/forgot-form";
import ForgotImage from "@assets/img/slider/13/forgetpassword.jpg";
const ForgotArea = () => {
  return (
    <section className="login__area pt-110 pb-110">
      <div className="container">
        <div className="login__inner p-relative z-index-1">
          <div className="row justify-content-center align-items-center">
            
            {/* Left Column: Image */}
            <div className="col-xl-6 col-lg-6 d-none d-lg-block">
              <div className="login__image">
                <Image
                  src={ForgotImage}
                  alt="Forgot Password"
                  width={600} // adjust as needed
                  height={600} // adjust as needed
                  style={{ objectFit: "cover", borderRadius: "10px" }}
                />
              </div>
            </div>

            {/* Right Column: Forgot Form */}
            <div className="col-xl-6 col-lg-6 col-md-10">
              <div className="login__wrapper">
                <div className="login__top mb-30 text-center">
                  <h3 className="login__title">Forgot Password?</h3>
                  <p>Enter your email address to request password reset.</p>
                </div>
                <div className="login__form">
                  <ForgotForm />
                  <div className="login__register-now mt-3 text-center">
                    <p>
                      Remember your password? <Link href="/login">Login</Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotArea;
