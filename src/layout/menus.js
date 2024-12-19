import Link from 'next/link';
import React from 'react';
import menu_data from './menu-data';

const Menus = ({ currentRoute }) => {
  if (currentRoute === '/organization-dashboard') {
    return (
      <ul>
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('nav-sample-tab')?.click();
            }}
          >
            Researchers List
          </a>
        </li>
      </ul>
    );
  } else if (currentRoute === '/registrationadmin-dashboard') {
    return (
      <ul>
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('nav-collectionsite-tab')?.click();
            }}
          >
            Collection Sites List
          </a>
        </li>
      </ul>
    );
  } else if (currentRoute === '/registrationadmin-dashboard') {
    return (
      <ul>
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('nav-committemember-tab')?.click();
            }}
          >
            Committe Members List
          </a>
        </li>
      </ul>
    );
  } else if (currentRoute === '/user-dashboard') {
    return (
      <ul>
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('nav-sample-tab')?.click();
            }}
          >
            Samples List
          </a>
        </li>
      </ul>
    );
  }

  return (
    <ul>
      {menu_data.map((menu, i) => (
        <li key={i} className={`${menu.hasDropdown ? 'has-dropdown' : ''}`}>
          <Link href={`${menu.link}`}>
            {menu.title}
          </Link>
          {menu.hasDropdown && <ul className="submenu">
            {menu.submenus.map((sub, i) => (
              <li key={i}>
                <Link href={`${sub.link}`}>
                  {sub.title}
                </Link>
              </li>
            ))}
          </ul>}
        </li>
      ))}

    </ul>
  );
};

export default Menus;
