import React, { useState } from "react";
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";
import SampleCopy from "@components/checkout/sample-copy";

const CheckoutArea = ({ handleSubmit, submitHandler, ...others }) => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>;
  } else {
    console.log("Researcher ID on checkout page is:", id);
  }

  // Store SampleCopy data in state
  const [sampleCopyData, setSampleCopyData] = useState({
    studyCopy: null,
    reportingMechanism: "",
    irbFile: null,
    nbcFile: null,
  });

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
              {/* Sample Copy Component */}
              <SampleCopy setSampleCopyData={setSampleCopyData} />
              
              {/* OrderArea receives SampleCopy data */}
              <OrderArea {...others} sampleCopyData={sampleCopyData} />
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;
