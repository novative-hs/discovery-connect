import React, { useState, useEffect } from "react";

const BillingDetails = () => {
  const id = sessionStorage.getItem("userID");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`
          );
          const data = await response.json();

          if (response.ok && data.length > 0) {
            setUserData(data[0]);
          } else {
            console.error("Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="text-center">Loading...</div>;
  if (!userData) return <div className="text-danger text-center">No user data found.</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Billing Details</h5>
        </div>
        <div className="card-body">

          <div className="row mb-3">
            <div className="col-md-4 fw-semibold">Name:</div>
            <div className="col-md-8">{userData?.ResearcherName || "-"}</div>
          </div>
          <hr />

          <div className="row mb-3">
            <div className="col-md-4 fw-semibold">Address:</div>
            <div className="col-md-8">{userData?.fullAddress || "-"}</div>
          </div>
          <hr />

          <div className="row mb-3">
            <div className="col-md-4 fw-semibold">City:</div>
            <div className="col-md-8">{userData?.cityname || "-"}</div>
          </div>
          <hr />

          <div className="row mb-3">
            <div className="col-md-4 fw-semibold">Country:</div>
            <div className="col-md-8">{userData?.countryname || "-"}</div>
          </div>
          <hr />

          <div className="row mb-3">
            <div className="col-md-4 fw-semibold">Email:</div>
            <div className="col-md-8">{userData?.useraccount_email || "-"}</div>
          </div>
          <hr />

          <div className="row mb-2">
            <div className="col-md-4 fw-semibold">Phone:</div>
            <div className="col-md-8">{userData?.phoneNumber || "-"}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillingDetails;
