import React from "react";
import { useRouter } from "next/router";

const CartBreadcrumb = ({ title }) => {
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
      style={{ backgroundColor: "#faf5f0" }} // warm beige background
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xxl-8 col-xl-8 col-lg-10">
            <div className="breadcrumb__content text-center p-relative z-index-1">
              <h3 className="breadcrumb__title d-flex align-items-center justify-content-center">
               
                {title}
              </h3>



            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartBreadcrumb;
