import React from "react";
import Image from "next/image";
import Link from "next/link";
import shape from "@assets/img/shape/offcanvas-shape-1.png";
import logo from "@assets/img/logo/logo-black.svg";
import MobileMenus from "./mobile-menus";
import SocialLinks from "@components/social";

const OffCanvas = ({
  isOffCanvasOpen,
  setIsOffCanvasOpen,
  setActiveTab,
  dashboardType, 
}) => {
  // Define role-specific menu items
  const getMenuItems = () => {
    switch (dashboardType) {
      case "registeradmin":
        return [
          { label: "Profile", tab: "order-info" },
          { label: "City", tab: "city" },
          { label: "Country", tab: "country" },
          { label: "District", tab: "diistrict" },
          { label: "Researcher List", tab: "researcher" },
          { label: "Organization List", tab: "organization" },
          { label: "Collection Siite List", tab: "collectionsite" },
          { label: "Committee Members", tab: "committee-members" },
        ];
      case "collectionSite":
        return [
          { label: "Sample List", tab: "samples" },
          { label: "Sample Dispatch", tab: "sample-dispatch" },
        ];
      case "biobank":
        return [
          { label: "Sample List", tab: "samples" },
          { label: "Sample Dispatch", tab: "sample-dispatch" },
        ];

      case "organization":
        return [
          { label: "Profile", tab: "order-info" },
          { label: "Researcher List", tab: "researchers" },
        ];
      case "researcher":
        return [
          { label: "Profile", tab: "order-info" },
          { label: "Sample List", tab: "samples" },
        ];
      default:
        return []; // Default or no menu items
    }
  };

  const menuItems = getMenuItems();
  
  return (
    <React.Fragment>
      <div
        className={`offcanvas__area offcanvas__area-1 ${
          isOffCanvasOpen ? "offcanvas-opened" : ""
        }`}
      >
        <div className="offcanvas__wrapper">
          <div className="offcanvas__shape">
            <Image className="offcanvas__shape-1" src={shape} alt="shape" />
          </div>
          <div className="offcanvas__close">
            <button
              onClick={() => setIsOffCanvasOpen(false)}
              className="offcanvas__close-btn offcanvas-close-btn"
            >
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
          <div className="offcanvas__content">
            <div className="offcanvas__top mb-40 d-flex justify-content-between align-items-center">
              <div className="offcanvas__logo logo">
                <Link href="/">
                  <Image src={logo} alt="logo" />
                </Link>
              </div>
            </div>
            <div className="mobile-menu-3 fix mb-40 menu-counter mean-container d-lg-none">
              <div className="mean-bar">
                <MobileMenus setActiveTab={setActiveTab} />
              </div>
            </div>
            <div className="mobile-menu-3 fix mb-40 menu-counter mean-container d-lg-none">
              <ul style={{ listStyleType: "none", padding: 0 }}>
            
                {menuItems.map((item, index) => (
                  <li
                    key={index}
                    className="menu-item"
                    style={{
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "10px",
                    }}
                  >
                    <Link
                      href="#"
                      onClick={() => {
                        setActiveTab(item.tab); // Set the active tab
                        setIsOffCanvasOpen(false); // Close the OffCanvas
                      }}
                      style={{
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      {item.label.toUpperCase()}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="offcanvas__btn">
              <a href="#" className="tp-btn-offcanvas">
                Getting Started <i className="fa-regular fa-chevron-right"></i>
              </a>
            </div>
            <div className="offcanvas__social">
              <h3 className="offcanvas__social-title">Follow :</h3>
              <SocialLinks />
            </div>
            <div className="offcanvas__contact">
              <p className="offcanvas__contact-call">
                <a href="tel:+964-742-44-763">+964 742 44 763</a>
              </p>
              <p className="offcanvas__contact-mail">
                <a href="mailto:info@harry.com">info@harry.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div
        onClick={() => setIsOffCanvasOpen(false)}
        className={`body-overlay ${isOffCanvasOpen ? "opened" : ""}`}
      ></div>
    </React.Fragment>
  );
};

export default OffCanvas;
