import React, { useEffect, useState } from "react";
import { Box, Delivery, Processing, Truck } from "@svg/index";
import axios from "axios";
import { useRouter } from 'next/router';

function SingleOrderInfo({ icon, info, title, onClick }) {
  return (
    <div className="col-md-3 col-sm-6" onClick={onClick}>
      <div className="profile__main-info-item">
        <div className="profile__main-info-icon">
          <span className="total-order">
            <span className="profile-icon-count profile-download">{info}</span>
            {icon}
          </span>
        </div>
        <h4 className="profile__main-info-title">{title}</h4>
      </div>
    </div>
  );
}

const OrderInfo = ({ setActiveTab }) => {
  const [countShipping, setCountShipping] = useState(null);
  const [countDispatch, setCountDispatch] = useState(null);
  const [countCompleted, setCountCompleted] = useState(null);
  
  const router = useRouter();
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Order packaging Id on sample page is:", id);
  }
  useEffect(() => {
   

    // Set an interval to refresh data every 5 seconds (5000ms)
    const interval = setInterval(() => {
      fetchSamples();
    }, 500);

    // Clear the interval when the component unmounts to avoid memory leaks
    return () => clearInterval(interval);
  }, []); 
  
  const fetchSamples = async () => {
    try {
      
  
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyOrderPacking`,
        {
        params: { csrUserId: id }
      }
      );
  
      const samples = response.data;
  
      // Filter samples based on order_status
      const shippingCount = samples.filter(sample => sample.order_status === 'Shipped').length;
      const dispatchCount = samples.filter(sample => sample.order_status === 'Dispatched').length;
      const completedCount = samples.filter(sample => sample.order_status === 'Completed').length;
  
      // Update state
      setCountShipping(shippingCount);
      setCountDispatch(dispatchCount);
      setCountCompleted(completedCount);
  
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  // Handle navigation to different order pages
  const handleNavigate = (orderType) => {
    setActiveTab(orderType); // Set the active tab based on order type
  };

  return (
    <div className="profile__main">
      <div className="profile__main-top pb-80">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="profile__main-inner d-flex flex-wrap align-items-center">
              <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">
                  Welcome Order Packager Supervisor
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="profile__main-info">
        <div className="row gx-3">
          <SingleOrderInfo
            info={countDispatch !== null ? countDispatch : "Loading..."}
            icon={<Truck />}
            title="Dispatch Order"
            onClick={() => handleNavigate("dispatchorder")} // Set active tab to "dispatchorder"
          />
          <SingleOrderInfo
            info={countShipping !== null ? countShipping : "Loading..."}
            icon={<Processing />}
            title="Shipping Order"
            onClick={() => handleNavigate("shippingorder")} // Set active tab to "shippingorder"
          />
          <SingleOrderInfo
            info={countCompleted !== null ? countCompleted : "Loading..."}
            icon={<Delivery />}
            title="Complete Order"
            onClick={() => handleNavigate("completedorder")} // Set active tab to "completeorder"
          />
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
