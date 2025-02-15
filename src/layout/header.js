import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";

// internal
import Menus from "./menus";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import { Cart, Heart, Search, User } from "@svg/index";
import useSticky from "@hooks/use-sticky";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import OffCanvas from "@components/common/off-canvas";
import useCartInfo from "@hooks/use-cart-info";
import SearchForm from "@components/forms/search-form";

const Header = ({ style_2 = false }) => {
  const { sticky } = useSticky();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  //const { quantity } = useCartInfo();
  //const { wishlist } = useSelector((state) => state.wishlist);
  const { user: userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <header>
        <div className={`header__area ${style_2 ? "" : "header__transparent"}`}>
          <div
            className={`header__bottom-13 header__padding-7 header__black-3 header__bottom-border-4 ${style_2 ? "header__bottom-13-white" : "grey-bg-17"
              } header__sticky ${sticky ? "header-sticky" : ""}`}
            id="header-sticky"
          >
            <div className="container-fluid">
              <div className="mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  {/* Logo Section - Reduced Width & Logo Size */}
                  <div className="col-xxl-1 col-xl-2 col-lg-3 col-md-4 col-sm-5 col-6">
                    <div className="logo"style={{ marginLeft: "-30px" }}>
                      <Link href="/">
                        <Image
                          src={logo}
                          alt="logo"
                          width={150} // Set height and width independently
                          height={80} 
                        />
                      </Link>
                    </div>
                  </div>

                  {/* Menu Section - Reduced Padding */}
                  <div className="col-xxl-6 col-xl-6 d-none d-xl-block ps-2">
                    <div className="main-menu main-menu-13 pl-30 main-menu-ff-space fs-7 small">
                      <nav
                        id="mobile-menu-3"
                        className="fs-7 small"
                        style={{ fontSize: "0.85rem" }}
                      >
                        <Menus />
                      </nav>
                    </div>
                  </div>

                  {/* Right Section - Reduced Space & Icon Sizes */}
                  <div className="col-xxl-5 col-xl-4 col-lg-6 col-md-8 col-sm-7 col-6">
                    <div className="header__bottom-right-13 d-flex justify-content-end align-items-center ps-2">
                      <div className="header__action-13 d-none d-md-block">
                        <ul className="list-unstyled mb-0 d-flex align-items-center">
                          {/* User Profile - Reduced Image/Icon Size */}
                          {userInfo?.imageURL ? (
                            <li>
                              <Link href="/user-dashboard">
                                <Image
                                  src={userInfo.imageURL}
                                  alt="user img"
                                  width={20} // Reduced size
                                  height={20} // Reduced size
                                  className="rounded-circle"
                                />
                              </Link>
                            </li>
                          ) : userInfo?.name ? (
                            <li>
                              <Link href="/user-dashboard">
                                <h2 className="text-uppercase tp-user-login-avater fs-6">
                                  {userInfo.name[0]}
                                </h2>
                              </Link>
                            </li>
                          ) : (
                            <li>
                              <Link href="/login">
                                <User className="fs-5" />
                              </Link>
                            </li>
                          )}

                          {/* Cart Icon - Reduced Size */}
                          <li className="ms-2">
                            <Link href="/cart" className="position-relative">
                              <Cart className="me-1 fs-5" />
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Hamburger Menu - Reduced Spacing */}
                      <div className="header__hamburger ms-3 d-xl-none">
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

      {/* cart mini area start */}
      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
      {/* cart mini area end */}

      {/* off canvas start */}
      <OffCanvas
        isOffCanvasOpen={isOffCanvasOpen}
        setIsOffCanvasOpen={setIsOffCanvasOpen}
      />
      {/* off canvas end */}
    </>
  );
};

export default Header;
