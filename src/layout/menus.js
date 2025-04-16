import Link from "next/link";
import React from "react";
import menu_data from "./menu-data";
import { useRouter } from "next/router";

const Menus = ({ currentRoute, isHovered }) => {
  const router = useRouter();

  const linkStyle = {
    fontSize: "0.85rem",
    textTransform: "uppercase",
    padding: "8px 20px", // reduced padding
    transition: "all 0.3s ease",
    display: "inline-block",
    textDecoration: "none",
    whiteSpace: "nowrap", // keeps them in one line
  };
  

  const activeLinkStyle = {
    borderBottom: "2px solid red",
    color: "red",
  };

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
      }}
    >
      {menu_data.map((menu, i) => (
        <li key={i} className={`${menu.hasDropdown ? "has-dropdown" : ""}`}>
          <Link
            href={`${menu.link}`}
            className={`fs-7 small align-item-start ${currentRoute === menu.link ? "active-link" : ""}`}
            style={currentRoute === menu.link ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
            onMouseEnter={(e) => {
              e.target.style.borderBottom = "2px solid red";
              e.target.style.color = "red";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderBottom =
                currentRoute === menu.link ? "2px solid red" : "2px solid transparent";
              e.target.style.color =
                currentRoute === menu.link ? "red" : "black" ;
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
  );
};

export default Menus;
