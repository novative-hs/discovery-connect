import Link from "next/link";
import React from "react";
import menu_data from "./menu-data";
import { useRouter } from "next/router";

// Inside the component:

const Menus = ({ currentRoute }) => {
  const router = useRouter();
  if (currentRoute === "/organization-dashboard") {
    return (
      <ul className="fs-7 small">
        {" "}
        {/* Applied Bootstrap small font size */}
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
    );
  } else if (currentRoute === "/collectionsite-dashboard") {
    return (
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
    );
  } else if (currentRoute === "/registrationadmin-dashboard") {
    return (
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
    );
  } else if (currentRoute === "/user-dashboard") {
    return (
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
    );
  }
  return (
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
      {" "}
      {/* Bootstrap font-size small */}
      {menu_data.map((menu, i) => (
        <li key={i} className={`${menu.hasDropdown ? "has-dropdown" : ""}`}>
          <Link
            href={`${menu.link}`}
            className={`fs-7 small align-item-center text-dark ${
              currentRoute === menu.link ? "active-link" : ""
            }`} 
            style={{
              fontSize: "15px",
              textTransform: "uppercase",
              padding: "8px 16px", // Reduced padding
              transition: "all 0.3s ease",
              display: "inline-block",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderBottom = "2px solid red";
              e.target.style.color = "red";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderBottom =
                currentRoute === menu.link
                  ? "2px solid red"
                  : "2px solid transparent";
              e.target.style.color =
                currentRoute === menu.link ? "#fff" : "#888";
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
                    style={{ fontSize: "0.85rem", textDecoration: "none" }}
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
  );
};

export default Menus;
