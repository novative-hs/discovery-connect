import React from 'react';
import BillingDetails from './billing-details';
import OrderArea from './order-area';
import SampleCopy from './sample-copy';

const CheckoutArea = () => {
  return (
    <section className="checkout-area pb-85 mt-100">
      <div className="container">
        <form>
          <div className="row">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3>Billing Details</h3>
                {/* billing details start */}
                <div className="border p-4 mb-4">
                  <BillingDetails />
                </div>
                {/* billing details end */}
              </div>
            </div>
            <div className="col-lg-6">
              {/* order area start */}
              <OrderArea />
              {/* order area end */}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;
