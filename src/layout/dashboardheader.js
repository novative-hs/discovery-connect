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
import CartArea from "@components/cart/cart-area";

const Header = ({ setActiveTab, activeTab }) => {
  const id = localStorage.getItem("userID");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const [hovered, setHovered] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user: userInfo } = useSelector((state) => state.auth);
  const { quantity } = useCartInfo();
  const { wishlist } = useSelector((state) => state.wishlist);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Track if profile is open
  const [user, setUser] = useState();
  const [userlogo, setUserLogo] = useState(null);
  const [userType, setUserType] = useState(null);
  const [cartCount, setCartCount] = useState();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".nav-link")
      ) {
        setShowSampleDropdown(null);
      }
    };
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
  const handleToggleSampleDropdown = (index) => {
    setShowSampleDropdown(showSampleDropdown === index ? null : index); // Toggle only the clicked dropdown
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
        `http://localhost:5000/api/user/getAccountDetail/${id}`
      );

      setUser(response.data[0]); // Store fetched organization data
    } catch (error) {
      console.error("Error fetching Organization:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/cart/getCount/${id}`
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

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
  };

  const handleUpdateProfile = () => {
    setShowDropdown(false);
    if (userType === "organization") {
      setActiveTab("update-organization");
    } else if (userType === "researcher") {
      setActiveTab("update-user");
    } else if (userType === "collectionsites") {
      setActiveTab("update-collectionsite");
    } else if (userType === "biobank") {
      setActiveTab("update-biobank");
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
        ]
      : userType == "registrationadmin"
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
      : [];

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Image src={logo} alt="Logo" width={240} height={150} />
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

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {menuItems.map(({ label, tab, dropdown }, index) => (
                <li key={tab} className="nav-item dropdown">
                  <button
                    className={`nav-link btn ${
                      activeTab === tab ? "text-primary" : "text-dark"
                    }`}
                    onClick={() => {
                      if (dropdown) {
                        handleToggleSampleDropdown(index); // Toggle only the clicked dropdown
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                  >
                    {label}
                  </button>

                  {/* Render dropdown items if available */}
                  {dropdown && showSampleDropdown === index && (
                    <ul className="dropdown-menu show">
                      {dropdown.map(({ label, tab }) => (
                        <li key={tab}>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              setActiveTab(tab);
                              setShowSampleDropdown(null); // Close dropdown after clicking
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

            {/* Wrap these items in a div to conditionally move them */}
            <div
              className={`d-flex align-items-center ${
                isProfileOpen ? "move-to-off-canvas" : ""
              }`}
            >
              {userType === "registrationadmin" && (
                <>
                  <h4>Welcome Admin!</h4>
                </>
              )}

              <div className="dropdown me-3">
                <button
                  className="btn dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded={showDropdown}
                  onClick={handleToggleDropdown}
                >
                  {/* Conditional rendering for user logo or default icon */}
                  {userlogo ? (
                    <Image
                      src={userlogo} // Assuming user.logo contains the URL to the user's logo
                      alt="User Logo"
                      width={50} // Adjust size as needed
                      height={50}
                      className="rounded-circle"
                    />
                  ) : (
                    <i className="fa fa-user"></i>
                  )}
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${
                    showDropdown ? "show" : ""
                  }`}
                  aria-labelledby="userDropdown"
                >
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleUpdateProfile}
                    >
                      Update Profile
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleChangePassword}
                    >
                      Change Password
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>

              {userType !== "registrationadmin" && (
                <>
                  <Link
                    href="/wishlist"
                    className="btn d-flex align-items-center me-3 position-relative"
                  >
                    <Heart className="me-2" />
                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle p-1">
                      {wishlist.length}
                    </span>
                  </Link>

                  <Link
                    href="/cart"
                    className="btn d-flex align-items-center me-3 position-relative"
                  >
                    <Cart className="me-2" />
                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle p-1">
                      {cartCount}
                    </span>
                  </Link>
                </>
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
