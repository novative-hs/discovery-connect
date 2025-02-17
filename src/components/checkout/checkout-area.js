import React, { useState } from "react";
// internal
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";

const CheckoutArea = ({handleSubmit,submitHandler,...others}) => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Researcher iD on checkout page is Id on sample page is:", id);
  }
  return (
    <section className="checkout-area pb-85">
      <div className="container">
        <form>
          <div className="row mt-3">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3>Billing Details</h3>
                {/* billing details start*/}
                <BillingDetails {...others} />
                {/* billing details end*/}
              </div>
            </div>
            <div className="col-lg-6">
              {/* order area start */}
              <OrderArea
                {...others}
              />
              {/* order area end */}
            </div>
          </div>
        </form>
      </div>
    </section>

  );
};

export default CheckoutArea;