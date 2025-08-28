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
            const user = {
              name: data[0].ResearcherName || "-",
              email: data[0].useraccount_email || "-",
              organization: data[0].OrganizationName || "-",
              phone: data[0].phoneNumber || "-",
              address: data[0].fullAddress || "-",
              city: data[0].cityname || "-",
              country: data[0].countryname || "-",
            };
            sessionStorage.setItem("userdetail", JSON.stringify(user));
            setUserData(user);
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

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!userData) return <div className="text-danger text-center mt-5">No user data found.</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "700px" }}>
      <div className="card shadow-lg border-0 rounded-4 p-4">
        
        <p className="fs-5" style={{ lineHeight: "1.8", textAlign: "justify" }}>
          {userData.name}, associated with {userData.organization}, 
          can be contacted via email at <strong>{userData.email}</strong> or by phone at <strong>{userData.phone}</strong>. 
          Their billing address is <strong>{userData.address}</strong>, 
          located in <strong>{userData.city}</strong>, <strong>{userData.country}</strong>.
        </p>
      </div>
    </div>
  );
};

export default BillingDetails;
