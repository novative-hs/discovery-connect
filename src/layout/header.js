import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import { Cart, User } from "@svg/index";
import useSticky from "@hooks/use-sticky";
import useCartInfo from "@hooks/use-cart-info";

const Menus = dynamic(() => import("./menus"), { ssr: false });

const Header = ({ style_2 = false }) => {
  const router = useRouter();
  const { sticky } = useSticky();
  const [isHovered, setIsHovered] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const { sampleCount } = useCartInfo();
  const { user: userInfo } = useSelector((s) => s.auth);

  const headerAreaCls = `header__area ${style_2 ? "" : "header__transparent"}`;
  const bottomCls = `header__bottom-13 header__padding-7 header__black-3 header__bottom-border-4 ${
    style_2 ? "header__bottom-13-white" : "grey-bg-17"
  } header__sticky ${sticky ? "header-sticky" : ""}`;

  const userHref = userInfo ? "/user-dashboard" : "/login";
  const userEl = userInfo
    ? (userInfo.imageURL
        ? <Image src={userInfo.imageURL} alt="user img" width={35} height={35} style={{ objectFit: "cover", borderRadius: "50%" }} />
        : <h2 className="text-uppercase tp-user-login-avater text-dark">{userInfo.name?.[0]}</h2>)
    : <User className="w-4 h-4" />;

  return (
    <header>
      <div className={headerAreaCls}>
        <div
          className={bottomCls}
          style={{ height: "90px", backgroundColor: "#fff", boxShadow: sticky ? "0 4px 8px rgba(0,0,0,.05)" : "none", transition: "all .3s ease-in-out" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="container-fluid">
            <div className="mega-menu-wrapper p-relative">
              <div className="row align-items-center">
                <div className="col-xxl-1 col-xl-2 col-lg-4 col-md-4 col-sm-5 col-8">
                  <div className="logo" style={{ marginLeft: "-30px", marginTop: "5px" }}>
                    <Link href="/">
                      <Image src={logo} alt="logo" width={200} height={90} priority style={{ maxWidth: "180px", objectFit: "contain" }} />
                    </Link>
                  </div>
                </div>

                <div className="col-xxl-8 col-xl-7 d-none d-xl-block">
                  <div className="main-menu main-menu-13 pl-45 main-menu-ff-space" style={{ display: "flex", justifyContent: "center", alignItems: "start" }}>
                    <nav id="mobile-menu-3"><Menus isHovered={isHovered} /></nav>
                  </div>
                </div>

                <div className="col-xxl-3 col-xl-3 col-lg-8 col-md-8 col-sm-7 col-4">
                  <div className="header__bottom-right-13 d-flex justify-content-end align-items-center pl-30">
                    <div className="header__action-13 d-none d-md-flex">
                      <ul className="flex items-center gap-4">
                        <li>
                          <Link href={userHref} className={!userInfo ? "flex items-center gap-2 no-underline text-black hover:text-blue-600" : undefined}>
                            {userEl}
                          </Link>
                        </li>
                        <li>
                          <button className="cartmini-open-btn" onClick={() => router.push("/cart")}>
                            <Cart />
                            {Number(sampleCount) > 0 && <span className="tp-item-count">{sampleCount}</span>}
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div className="d-flex d-md-none align-items-center gap-2">
                      <button className="cartmini-open-btn" onClick={() => router.push("/cart")}>
                        <Cart />
                        {Number(sampleCount) > 0 && <span className="tp-item-count">{sampleCount}</span>}
                      </button>
                      <div className="header__hamburger ml-2">
                        <button onClick={() => setIsOffCanvasOpen(true)} type="button" className="hamburger-btn hamburger-btn-black offcanvas-open-btn">
                          <span style={{ background: "#08048c" }}></span>
                          <span style={{ background: "#f50606ff" }}></span>
                          <span style={{ background: "#08048c" }}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
