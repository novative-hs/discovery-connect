import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import { userLoggedOut } from "src/redux/features/auth/authSlice";
import { Cart } from "@svg/index";
import axios from "axios";
import useCartInfo from "@hooks/use-cart-info";

const Header = ({ setActiveTab, activeTab }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const dropdownRef = useRef(null);
  const { sampleCount } = useCartInfo();

  const id = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;
  const committeetype = typeof window !== "undefined" ? sessionStorage.getItem("committeetype") : "";

  const [userType, setUserType] = useState(null);
  const [actions, setActions] = useState([]);
  const [userlogo, setUserLogo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openMenuIdx, setOpenMenuIdx] = useState(null);

  // Init user type and staff actions
  useEffect(() => {
    const type = sessionStorage.getItem("accountType")?.trim().toLowerCase();
    const action = sessionStorage.getItem("staffAction") || "";
    setActions(action.split(",").map(a => a.trim()).filter(Boolean));
    if (type) setUserType(type); else router.push("/login");
  }, [router]);

  // Fetch user only for logo
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/getAccountDetail/${id}`);
        const u = data?.[0];
        if (u?.logo?.data) {
          setUserLogo(`data:image/jpeg;base64,${Buffer.from(u.logo.data).toString("base64")}`);
        }
      } catch (e) {
        console.error("Header init error", e);
      }
    })();
  }, [id]);

  // Close menus on outside click
  useEffect(() => {
    const onDocClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setOpenMenuIdx(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const profileTabs = {
    researcher: "update-user",
    collectionsites: "update-collectionsite",
    biobank: "update-biobank",
    committeemember: "update-committeemember",
  };

  const handleUpdateProfile = () => {
    setShowDropdown(false);
    setActiveTab(profileTabs[userType] || "update-profile");
  };
  const handleChangePassword = () => {
    setShowDropdown(false);
    setActiveTab("change-password");
  };
  const handleLogout = () => {
    setShowDropdown(false);
    sessionStorage.removeItem("userID");
    dispatch(userLoggedOut());
    router.push("/");
  };

  const hasAny = (arr) => actions.some(a => arr.includes(a));
  const menuByType = {
    researcher: [
      { label: "Discover", tab: "Booksamples" },
      { label: "My Order Samples", tab: "my-samples" },
    ],
    registrationadmin: [
      { label: "Profile", tab: "order-info" },
      { label: "Cities", tab: "city" },
      { label: "Countries", tab: "country" },
      { label: "Districts", tab: "district" },
      { label: "Bank", tab: "bank" },
      { label: "Contact us List", tab: "contactus" },
      { label: "Researcher's List", tab: "researcher" },
      { label: "Organization's List", tab: "organization" },
      { label: "Collection Site's", tab: "collectionsite" },
      { label: "Staff Management", tab: "staffManagementPage" },
      {
        label: "Sample's Field",
        tab: "sample",
        dropdown: [
          { label: "Ethnicity", tab: "ethnicity" },
          { label: "Sample Condition", tab: "sample-condition" },
          { label: "Analyte", tab: "Analyte" },
          { label: "Infectious Disease Testing", tab: "infectiousdiseasetesting" },
          { label: "Sample Price Currency", tab: "sample-price-currency" },
          { label: "Storage Temperature", tab: "storage-temperature" },
          { label: "Container Type", tab: "container-type" },
          { label: "Volume Unit", tab: "volume-unit" },
          { label: "Sample Type Matrix", tab: "sample-type-matrix" },
          { label: "Test Method", tab: "test-method" },
          { label: "Test Result Unit", tab: "test-result-unit" },
          { label: "Concurrent Medical Conditions", tab: "concurrent-medical-conditions" },
          { label: "Test Kit Manufacturer", tab: "test-kit-manufacturer" },
          { label: "Test System", tab: "test-system" },
          { label: "Test System Manufacturer", tab: "test-system-manufacturer" },
        ],
      },
    ],
    collectionsitestaff: [
      ...(hasAny(["add_full", "add_basic", "edit", "dispatch", "history", "all"]) ? [{ label: "Sample List", tab: "samples" }] : []),
      ...(hasAny(["receive", "all"]) ? [{ label: "Sample Dispatch", tab: "sample-dispatch" }] : []),
      ...(hasAny(["return", "all"]) ? [{ label: "Sample Lost", tab: "sample-lost" }] : []),
    ],
    biobank: [
      { label: "Sample List", tab: "samples" },
      { label: "Sample Dispatch", tab: "sample-dispatch" },
      { label: "Pooled Sample List", tab: "pooledsample" },
      { label: "Quote Pending Request", tab: "pendingquoterequest" },
      { label: "Quarantine Stock", tab: "Quarantine-Stock" },
    ],
    committeemember: [
      { label: "Review Pending", tab: "samples" },
      { label: "Review Done", tab: "reviewdone" },
    ],
    technicaladmin: [
      { label: "Review Pending", tab: "order" },
      { label: "Review Done", tab: "orderrejected" },
    ],
    csr: [
      { label: "Profile", tab: "order-info" },
      { label: "Pending Order List", tab: "pendingorder" },
      { label: "Dispatched Order List", tab: "dispatchedorder" },
      { label: "Order Completed List", tab: "completedorder" },
      { label: "Collection Site", tab: "collectionsitelist" },
    ],
  };

  const menuItems = menuByType[userType] || [];
  const isActive = (tab) => tab === activeTab || (tab === "staffManagementPage" && activeTab?.startsWith("staffManagementPage:"));

  const welcomeText = {
    technicaladmin: "Welcome Technical Admin!",
    registrationadmin: "Welcome Registration Admin!",
    committeemember: `Welcome ${committeetype} Committee Member!`,
    biobank: "Welcome BioBank!",
  }[userType];

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Image src={logo} alt="Logo" width={170} height={75} />
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse w-100" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {menuItems.map(({ label, tab, dropdown }, index) => (
                <li
                  key={tab}
                  className="nav-item dropdown"
                  onMouseEnter={() => dropdown && setOpenMenuIdx(index)}
                  onMouseLeave={() => dropdown && setOpenMenuIdx(null)}
                >
                  <button
                    className={`nav-link btn btn-sm custom-nav-btn d-flex align-items-center ${isActive(tab) ? "text-primary" : "text-dark"} fs-7`}
                    onClick={() => !dropdown && setActiveTab(tab)}
                  >
                    <small>{label}</small>
                    {dropdown && (
                      <i className={`ms-2 fas ${openMenuIdx === index ? "fa-caret-up" : "fa-caret-down"} text-black`}></i>
                    )}
                  </button>

                  {dropdown && openMenuIdx === index && (
                    <ul className="dropdown-menu show p-1" style={{ minWidth: "120px", fontSize: "0.85rem" }}>
                      {dropdown.map(({ label, tab }) => (
                        <li key={tab}>
                          <button
                            className="dropdown-item fs-7 px-2 py-1"
                            style={{ transition: "background-color 0.3s ease, color 0.3s ease" }}
                            onMouseEnter={(e) => e.currentTarget.classList.add("bg-secondary", "text-white")}
                            onMouseLeave={(e) => e.currentTarget.classList.remove("bg-secondary", "text-white")}
                            onClick={() => { setActiveTab(tab); setOpenMenuIdx(null); }}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="d-flex align-items-center gap-2 ms-auto">
              {welcomeText && (
                <span className="text-primary fw-bold fs-6" style={{ fontFamily: "Montserrat", whiteSpace: "nowrap" }}>
                  {welcomeText}
                </span>
              )}

              <div className="d-flex align-items-center gap-0">
                <div className="dropdown me-3" ref={dropdownRef}>
                  <button
                    className="btn btn-sm dropdown-toggle d-flex align-items-center"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded={showDropdown}
                    onClick={() => setShowDropdown(v => !v)}
                  >
                    {userlogo ? (
                      <Image src={userlogo} alt="User Logo" width={35} height={35} className="rounded-circle border" />
                    ) : (
                      <i className="fa fa-user fs-6 text-dark"></i>
                    )}
                  </button>

                  <ul className={`dropdown-menu dropdown-menu-end ${showDropdown ? "show" : ""}`} style={{ right: 0, left: "auto", transform: "translateX(0)", minWidth: "160px", zIndex: 9999 }}>
                    {!["technicaladmin", "biobank", "csr", "registrationadmin", "collectionsitesstaff"].includes(userType) && (
                      <li><button className="dropdown-item fs-7" onClick={handleUpdateProfile}>Update Profile</button></li>
                    )}
                    <li><button className="dropdown-item fs-7" onClick={handleChangePassword}>Change Password</button></li>
                    <li><button className="dropdown-item fs-7" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>

                {userType === "researcher" && (
                  <Link
                    href={{ pathname: router.pathname, query: { ...router.query, tab: "Cart" } }}
                    className="btn btn-sm position-relative"
                  >
                    <Cart className="fs-7 text-white" />
                    {sampleCount > 0 && (
                      <span className="fs-6 badge bg-danger position-absolute top-0 start-100 translate-middle p-1">{sampleCount}</span>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
