import React from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import MobileMenus from "./mobile-menus";

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
        className={`offcanvas__area offcanvas__area-1 ${isOffCanvasOpen ? "offcanvas-opened" : ""
          }`}
      >
        <div className="offcanvas__wrapper">
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
              <div className="offcanvas__logo logo" style={{ position: 'relative', top: '-30px' }}>
                <Link href="/">
                  <Image src={logo} alt="logo" width={150} height={70} />
                </Link>
                {/* LINKS BELOW LOGO */}
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href="/" style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>Home</Link>
                  <Link href="/about" style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>About Us</Link>
                  <Link href="/shop" style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>Discover</Link>
                  <Link href="/login" style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>Login</Link>
                </div>
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
