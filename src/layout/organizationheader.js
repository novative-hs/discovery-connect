import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import logo from "@assets/img/logo/faviconnn.png";
import { userLoggedOut } from "src/redux/features/auth/authSlice";
import { Heart, Cart } from "@svg/index"; // Replace with actual paths to icons
import CartSidebar from "@components/common/sidebar/cart-sidebar";

const Header = ({style_2 = false ,setActiveTab, accountType }) => {
  const [activeTab, setActiveTabState] = useState("order-info");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hovered, setHovered] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
  };

  const handleUpdateProfile = () => {
    setShowDropdown(false);
    setActiveTab("update-organization");
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
    accountType === "organization"
      ? [
          { label: "Profile", tab: "order-info" },
          { label: "Researcher List", tab: "researchers" },
        ]
      : accountType === "researcher"
      ? [
          { label: "Sample List", tab: "samples" },
          { label: "My Reports", tab: "my-reports" },
        ]
      : [];

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand">
            <Image src={logo} alt="Logo" width={180} height={150} />
          </Link>

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
              {menuItems.map(({ label, tab }, index) => (
                <li key={tab} className="nav-item">
                  <button
                    className={`nav-link btn ${
                      hovered === index ? "text-primary" : "text-dark"
                    }`}
                    onClick={() => handleSetActiveTab(tab)}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center">
              <div className="dropdown me-3">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded={showDropdown}
                  onClick={handleToggleDropdown}
                >
                  <i className="fa fa-user"></i>
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
              <button className="btn d-flex align-items-center me-3">
                <Heart className="me-2" />
              </button>
              <button
                className="btn d-flex align-items-center"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <Cart className="me-2" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
};

export default Header;
