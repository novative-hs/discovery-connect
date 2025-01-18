import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import logo from "@assets/img/logo/faviconnn.png";
import { Cart, Heart, Search, User } from "@svg/index";
import useSticky from "@hooks/use-sticky";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import OffCanvas from "@components/common/off-canvas";
import useCartInfo from "@hooks/use-cart-info";
import SearchForm from "@components/forms/search-form";
import { userLoggedOut } from "src/redux/features/auth/authSlice";

const Header = ({ style_2 = false, setActiveTab }) => {
  const { sticky } = useSticky();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { quantity } = useCartInfo();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { user: userInfo } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTabState] = useState("order-info");
  const [screenWidth, setScreenWidth] = useState(0); // state to track screen size
  const [hovered, setHovered] = useState(false);
  const handleToggleDropdown = () => {
    console.log("Dropdown toggled");
    setShowDropdown(!showDropdown);
  };

  const DropdownStyle = {
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "14px",
  };

  const handleUpdateProfile = () => {
    setShowDropdown(false);
    setActiveTab("update-user");
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    setActiveTab("change-password");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    dispatch(userLoggedOut());
    router.push("/");
  };

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth >= 1200) {
        setIsOffCanvasOpen(false); // Close off-canvas on larger screens
      }
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  }, []);

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    setActiveTabState(tab);
  };

  return (
    <>
<header>
<div className={`header__area ${style_2 ? "" : "header__transparent"}`} style={{ width: "200%", maxWidth: "100vw" }}>
    <div
      className={`header__bottom-13 header__padding-6 header__black-3 header__bottom-border-4 ${
        style_2 ? "header__bottom-13-white" : "grey-bg-17"
      } header__sticky ${sticky ? "header-sticky" : ""}`}
    >
      <div className="container-fluid">
      <div className="row align-items-center">
          {/* Logo */}
          <div className="col-6 col-md-2 col-lg-1 d-flex justify-content-start">
            <Link href="/">
              <Image
                src={logo}
                alt="logo"
                style={{ width: "150px", height: "auto" }}
              />
            </Link>
          </div>

       {/* Navigation Menu */}
       <div className="col-lg-7 d-none d-lg-flex justify-content-start">
            <nav className="d-flex flex-nowrap overflow-auto">
              <ul className="nav">
                {[
                  { label: "Profile", tab: "order-info" },
                  { label: "City", tab: "city" },
                  { label: "Country", tab: "country" },
                  { label: "District", tab: "district" },
                  { label: "Researcher List", tab: "researcher" },
                  { label: "Organization List", tab: "organization" },
                  { label: "Collection Site List", tab: "collectionsite" },
                  { label: "Committee Members List", tab: "committee-members" },
                ].map(({ label, tab }, index) => (
                  <li key={tab} className="nav-item">
                    <button
                      className={`nav-link text-black ${
                        activeTab === tab ? "active text-white bg-dark" : ""
                      }`}
                      onClick={() => handleSetActiveTab(tab)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>


          {/* Action Icons */}
          <div className="col-6 col-md-4 col-lg-4 d-flex align-items-center justify-content-end">
          <div className="d-flex align-items-center">
                    {/* Search */}
                    <div className="header__search-13">
                      <SearchForm />
                    </div>

                    {/* User Profile */}
                    {userInfo?.imageURL ? (
                      <Link href="/user-dashboard">
                        <Image
                          src={userInfo.imageURL}
                          alt="user img"
                          width={35}
                          height={35}
                          className="rounded-circle"
                        />
                      </Link>
                    ) : userInfo?.name ? (
                      <Link href="/user-dashboard">
                        <h2 className="text-uppercase">{userInfo.name[0]}</h2>
                      </Link>
                    ) : (
                      <div className="dropdown">
                        <button
                          className="btn dropdown-toggle"
                          type="button"
                          id="dropdownMenuButton"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <User />
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownMenuButton"
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
                            <button
                              className="dropdown-item"
                              onClick={handleLogout}
                            >
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Wishlist */}
                    <Link href="/wishlist" className="position-relative me-3">
                <Heart />
                <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                  {wishlist.length}
                </span>
              </Link>

                    {/* Cart */}
                    <button
                className="btn position-relative me-3"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <Cart />
                <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                  {quantity}
                </span>
              </button>

                    {/* offCanva */}     
                    {screenWidth < 992 && (               
                    <div className="header__hamburger ml-30 d-xl-none">
                        <button
                          onClick={() => setIsOffCanvasOpen(true)}
                          type="button"
                          className="hamburger-btn hamburger-btn-black offcanvas-open-btn"
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
        </div>
      </div>
    </div>
  </div>
</header>

{/* OffCanvas and Cart Sidebar */}
<CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
<OffCanvas
  isOffCanvasOpen={isOffCanvasOpen}
  setIsOffCanvasOpen={setIsOffCanvasOpen}
  setActiveTab={setActiveTab}
  dashboardType="registeradmin"
/>


    </>
  );
};

export default Header;
