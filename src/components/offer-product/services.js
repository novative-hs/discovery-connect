import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Services = () => {
  const router = useRouter();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true); // Trigger the animation after the component mounts
    }, 100); // You can adjust the delay as needed

    return () => clearTimeout(timer); // Clean up the timer when the component unmounts
  }, []);

  return (
    <>
      <div className="container-fluid bg-light text-white py-5">
        <div className="row text-center">
          {/* Column 1 */}
          <div
            className={`col-md-4 mb-4 ${
              animate ? "animate-fade-up delay-1" : ""
            } cursor-pointer`}
            onClick={() => router.push("/shop")}
          >
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="fa fa-flask fa-2x text-danger mb-3"></i>
                <h3 className="fw-bold text-dark">Find a Sample</h3>
                <ul className="list-unstyled mt-3 text-secondary">
                  <li>
                    Browse a vast collection of high-quality research samples.
                  </li>
                  <li>
                    <a
                      href="/shop"
                      className="text-decoration-none mt-3 text-white tp-btn"
                    >
                      Search Sample
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div
            className={`col-md-4 mb-4 ${
              animate ? "animate-fade-up delay-2" : ""
            } cursor-pointer`}
            onClick={() => router.push("/cart")}
          >
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="fa fa-box fa-2x text-danger mb-3"></i>
                <h3 className="fw-bold text-dark">Order a Sample</h3>
                <ul className="list-unstyled mt-3 text-secondary">
                  <li>
                    Easily request and receive samples tailored to your research
                    needs.
                  </li>
                  <li>
                    <a
                      href="/cart"
                      className="text-decoration-none mt-3 text-white tp-btn"
                    >
                     Order Now
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div
            className={`col-md-4 mb-4 ${
              animate ? "animate-fade-up delay-3" : ""
            } cursor-pointer`}
            onClick={() => router.push("/register")}
          >
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body text-center">
                <i className="fa fa-flask fa-2x text-danger mb-3"></i>
                <h3 className="fw-bold text-dark">
                  Add a Sample
                </h3>
                <ul className="list-unstyled mt-3 text-secondary ">
                  <li>
                    Register your collection site to add and manage
                    samples.
                  </li>
                  <li>
                    <a
                      href="/register"
                      className="text-decoration-none mt-4 text-white tp-btn"
                    >
                      Click here to Register
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease forwards;
          opacity: 0;
        }

        .delay-1 {
          animation-delay: 0.2s;
        }

        .delay-2 {
          animation-delay: 0.4s;
        }

        .delay-3 {
          animation-delay: 0.6s;
        }

        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background-color: white;
          border-radius: 16px;
          min-height: 320px; /* This helps match the height seen in the image */
          padding: 30px 20px;
        }

        .card:hover {
          transform: translateY(-10px) scale(1.03);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .card-body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .card-body i {
          color: #f7941d; /* Match orange icon color */
          margin-bottom: 16px;
        }

        .card-body h3 {
          font-weight: 700;
          color: #000;
          margin-bottom: 16px;
        }

        .list-unstyled li {
          font-size: 16px;
          color: #6c757d;
          line-height: 1.6;
        }

        .container-fluid {
          background: #f8f9fa !important;
        }

        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Services;
