import React from "react";
import { useRouter } from "next/router";

const CartBreadcrumb = ({ title, subtitle }) => {
  const router = useRouter();
  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userID") : null;
    const handleBackToShop = () => {
      if (userID) {
        router.push("/dashboardheader?tab=Booksamples");
      } else {
        router.push("/shop");
      }
    };

  return (
    <section
      className="breadcrumb__area light-bg p-relative include-bg pt-40 pb-40"
      style={{ backgroundColor: "#f4f8fb" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-8 col-xl-8 col-lg-10">
            <div className="breadcrumb__content text-center p-relative z-index-1">
              <h3 className="breadcrumb__title">{title}</h3>
              <div className="breadcrumb__list">
                <span>
                  <a href="#">Home</a>
                </span>
                <span className="dvdr">
                  <i className="fa-solid fa-circle-small"></i>
                </span>
                <span>{subtitle}</span>
              </div>

              {/* Updated button with improved design */}
              <div className="mt-4 d-flex justify-content-center">
                <button
                  onClick={handleBackToShop}
                  className="btn btn-link text-decoration-none"
                  style={{
                    color: "#ffffff", // White text
                    fontWeight: "600",
                    fontSize: "18px",
                    border: "2px solid #0056b3", // Blue border
                    backgroundColor: "#0056b3", // Blue background
                    padding: "12px 24px", // Added padding for a larger button
                    cursor: "pointer",
                    borderRadius: "25px", // Rounded corners for a smoother look
                    transition: "all 0.3s ease", // Smooth transition for hover effect
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#0d6efd"; // Darker blue on hover
                    e.target.style.borderColor = "#0d6efd"; // Darker border on hover
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#0056b3"; // Original blue on leave
                    e.target.style.borderColor = "#0056b3"; // Original border on leave
                  }}
                >
                  <i className="fas fa-arrow-left me-2" style={{ fontSize: "18px" }}></i>
                  <span>Continue Shopping</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartBreadcrumb;
