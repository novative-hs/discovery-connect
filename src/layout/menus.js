import Link from "next/link";
import React from "react";
import menu_data from "./menu-data";
import { useRouter } from "next/router";

const Menus = ({ currentRoute, isHovered }) => {
  const router = useRouter();

  const linkStyle = {
    fontSize: "0.85rem",
    textTransform: "uppercase",
    padding: "10px 30px", // reduced padding
    transition: "all 0.3s ease",
    display: "inline-block",
    textDecoration: "none",
    whiteSpace: "nowrap", // keeps them in one line
  };


  const activeLinkStyle = {
    borderBottom: "2px solid red",
    color: "red",
  };

  const isActive = (menu) => {
    if (currentRoute === menu.link && menu.link !== "/") return true;

    if (menu.hasDropdown && menu.submenus) {
      return menu.submenus.some((sub) => currentRoute === sub.link);
    }
    return false;
  };


  return (
    <ul
      className="fs-7 small"
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        alignItems: "start",
        justifyContent: "start",
      }}
    >
      {menu_data.map((menu, i) => (
        <li key={i} className={`${menu.hasDropdown ? "has-dropdown" : ""}`}>
          <Link
            href={menu.link}
            className={`fs-7 small align-item-start ${isActive(menu) ? "active-link" : ""}`}
            style={isActive(menu) ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderBottom = "2px solid red";
              e.currentTarget.style.color = "red";
            }}
            onMouseLeave={(e) => {
              if (isActive(menu)) {
                e.currentTarget.style.borderBottom = "2px solid red";
                e.currentTarget.style.color = "red";
              } else {
                e.currentTarget.style.borderBottom = "2px solid transparent";
                e.currentTarget.style.color = "black";
              }
            }}
          >
            {menu.title}
          </Link>



          {menu.hasDropdown && (
            <ul className="submenu fs-7 small">
              {menu.submenus.map((sub, i) => (
                <li key={i}>
                  <Link
                    href={sub.link}
                    className={`dropdown-item ${currentRoute === sub.link ? "active-link" : ""}`}
                    style={
                      currentRoute === sub.link
                        ? { ...linkStyle, ...activeLinkStyle }
                        : linkStyle
                    }
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
