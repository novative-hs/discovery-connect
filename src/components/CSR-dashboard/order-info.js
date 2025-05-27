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
  const [counts, setCounts] = useState({
    shipping: null,
    dispatch: null,
    completed: null,
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [staffAction, setStaffAction] = useState("");
  const id = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;

  useEffect(() => {
    if (id) {
      const action = sessionStorage.getItem("staffAction") || "";
      setStaffAction(action);
    }
  }, [id]);

  useEffect(() => {
    if (id && staffAction) {
      fetchSampleCounts();
    }
  }, [id, staffAction]);

  const fetchSampleCounts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyOrderPacking`,
        {
          params: { csrUserId: id, staffAction: staffAction },
        }
      );

      const shipping = data.filter(item => item.order_status === "Shipped").length;
      const dispatch = data.filter(item => item.order_status === "Dispatched").length;
      const completed = data.filter(item => item.order_status === "Completed").length;

      setCounts({ shipping, dispatch, completed });
    } catch (error) {
      console.error("Failed to fetch sample counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (tabName) => {
    setActiveTab(tabName);
  };

  const showCount = (count) => (loading ? "Loading..." : count);

  return (
    <div className="profile__main">
      <div className="profile__main-top pb-4 d-flex justify-content-between align-items-center">
        <h4 className="profile__main-title text-capitalize">
          Welcome Customer Service Representative
        </h4>
       
      </div>

      <div className="profile__main-info ">
        <div className="row gx-3">
          <SingleOrderInfo
            info={showCount(counts.dispatch)}
            icon={<Truck />}
            
            title="Dispatch Order"
            onClick={() => handleNavigate("dispatchorder")}
          />
          <SingleOrderInfo
            info={showCount(counts.shipping)}
            icon={<Processing />}
            title="Shipping Order"
            onClick={() => handleNavigate("shippingorder")}
          />
          <SingleOrderInfo
            info={showCount(counts.completed)}
            icon={<Delivery />}
            title="Complete Order"
            onClick={() => handleNavigate("completedorder")}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
