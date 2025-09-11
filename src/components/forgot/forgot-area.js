import React from "react";
import Link from "next/link";
import Image from "next/image";
import ForgotForm from "@components/forms/forgot-form";
import ForgotImage from "@assets/img/slider/13/forgot.jpeg"; // apna image path

const ForgotArea = () => {
  return (
    <section className="forgot-area position-relative d-flex align-items-center justify-content-center min-vh-100">
      {/* Curved Top Section */}
      {/* <div className="top-curve">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#a6bfe5ff"
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,144C672,117,768,75,864,69.3C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,0L0,0Z"
          ></path>
        </svg>
      </div> */}

      {/* Curved Bottom Section */}
      {/* <div className="bottom-curve">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#a6bfe5ff"
            fillOpacity="1"
            d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,138.7C672,139,768,181,864,192C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L0,320Z"
          ></path>
        </svg>
      </div> */}

      {/* Content */}
      <div className="container position-relative z-3">
        <div className="row justify-content-center">
          {/* <div className="col-12 text-center mb-4">
            <h2 className="fw-bold text-white">Debugsol Software Solutions</h2>
          </div> */}

          <div className="col-xl-10 col-lg-12">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="row g-0">
                {/* Left Image */}
                <div className="col-lg-6 d-none d-lg-block position-relative">
                  <div className="h-100 image-container">
                    <Image
                      src={ForgotImage}
                      alt="Forgot Password"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div className="image-overlay"></div>
                  </div>
                </div>

                {/* Right Form */}
                <div className="col-lg-6">
                  <div className="p-4 p-md-5 form-container">
                    <div className="text-center mb-4">
                      <p className="text-muted mb-2">A few more clicks to sign in to your account.</p>
                      <h4 className="fw-bold text-dark mb-1">Forget password?</h4>
                    </div>

                    <ForgotForm />

                    <div className="text-center mt-4">
                      <p className="mb-2">
                        Remember your password?{" "}
                        <Link href="/login" className="text-primary fw-semibold">
                          Login
                        </Link>
                      </p>
                    </div>

                    {/* <div className="text-center mt-4 pt-3">
                      <small className="text-muted">
                        <Link href="#" className="text-muted me-3">Terms of Use</Link>
                        <Link href="#" className="text-muted">Privacy Policy</Link>
                      </small>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .forgot-area {
          background: linear-gradient(to bottom, #ffffffff 0%, #a0b8d6 100%);
          overflow: hidden;
          padding: 60px 0;
        }
        
        .top-curve {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1;
        }
        
        .bottom-curve {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 1;
        }
        
        .card {
          border: none;
          border-radius: 16px !important;
        }
        
        .image-container {
          height: 100%;
          min-height: 450px;
        }
        
        // .image-overlay {
        //   position: absolute;
        //   top: 0;
        //   left: 0;
        //   width: 100%;
        //   height: 100%;
        //   background: linear-gradient(to bottom, rgba(124, 164, 224, 0.3), rgba(160, 184, 214, 0.3));
        // }
        
        .form-container {
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        @media (max-width: 991px) {
          .image-container {
            min-height: 300px;
          }
        }
      `}</style>
    </section>
  );
};

export default ForgotArea;