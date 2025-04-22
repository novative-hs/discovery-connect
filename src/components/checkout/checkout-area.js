import React, { useState } from "react";
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";
import SampleCopy from "@components/checkout/sample-copy";
import "bootstrap/dist/css/bootstrap.min.css";

const CheckoutArea = ({ handleSubmit, validateDocuments, submitHandler, ...others }) => {
  const id = sessionStorage.getItem("userID");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [sampleCopyData, setSampleCopyData] = useState({
    studyCopy: null,
    reportingMechanism: "",
    irbFile: null,
    nbcFile: null,
  });

  if (id === null) {
    return <div>Loading...</div>;
  } else {
    console.log("Researcher ID on checkout page is:", id);
  }

  return (
    <section className="checkout-area pb-85">
      <div className="container">
        
        <form>
          <div className="row mt-3">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3>Billing Details</h3>
                <BillingDetails {...others} />
              </div>
            </div>

            <div className="col-lg-6">
              <SampleCopy
                setSampleCopyData={setSampleCopyData}
                onComplete={() => setIsModalOpen(true)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${isModalOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="modal-dialog modal-lg modal-md modal-sm" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Order Summary</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <OrderArea {...others} sampleCopyData={sampleCopyData} />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default CheckoutArea;
