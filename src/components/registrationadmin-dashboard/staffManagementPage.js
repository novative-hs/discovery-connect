import React, { useState, useRef, useEffect } from "react";
import CollectionSiteStaffArea from "./collectionsitestaff";
import CSRArea from "./CSR";
import CommitteeMemberArea from "./committe-members";

const StaffManagementPage = ({ defaultSection = "collectionsite" }) => {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleFilterSelect = (section) => {
    setActiveSection(section);
    setShowDropdown(false);
  };

  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-end align-items-end mb-2">
        <div className="position-relative" ref={dropdownRef}>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            Filter by Role ▾
          </button>
          {showDropdown && (
            <div
              className="position-absolute mt-2 p-2 rounded shadow bg-white"
              style={{ zIndex: 10, right: 0, minWidth: "200px" }}
            >
              <button
                className="dropdown-item py-2"
                onClick={() => handleFilterSelect("collectionsite")}
              >
                🧪 Add Collectionsite Staff
              </button>
              <button
                className="dropdown-item py-2"
                onClick={() => handleFilterSelect("committee")}
              >
                ➕ Add Committee Member
              </button>
              <button
                className="dropdown-item py-2"
                onClick={() => handleFilterSelect("csr")}
              >
                🛠️ Add CSR
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-light rounded shadow">
        {activeSection === "collectionsite" && <CollectionSiteStaffArea />}
        {activeSection === "committee" && <CommitteeMemberArea />}
        {activeSection === "csr" && <CSRArea />}
      </div>
    </div>
  );
};

export default StaffManagementPage;
