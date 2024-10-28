import Link from "next/link";
import React from "react";
// internal
import OrderInfo from "./order-info";
import ProfileShapes from "./profile-shapes";
import ProfileNav from './profile-nav';
import MyOrders from './my-orders';
import ChangePassword from './change-password';
import Feedback from './feedback';
import UpdateCollectionsite from './update-collectionsite';
import SampleArea from './samples';


const DashboardArea = ({orderData}) => {
  return (
    <>
      <section className="profile__area pt-180 pb-120">
        <div className="container" style={{ marginTop: '-90px' }}>
          <div className="profile__inner p-relative">
            <ProfileShapes/>
            <div className="row">
              <div className="col-xxl-4 col-lg-4">
                <ProfileNav/>
              </div>
              <div className="col-xxl-8 col-lg-8">
                <div className="profile__tab-content">
                  <div className="tab-content" id="profile-tabContent">
                    {/* dashboard  */}
                    <div
                      className="tab-pane fade show active"
                      id="nav-profile"
                      role="tabpanel"
                      aria-labelledby="nav-profile-tab"
                    >
                      <OrderInfo orderData={orderData}/>
                    </div>
                    {/* my order tab */}
                    <div
                      className="tab-pane fade"
                      id="nav-order"
                      role="tabpanel"
                      aria-labelledby="nav-order-tab"
                    >
                      <MyOrders orderData={orderData} />
                    </div>

                     {/* Sample List */}
                     <div
                      className="tab-pane fade"
                      id="nav-sample"
                      role="tabpanel"
                      aria-labelledby="nav-sample-tab"
                    >
                      <SampleArea/>
                    </div>

                    {/* profile__info */}
                    <div
                      className="tab-pane fade"
                      id="nav-information"
                      role="tabpanel"
                      aria-labelledby="nav-information-tab"
                    >
                      <UpdateCollectionsite/>
                    </div>
                    {/* change password */}
                    <div
                      className="tab-pane fade"
                      id="nav-password"
                      role="tabpanel"
                      aria-labelledby="nav-password-tab"
                    >
                      <ChangePassword/>
                    </div>
                     {/* Feedback */}
                     <div
                      className="tab-pane fade"
                      id="nav-feedback"
                      role="tabpanel"
                      aria-labelledby="nav-feedback-tab"
                    >
                      <Feedback/>
                    </div>
                    {/*  */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardArea;
