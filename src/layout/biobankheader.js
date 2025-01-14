import React, { useState } from "react";
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

  const handleToggleDropdown = () => {
    console.log("Dropdown toggled");
    setShowDropdown(!showDropdown);
  };

  const DropdownStyle = {
    background: "none", border: "none", width: "100%", textAlign: "left", padding: "5px 10px", cursor: "pointer", fontSize: "14px",
  };

  const handleUpdateProfile = () => {
    setShowDropdown(false);
    setActiveTab("update-collectionsite");
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    setActiveTab("change-password");
  };

  const handleLogout = () => {
    setShowDropdown(false);
    dispatch(userLoggedOut());
    localStorage.removeItem("user");
    router.push('/')
  }

  // const handleNavigation = (tabId) => {
  //   document.getElementById(tabId)?.click();
  // };

  return (
    <>
      <header>
        <div className={`header__area ${style_2 ? "" : "header__transparent"}`}>
          <div
            className={`header__bottom-13 header__padding-7 header__black-3 header__bottom-border-4 ${style_2 ? "header__bottom-13-white" : "grey-bg-17"
              } header__sticky ${sticky ? "header-sticky" : ""}`}
            id="header-sticky"
            style={{ height: "120px" }}
          >
            <div className="container-fluid">
              <div className="mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  <div className="col-xxl-1 col-xl-2 col-lg-4 col-md-4 col-sm-5 col-8">
                    <div className="logo" style={{ marginLeft: "-30px" }}>
                      <Link href="/">
                        <Image
                          src={logo}
                          alt="logo"
                          style={{ width: "150px", height: "auto" }}
                        />
                      </Link>
                    </div>
                  </div>
                  <div className="col-xxl-8 col-xl-7 d-none d-xl-block">
                    <div className="main-menu main-menu-13 pl-45 main-menu-ff-space">
                      <nav id="mobile-menu-3">
                        <ul className="header__nav">
                          <li>
                            <button onClick={() => setActiveTab("samples")}>
                              Samples List
                            </button>
                          </li>
                          <li>
                            <button onClick={() => setActiveTab("sample-dispatch")}>
                              Samples Dispatch
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                  <div className="col-xxl-3 col-xl-3 col-lg-8 col-md-8 col-sm-7 col-4">
                    <div className="header__bottom-right-13 d-flex justify-content-end align-items-center pl-30">
                      <div className="header__search-13">
                        <SearchForm />
                      </div>
                      <div className="header__action-13 d-none d-md-block">
                        <ul style={{ display: 'flex', alignItems: 'center', gap: '1px', padding: 0, margin: 0, listStyleType: 'none' }}>
                          <li className="d-xxl-none">
                            <a href="#">
                              <Search />
                            </a>
                          </li>
                          {userInfo?.imageURL ? (
                            <li>
                              <Link href="/user-dashboard">
                                <Image
                                  src={userInfo.imageURL}
                                  alt="user img"
                                  width={35}
                                  height={35}
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />
                              </Link>
                            </li>
                          ) : userInfo?.name ? (
                            <li>
                              <Link href="/user-dashboard">
                                <h2 className="text-uppercase tp-user-login-avater">
                                  {userInfo.name[0]}
                                </h2>
                              </Link>
                            </li>
                          ) : (
                            <li className="user-menu" style={{ position: "relative" }}>
                              <Link
                                href="#"
                                onClick={(e) => {

                                  e.preventDefault();
                                  handleToggleDropdown();
                                }}
                              >
                                <User />
                              </Link>
                              {showDropdown && (
                                <ul
                                  style={{
                                    position: "absolute", top: "100%", right: "0", backgroundColor: "white", border: "1px solid #ccc", padding: "10px", margin: "0", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", zIndex: 9999, listStyleType: "none", width: "190px",
                                  }}
                                >
                                  <li>
                                    <button onClick={handleUpdateProfile} style={DropdownStyle}>
                                      Update Profile
                                    </button>
                                  </li>
                                  <li>
                                    <button onClick={handleChangePassword} style={DropdownStyle}>
                                      Change Password
                                    </button>
                                  </li>
                                  <li>
                                    <button onClick={handleLogout} style={DropdownStyle}>
                                      Logout
                                    </button>
                                  </li>
                                </ul>
                              )}
                            </li>

                          )}
                          <li>
                            <Link href="/wishlist">
                              <Heart />
                              <span className="tp-item-count">{wishlist.length}</span>
                            </Link>
                          </li>
                          <li>
                            <button
                              className="cartmini-open-btn"
                              onClick={() => setIsCartOpen(!isCartOpen)}
                            >
                              <Cart />
                              <span className="tp-item-count">{quantity}</span>
                            </button>
                          </li>
                        </ul>
                      </div>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      <OffCanvas
        isOffCanvasOpen={isOffCanvasOpen}
        setIsOffCanvasOpen={setIsOffCanvasOpen}
      />
    </>
  );
};

export default Header;