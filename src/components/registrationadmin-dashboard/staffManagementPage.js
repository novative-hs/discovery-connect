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
    <div className="container-fluid">
      {/* ✅ Dropdown aligned to top-right corner */}
      <div className="d-flex justify-content-end mt-3 " style={{ marginRight: "12%" }} ref={dropdownRef}>
        <div className="position-relative">
          <button
            className="btn btn-primary"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            Select Role ▾
          </button>

          {showDropdown && (
            <div className="position-absolute mt-2 p-2 rounded shadow bg-white" style={{ zIndex: 10, right: 0, minWidth: "200px" }}>
              <button
                className={`dropdown-item py-2 ${activeSection === "collectionsite" ? "bg-primary text-white" : ""}`}
                onClick={() => handleFilterSelect("collectionsite")}
              >
                Collection Site's Staff
              </button>
              <button
                className={`dropdown-item py-2 ${activeSection === "committee" ? "bg-primary text-white" : ""}`}
                onClick={() => handleFilterSelect("committee")}
              >
                Committee Member
              </button>
              <button
                className={`dropdown-item py-2 ${activeSection === "csr" ? "bg-primary text-white" : ""}`}
                onClick={() => handleFilterSelect("csr")}
              >
                CSR
              </button>
            </div>

          )}
        </div>
      </div>

      {/* ✅ Role section below the dropdown */}
      <div>
        {activeSection === "collectionsite" && <CollectionSiteStaffArea />}
        {activeSection === "committee" && <CommitteeMemberArea />}
        {activeSection === "csr" && <CSRArea />}
      </div>
    </div>
  );
};

export default StaffManagementPage;
