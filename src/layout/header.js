import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Menus from "./menus";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import { Cart, User } from "@svg/index";
import useSticky from "@hooks/use-sticky";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import OffCanvas from "@components/common/off-canvas";
import useCartInfo from "@hooks/use-cart-info";
import bg from "@assets/img/contact/contact-bg.png";
const Header = ({ style_2 = false }) => {
  const router = useRouter();
  const { sticky } = useSticky();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const { sampleCount } = useCartInfo();
  const { user: userInfo } = useSelector((state) => state.auth);

  const handleProceedToCart = () => {
    router.push("/cart");
  };

  return (
    <>
      <header>
        <div className={`header__area ${style_2 ? "" : "header__transparent"}`}>
          <div
            className={`header__bottom-13 header__padding-7 header__black-3 header__bottom-border-4 ${style_2 ? "header__bottom-13-white" : "grey-bg-17"} header__sticky ${sticky ? "header-sticky" : ""}`}
            style={{ height: '100px',
              backgroundImage: `url(${bg.src})`
              // backgroundColor: '#e6f0fa'
               }}
            
          >
            <div className="container-fluid">
              <div className="mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  <div className="col-xxl-1 col-xl-2 col-lg-4 col-md-4 col-sm-5 col-8">
                    <div className="logo" style={{ marginLeft: '-50px', marginTop: '10px' }}>
                      <Link href="/">
                        <Image src={logo} alt="logo" style={{ width: '200px', height: '90px' }} />
                      </Link>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-xl-7 d-none d-xl-block">
                    <div className="main-menu main-menu-13 pl-45 main-menu-ff-space">
                      <nav id="mobile-menu-3">
                        <Menus />
                      </nav>
                    </div>
                  </div>
                  <div className="col-xxl-5 col-xl-3 col-lg-8 col-md-8 col-sm-7 col-4">
                    <div className="header__bottom-right-13 d-flex justify-content-end align-items-center pl-30">
                      <div className="header__action-13 d-none d-md-block">
                        <ul>
                          {userInfo?.imageURL ? (
                            <li>
                              <Link href="/user-dashboard">
                                <Image
                                  src={userInfo.imageURL}
                                  alt="user img"
                                  width={35}
                                  height={35}
                                  style={{ objectFit: "cover", borderRadius: "50%" }}
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
                            <li>
                              <Link href="/login">
                                <User />
                              </Link>
                            </li>
                          )}
                          <li>
                            <button className="cartmini-open-btn" onClick={handleProceedToCart}>
                              <Cart />
                              <span className="tp-item-count">{sampleCount}</span>
                            </button>
                          </li>
                        </ul>
                      </div>
                      <div className="header__hamburger ml-30 d-xl-none">
                        <button onClick={() => setIsOffCanvasOpen(true)} type="button" className="hamburger-btn hamburger-btn-black offcanvas-open-btn">
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
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsOffCanvasOpen={setIsOffCanvasOpen} />
    </>
  );
};

export default Header;
