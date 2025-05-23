import React, { useState } from "react";
import CollectionSiteStaffArea from "./collectionsitestaff";
import CSRArea from "./CSR";
import CommitteeMemberArea from "./committe-members";

const StaffManagementPage = () => {
  const [activeSection, setActiveSection] = useState("collectionsite");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleFilterSelect = (section) => {
    setActiveSection(section);
    setShowDropdown(false);
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Manage Staff</h2>
        <div className="position-relative">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            Filter Options ▾
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
