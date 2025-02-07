import React from "react";

const OrderSummary = () => {
  return (
    <div className="container mt-5 d-flex justify-content-center">
    <div className="card p-4 mt-3">
      {/* Order Information Section */}
      <div className="first d-flex justify-content-between align-items-center mb-3">
        <div className="info">
          <span className="d-block name">Thank you, Alex</span>
          <span className="order">Order - 4554645</span>
        </div>
        <img
          src="https://i.imgur.com/NiAVkEw.png"
          width="40"
          alt="Order Icon"
        />
      </div>

      {/* Order Status Summary */}
      <div className="detail">
        <span className="d-block summery">
          Your order has been dispatched. We are delivering when committe member approve your documents.
        </span>
      </div>

      <hr />

      {/* Customer Details */}
      <div className="text">
        <span className="d-block new mb-1">Alex Dorlew</span>
      </div>
      <span className="d-block address mb-3">
        672 Conaway Street, Bryantiville, Massachusetts 02327
      </span>

     

    </div>
  </div>
  );
};

export default OrderSummary;
