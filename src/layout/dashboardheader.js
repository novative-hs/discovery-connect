import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import { userLoggedOut } from "src/redux/features/auth/authSlice";
import { Heart, Cart } from "@svg/index"; // Replace with actual paths to icons
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import axios from "axios";
import useCartInfo from "@hooks/use-cart-info";

const Header = ({ setActiveTab, activeTab }) => {
  const id = localStorage.getItem("userID");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { sampleCount } = useCartInfo();
  const [user, setUser] = useState();
  const [userlogo, setUserLogo] = useState(null);
  const [userType, setUserType] = useState(null);
  const [cartCount, setCartCount] = useState();
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(localStorage.getItem("cartCount") || 0);
    };

    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleToggleDropdown = (index) => {
    setShowDropdown(showDropdown === index ? null : index); // Toggle only the clicked dropdown
  };

  useEffect(() => {
    const type = localStorage.getItem("accountType")?.trim().toLowerCase();
    if (type) {
      setUserType(type);
    } else {
      console.error("Account type is null or undefined");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>; // Or redirect to login
    } else {
      console.log("account_id on Header page is:", id);
      fetchCart();
      fetchUserDetail();
    }
  }, []);

  const fetchUserDetail = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`
      );

      setUser(response.data[0]); // Store fetched organization data
    } catch (error) {
      console.error("Error fetching Organization:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getCount/${id}`
      );

      console.log("API Response:", response.data);

      if (
        response.data.length > 0 &&
        typeof response.data[0].Count === "number"
      ) {
        setCartCount(response.data[0].Count);
        localStorage.setItem("cartCount", response.data[0].Count);
        console.log("Cart count stored:", response.data[0].Count);
      } else {
        console.warn("Unexpected API response format");
        localStorage.setItem("cartCount", 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    if (user) {
      setUserLogo(
        user?.logo?.data
          ? `data:image/jpeg;base64,${Buffer.from(user?.logo.data).toString(
            "base64"
          )}`
          : null
      );
    }
  });

  const handleUpdateProfile = () => {
    setShowDropdown(false);

    if (userType === "biobank") {
      return;
    }

    if (userType === "organization") {
      setActiveTab("update-organization");
    } else if (userType === "researcher") {
      setActiveTab("update-user");
    } else if (userType === "collectionsites") {
      setActiveTab("update-collectionsite");
    } else if (userType === "biobank") {
      setActiveTab("update-biobank");
    }
    else if (userType === "committeemember") {
      setActiveTab("update-committeemember");
    } else {
      setActiveTab("update-profile");
    }
    setIsProfileOpen(true); // Set profile open state to true
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    setActiveTab("change-password");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    localStorage.removeItem("userID");
    dispatch(userLoggedOut());
    router.push("/");
  };

  const menuItems =
    userType == "organization"
      ? [
        { label: "Profile", tab: "order-info" },
        { label: "Researcher List", tab: "researchers" },
      ]
      : userType == "researcher"
        ? [
          { label: "Profile", tab: "order-info" },
          { label: "Sample List", tab: "samples" },
          { label: "My Order Samples", tab: "my-samples" },
        ]
        : userType == "databaseadmin"
          ? [
            { label: "Profile", tab: "order-info" },
            { label: "City", tab: "city" },
            { label: "Country", tab: "country" },
            { label: "District", tab: "district" },
            { label: "Researcher List", tab: "researcher" },
            { label: "Organization List", tab: "organization" },
            { label: "Collection Site List", tab: "collectionsite" },
            { label: "Committee Members List", tab: "committee-members" },
            {
              label: "Sample",
              tab: "sample",
              dropdown: [
                { label: "Ethnicity", tab: "ethnicity" },
                { label: "Sample Condition", tab: "sample-condition" },
                { label: "Storage Temperature", tab: "storage-temperature" },
                { label: "Container Type", tab: "container-type" },
                { label: "Quantity Unit", tab: "quantity-unit" },
                { label: "Sample Type Matrix", tab: "sample-type-matrix" },
                { label: "Test Method", tab: "test-method" },
                { label: "Test Result Unit", tab: "test-result-unit" },
                {
                  label: "Concurrent Medical Conditions",
                  tab: "concurrent-medical-conditions",
                },
                { label: "Test Kit Manufacturer", tab: "test-kit-manufacturer" },
                { label: "Test System", tab: "test-system" },
                {
                  label: "Test System Manufacturer",
                  tab: "test-system-manufacturer",
                },
              ],
            },
          ]
          : userType == "collectionsites"
            ? [
              { label: "Sample List", tab: "samples" },
              { label: "Sample Dispatch", tab: "sample-dispatch" },
            ]
            : userType == "biobank"
              ? [
                { label: "Sample List", tab: "samples" },
                { label: "Sample Dispatch", tab: "sample-dispatch" },
              ]
              : userType == "committeemember"
                ? [
                  { label: "Sample List", tab: "samples" },
                ]
                : userType == "registrationadmin"
                  ? [
                    { label: "Profile", tab: "order-info" },
                    { label: "Order List", tab: "order" },
                    { label: "Contact us List", tab: "contactus" },
                  ]
                  : userType == "order_packager"
        ? [
          { label: "Profile", tab: "order-info" },
          { label: "Order Packaging List", tab: "shippingorder" },
          { label: "Order Dispatch List", tab: "dispatchorder" },
          { label: "Order Completed List", tab: "completedorder" },
        ]
                  : [];
                  

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Image src={logo} alt="Logo" width={170} height={75} />
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {/* Collapsible Navbar */}
          <div
            className="collapse navbar-collapse w-100"
            id="navbarSupportedContent"
          >
            {/* Navbar Menu */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {menuItems.map(({ label, tab, dropdown }, index) => (
                <li
                  key={tab}
                  className="nav-item dropdown"
                  onMouseEnter={() => dropdown && setShowSampleDropdown(index)}
                  onMouseLeave={() => dropdown && setShowSampleDropdown(null)}
                >
                  <button
                    className={`nav-link btn btn-sm custom-nav-btn d-flex align-items-center ${activeTab === tab ? "text-primary" : "text-dark"
                      } fs-7`}
                    onClick={() => {
                      if (!dropdown) {
                        setActiveTab(tab);
                      }
                    }}
                  >
                    <small>{label}</small> {/* Makes text smaller */}
                    {label === "Sample" && (
                      <i
                        className={`ms-2 fas ${showSampleDropdown === index
                            ? "fa-caret-up"
                            : "fa-caret-down"
                          } text-black`}
                      ></i>
                    )}
                  </button>

                  {dropdown && showSampleDropdown === index && (
                    <ul
                      className="dropdown-menu show p-1"
                      style={{
                        minWidth: "120px", // Adjust width
                        fontSize: "0.85rem", // Smaller font size
                      }}
                    >
                      {dropdown.map(({ label, tab }) => (
                        <li key={tab}>
                          <button
                            className="dropdown-item fs-7 px-2 py-1"
                            style={{
                              transition:
                                "background-color 0.3s ease, color 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.classList.add(
                                "bg-secondary",
                                "text-white"
                              );
                            }}
                            onMouseLeave={(e) => {
                              e.target.classList.remove(
                                "bg-secondary",
                                "text-white"
                              );
                            }}
                            onClick={() => {
                              setActiveTab(tab);
                              setShowSampleDropdown(null);
                            }}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {/* Right Section */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              {userType === "registrationadmin" && (
                <span
                  className="text-primary fw-bold fs-6"
                  style={{ fontFamily: "Montserrat", whiteSpace: "nowrap" }}
                >
                  Welcome Registration Admin!
                </span>
              )}
              {userType === "databaseadmin" && (
                <span
                  className="text-primary fw-bold fs-6"
                  style={{ fontFamily: "Montserrat", whiteSpace: "nowrap" }}
                >
                  Welcome Database Admin!
                </span>
              )}

              {/* User Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-sm dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded={showDropdown}
                  onClick={handleToggleDropdown}
                >
                  {userlogo ? (
                    <Image
                      src={userlogo}
                      alt="User Logo"
                      width={35}
                      height={35}
                      className="rounded-circle border"
                    />
                  ) : (
                    <i className="fa fa-user fs-6 text-dark"></i>
                  )}
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${showDropdown ? "show" : ""
                    }`}
                  aria-labelledby="userDropdown"
                >
                  {userType !== "registrationadmin" && userType !== "biobank" && (
                    <li>
                      <button
                        className="dropdown-item fs-7"
                        onClick={handleUpdateProfile}
                      >
                        Update Profile
                      </button>
                    </li>
                  )}
                  <li>
                    <button
                      className="dropdown-item fs-7"
                      onClick={handleChangePassword}
                    >
                      Change Password
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item fs-7"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
              {userType === "researcher" && (
  <div className="d-flex gap-0">
<Link
  href={{
    pathname: router.pathname, // stays on the same dashboard route
    query: { ...router.query, tab: "Cart" },
  }}
  className="btn btn-sm position-relative"
>
  <Cart className="fs-7 text-white" />
  {cartCount > 0 && (
    <span className="fs-6 badge bg-danger position-absolute top-0 start-100 translate-middle p-1">
      {sampleCount}
    </span>
  )}
</Link>
  </div>
)}
            </div>
          </div>
        </div>
      </nav>

      {/* Conditionally render the CartSidebar */}
    </>
  );
};

export default Header;
