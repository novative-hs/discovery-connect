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
         const minimalData = {
  name: data[0].ResearcherName,
  email:data[0].useraccount_email,
  OrganizationName:data[0].OrganizationName,
  phone: data[0].phoneNumber,
  address: data[0].fullAddress,
  city: data[0].cityname,
  country: data[0].countryname
};

sessionStorage.setItem("userdetail", JSON.stringify(minimalData));
setUserData(minimalData);
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
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <div className="card shadow-sm border-0 p-4">
       
        <div style={{ lineHeight: "1.8" }}>
          <div className="fw-bold text-uppercase fs-5">{userData?.ResearcherName || "-"}</div>
          <div className="fw-bold text-muted mt-2">Address</div>
          <div>{userData?.fullAddress || "-"}</div>
          <div>{userData?.cityname || "-"}, {userData?.countryname || "-"}</div>
        </div>
      </div>
    </div>
  );
};

export default BillingDetails;
