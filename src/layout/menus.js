import Link from 'next/link';
import React from 'react';
import menu_data from './menu-data';

const Menus = ({ currentRoute }) => {
  if (currentRoute === '/organization-dashboard') {
    return (
      <ul className="fs-7 small"> {/* Applied Bootstrap small font size */}
        <li>
          <a
            href="#"
            className="fs-7 small" 
            style={{ fontSize: '0.85rem' }} // Extra small font
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
  } else if (currentRoute === '/collectionsite-dashboard') {
    return (
      <ul className="fs-7 small">
        <li>
          <a
            href="#"
            className="fs-7 small"
            style={{ fontSize: '0.85rem' }}
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
  } else if (currentRoute === '/registrationadmin-dashboard') {
    return (
      <ul className="fs-7 small">
        <li>
          <a
            href="#"
            className="fs-7 small"
            style={{ fontSize: '0.85rem' }}
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
  } else if (currentRoute === '/user-dashboard') {
    return (
      <ul className="fs-7 small">
        <li>
          <a
            href="#"
            className="fs-7 small"
            style={{ fontSize: '0.85rem' }}
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
    <ul className="fs-7 small"> {/* Bootstrap font-size small */}
      {menu_data.map((menu, i) => (
        <li key={i} className={`${menu.hasDropdown ? 'has-dropdown' : ''}`}>
          <Link 
            href={`${menu.link}`} 
            className="fs-7 small" 
            style={{ fontSize: '0.85rem' }} // Small font size
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
                    style={{ fontSize: '0.85rem' }}
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
