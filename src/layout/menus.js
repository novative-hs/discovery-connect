import Link from "next/link";
import React from "react";
import menu_data from "./menu-data";
import { useRouter } from "next/router";

const Menus = ({ currentRoute, isHovered }) => {
  const router = useRouter();

  const linkStyle = {
    fontSize: "15px",
    textTransform: "uppercase",
    padding: "8px 16px", // Reduced padding
    transition: "all 0.3s ease",
    display: "inline-block",
    textDecoration: "none",
    color: isHovered ? "black" : "white",  // Change text color based on hover
  };

  const activeLinkStyle = {
    borderBottom: "2px solid red",  // Active link underline
    color: "red", // Active link text color
  };

  return (
    <>
      {currentRoute === "/organization-dashboard" && (
        <ul className="fs-7 small">
          <li>
            <a
              href="#"
              className="fs-7 small"
              style={{ fontSize: "0.85rem" }} // Extra small font
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("nav-sample-tab")?.click();
              }}
            >
              Researchers List
            </a>
          </li>
        </ul>
      )}
      {currentRoute === "/collectionsite-dashboard" && (
        <ul className="fs-7 small">
          <li>
            <a
              href="#"
              className="fs-7 small"
              style={{ fontSize: "0.85rem" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("nav-sample-tab")?.click();
              }}
            >
              Samples List
            </a>
          </li>
        </ul>
      )}
      {currentRoute === "/registrationadmin-dashboard" && (
        <ul className="fs-7 small">
          <li>
            <a
              href="#"
              className="fs-7 small"
              style={{ fontSize: "0.85rem" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("nav-collectionsite-tab")?.click();
              }}
            >
              Collection Sites List
            </a>
          </li>
        </ul>
      )}
      {currentRoute === "/user-dashboard" && (
        <ul className="fs-7 small">
          <li>
            <a
              href="#"
              className="fs-7 small"
              style={{ fontSize: "0.85rem" }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("nav-sample-tab")?.click();
              }}
            >
              Samples List
            </a>
          </li>
        </ul>
      )}
      {!["/organization-dashboard", "/collectionsite-dashboard", "/registrationadmin-dashboard", "/user-dashboard"].includes(currentRoute) && (
        <ul
          className="fs-7 small"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px", // Increased spacing between menu titles
          }}
        >
          {menu_data.map((menu, i) => (
            <li key={i} className={`${menu.hasDropdown ? "has-dropdown" : ""}`}>
              <Link
                href={`${menu.link}`}
                className={`fs-7 small align-item-center ${currentRoute === menu.link ? "active-link" : ""}`}
                style={currentRoute === menu.link ? { ...linkStyle, ...activeLinkStyle } : linkStyle} // Style changes based on hover and active
                onMouseEnter={(e) => {
                  e.target.style.borderBottom = "2px solid red";
                  e.target.style.color = "red";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderBottom = currentRoute === menu.link ? "2px solid red" : "2px solid transparent";
                  e.target.style.color = currentRoute === menu.link ? "red" : isHovered ? "black" : "white";
                }}
              >
                {menu.title}
              </Link>

              {menu.hasDropdown && (
                <ul className="submenu fs-7 small">
                  {menu.submenus.map((sub, i) => (
                    <li key={i}>
                      <Link
                        href={`${sub.link}`}
                        className="fs-7 small"
                        style={{
                          fontSize: "0.85rem",
                          textDecoration: "none",
                          color: isHovered ? "black" : "white", // Add hover color change for submenus
                        }}
                      >
                        {sub.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Menus;
