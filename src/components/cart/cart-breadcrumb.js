import React from "react";
import { useRouter } from "next/router";

const CartBreadcrumb = ({ title, subtitle }) => {
  const router = useRouter();
  const userID =
    typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;
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
              {/* <div className="breadcrumb__list">
                <span>
                  <a href="#">Home</a>
                </span>
                <span className="dvdr">
                  <i className="fa-solid fa-circle-small"></i>
                </span>
                <span>{subtitle}</span>
              </div> */}

              {/* Updated button with improved design */}
              {/* <div className="mt-4 d-flex justify-content-center">
  <button
    onClick={handleBackToShop}
    className="btn btn-outline-primary fw-semibold fs-5 px-4 py-2 rounded-pill d-flex align-items-center shadow-sm transition"
    style={{
      transition: "all 0.3s ease",
      backgroundColor: "#f8f9fa",
      borderColor: "#0d6efd",
      color: "#0d6efd",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#0d6efd";
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#f8f9fa";
      e.currentTarget.style.color = "#0d6efd";
    }}
  >
    <i className="fas fa-arrow-left me-2" style={{ fontSize: "18px" }}></i>
    <span>Back  Home</span>
  </button>
</div> */}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartBreadcrumb;
