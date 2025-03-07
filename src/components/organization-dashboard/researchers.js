
import React, { useState, useEffect } from "react";
import axios from "axios";
import { notifyError } from "@utils/toast";
import Pagination from "@ui/Pagination";
const ResearcherArea = () => {
  const id = localStorage.getItem("userID");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const [selectedResearcherStatus, setSelectedResearcherStatus] =
    useState(null);
  const [selectedResearcherId, setSelectedResearcherId] = useState(null); // Store ID of researcher to delete
  const [formData, setFormData] = useState({
    user_account_id: "",
    useraccount_email: "",
    userID: "",
    ResearcherName: "",
    phoneNumber: "",
    nameofOrganization: "",
    fullAddress: "",
    city: "",
    district: "",
    country: "",
    email: "",
    password: "",
    accountType: "Researcher",
    logo: "",
    added_by: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [editResearcher, setEditResearcher] = useState(null); // State for selected researcher to edit
  const [researchers, setResearchers] = useState([]); // State to hold fetched researchers
  const [successMessage, setSuccessMessage] = useState("");
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [organization, setOrganization] = useState();
  const [filteredResearchername, setFilteredResearchername] = useState([]); // Store filtered cities
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [orgid, setorgId] = useState();
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [logoFile, setLogoFile] = useState(null);

  // Fetch researchers from backend when component loads
  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>; // Or redirect to login
    } else {
      fetchcityname();
      fetchdistrictname();
      fetchcountryname();
      fetchOrganization();
      console.log("account_id on city page is:", id);
    }
  }, []);

  const fetchResearcher = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researcher/get/${orgid}`
      );
      console.log(response.data.length);
      setFilteredResearchername(response.data);
      setResearchers(response.data); // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };
  const fetchOrganization = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get/${id}`
      );
      setOrganization(response.data[0]);
      setorgId(response.data[0].id); // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };

  const fetchcityname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/get-city`
      );
      setcityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/district/get-district`
      );
      setdistrictname(response.data); // Store fetched District in state
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };
  const fetchcountryname = async () => {
    fetchOrganization();
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
      );
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };
  useEffect(() => {
    if (orgid !== null) {
      fetchResearcher(); // Fetch researchers only after `orgId` is set
    }
  }, [orgid]); // Runs when `orgId` changes
  const resetFormData = () => {
    setFormData({
      userID: "",
      useraccount_email: "",
      ResearcherName: "",
      phoneNumber: "",
      nameofOrganization: "",
      fullAddress: "",
      city: "",
      district: "",
      country: "",
      email: "",
      password: "",
      accountType: "Researcher",
      logo: "",
      user_account_id: "",
    });
    setCurrentStep(1);
    setPreview(null);
  };
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      setPreview(URL.createObjectURL(file)); // Generate preview URL
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    setCurrentStep(1);
    e.preventDefault();

    // Create a new FormData instance
    const formDataToSubmit = new FormData();

    // Append all fields to the FormData instance
    formDataToSubmit.append("userID", formData.userID);
    formDataToSubmit.append("ResearcherName", formData.ResearcherName);
    formDataToSubmit.append("phoneNumber", formData.phoneNumber);
    formDataToSubmit.append("nameofOrganization", organization.id); // Use organization ID
    formDataToSubmit.append("fullAddress", formData.fullAddress);
    formDataToSubmit.append("city", formData.city);
    formDataToSubmit.append("district", formData.district);
    formDataToSubmit.append("country", formData.country);
    formDataToSubmit.append("email", formData.email);
    formDataToSubmit.append("password", formData.password);
    formDataToSubmit.append("accountType", "Researcher");
    formDataToSubmit.append("added_by", organization.user_account_id); // Use organization ID
    // Append the logo file
    if (logoFile) {
      formDataToSubmit.append("logo", logoFile);
    }

    console.log("FormData to submit:", formDataToSubmit);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/signup`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Success handling
      fetchResearcher();
      resetFormData();

      setSuccessMessage("Researcher added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      // console.error("Error adding researcher:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong! Please try again.";

      // Display error in notification
      notifyError(errorMessage);
    } finally {
      setShowAddModal(false);
      resetFormData();
    }
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`
      );
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Call this function when opening the modal
  const handleShowHistory = (filterType, id) => {
    console.log(id);
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  const handleEditClick = (researcher) => {
    setSelectedResearcherId(researcher.user_account_id);
    setEditResearcher(researcher); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      user_account_id: researcher.user_account_id,
      useraccount_email: researcher.email,
      userID: id,
      ResearcherName: researcher.ResearcherName,
      phoneNumber: researcher.phoneNumber,
      nameofOrganization: researcher.nameofOrganization,
      fullAddress: researcher.fullAddress,
      logo: researcher.logo,
      city: researcher.city,
      district: researcher.district,
      country: researcher.country,
      email: researcher.email,
      password: researcher.password,
      accountType: "Researcher",
      added_by: researcher.added_by,
    });
    setPreview(
      researcher.logo && researcher.logo.data
        ? `data:image/jpeg;base64,${Buffer.from(researcher.logo.data).toString(
          "base64"
        )}`
        : null
    );
    if (researcher.logo && researcher.logo.data) {
      const blob = new Blob([new Uint8Array(researcher.logo.data)], {
        type: "image/jpeg",
      });
      const file = new File([blob], "logo.jpg", { type: "image/jpeg" });
      setLogoFile(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const newformData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      newformData.append(key, value);
    });

    if (logoFile) {
      newformData.append("logo", logoFile); // Correctly append file
    }
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/updateProfile/${selectedResearcherId}`,
        newformData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchResearcher();
      setShowEditModal(false);
      setSuccessMessage("Researcher updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      console.log("Researcher updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating researcher:", error);
    }
  };
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredResearchername.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredResearchername]);

  // Get the current data for the table
  const currentData = filteredResearchername.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = researchers; // Show all if filter is empty
    } else {
      filtered = researchers.filter((city) =>
        city[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredResearchername(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };

  useEffect(() => {
    if (showAddModal || showEditModal || showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal, showEditModal, showHistoryModal]);

  const formatDate = (date) => {
    const options = { year: "2-digit", month: "short", day: "2-digit" };
    const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
    const [day, month, year] = formattedDate.split(" ");

    // Capitalize the first letter of the month and keep the rest lowercase
    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year}`;
  };

   return (
      <section className="policy__area pb-40 overflow-hidden p-3">
        <div className="container">
          <div className="row justify-content-center">
            <h4 className="tp-8 fw-bold text-primary text-start pb-2">
              <i className="fa fa-users me-2"></i> Researcher List
            </h4>
  
            {/* Success Message */}
            {successMessage && (
              <div className="alert alert-success w-100 text-start mb-2 small">
                {successMessage}
              </div>
            )}
  
            {/* Button */}
            <div className="d-flex justify-content-end align-items-center gap-2 w-100">
              {/* Add Researcher Button */}
              <button
                className="tp-btn-8 mb-3 px-4 py-2 rounded shadow-sm fw-semibold btn-primary text-white"
                onClick={() => setShowAddModal(true)}
              >
                <span>+ Add Researcher</span>
              </button>
            </div>
  
            {/* Table */}
            <div className="table-responsive w-100">
              <table className="table table-hover text-center align-middle w-auto border">
                <thead className="table-primary text-dark">
                  <tr className="text-center">
                    {[
                      { label: "ID", field: "id", minWidth: "80px" },
                      {
                        label: "Name",
                        field: "ResearcherName",
                        minWidth: "150px",
                      },
                      { label: "Email", field: "email", minWidth: "170px" },
                      {
                        label: "Phone",
                        field: "phoneNumber",
                        minWidth: "130px",
                      },
                      {
                        label: "Organization",
                        field: "organization_name",
                        minWidth: "150px",
                      },
                      {
                        label: "City",
                        field: "city_name",
                        minWidth: "120px",
                      },
                      {
                        label: "Country",
                        field: "country_name",
                        minWidth: "120px",
                      },
                      {
                        label: "District",
                        field: "district_name",
                        minWidth: "120px",
                      },
                      {
                        label: "Address",
                        field: "fullAddress",
                        minWidth: "200px",
                      },
                      {
                        label: "Created At",
                        field: "created_at",
                        minWidth: "140px",
                      },
                      {
                        label: "Updated At",
                        field: "updated_at",
                        minWidth: "140px",
                      },
                      { label: "Status", field: "status", minWidth: "100px" },
                    ].map(({ label, field, minWidth }, index) => (
                      <th key={index} className="p-2" style={{ minWidth }}>
                        <div className="d-flex flex-column align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                            placeholder={label}
                            onChange={(e) =>
                              handleFilterChange(field, e.target.value)
                            }
                            style={{ minWidth: "100px" }}
                          />
                          <span className="fw-bold mt-1">{label}</span>
                        </div>
                      </th>
                    ))}
                    <th className="p-2 text-center" style={{ minWidth: "120px" }}>
                      Action
                    </th>
                  </tr>
                </thead>
  
                <tbody className="table-light">
                  {currentData.length > 0 ? (
                    currentData.map((researcher) => (
                      <tr key={researcher.id} className="text-center">
                        <td>{researcher.id}</td>
                        <td>{researcher.ResearcherName}</td>
                        <td>{researcher.email}</td>
                        <td>{researcher.phoneNumber}</td>
                        <td>{researcher.organization_name}</td>
                        <td>{researcher.city_name}</td>
                        <td>{researcher.country_name}</td>
                        <td>{researcher.district_name}</td>
                        <td>{researcher.fullAddress}</td>
                        <td>{formatDate(researcher.created_at)}</td>
                        <td>{formatDate(researcher.updated_at)}</td>
                        <td>
                          <span className="d-flex align-items-center justify-content-center">
                            <span
                              className="rounded-circle d-inline-block me-2"
                              style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor:
                                  researcher.status === "Draft"
                                    ? "#6c757d" // Gray
                                    : researcher.status === "approved"
                                    ? "#28a745" // Green
                                    : "#dc3545", // Red
                              }}
                              title={researcher.status}
                            ></span>
                            {researcher.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            {/* Edit Button */}
                            <button
                              className="btn btn-outline-info btn-sm rounded-circle"
                              onClick={() => handleEditClick(researcher)}
                              title="Edit"
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#28a745")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              style={{
                                transition: "0.3s ease",
                                color: "black",
                                borderColor: "#28a745",
                              }}
                            >
                              <i className="fa fa-edit"></i>
                            </button>
  
                            {/* History Button */}
                            <button
                              className="btn btn-outline-success btn-sm rounded-circle"
                              onClick={() =>
                                handleShowHistory("researcher", researcher.id)
                              }
                              title="History"
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#ADD8E6")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "transparent")
                              }
                              style={{
                                transition: "0.3s ease",
                                color: "black",
                                borderColor: "#007bff",
                              }}
                            >
                              <i className="fa fa-history"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" className="text-center p-2">
                        No researchers available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
  
            {/* Pagination Controls */}
            {totalPages >= 0 && (
              <Pagination
                handlePageClick={handlePageChange}
                pageCount={totalPages}
                focusPage={currentPage}
              />
            )}
  
            {/* Modal for Adding Researchers */}
            {(showAddModal || showEditModal) && (
              <>
                {/* Bootstrap Backdrop */}
                <div className="modal-backdrop fade show"></div>
  
                {/* Modal Content */}
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div
                    className="modal-dialog modal-md modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="fw-bold modal-title text-primary">
                          {showAddModal ? "Add Researcher" : "Edit Researcher"}
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => {
                            setShowAddModal(false);
                            setShowEditModal(false);
                            resetFormData();
                          }}
                        ></button>
                      </div>
  
                      {/* Form */}
                      <form onSubmit={showAddModal ? handleSubmit : handleUpdate}>
                        <div
                          className="modal-body overflow-auto text-start"
                          style={{ maxHeight: "65vh" }}
                        >
                          {/* Image Preview Section */}
                          <div className="text-center mb-3">
                            {preview ? (
                              <img
                                src={preview}
                                alt="Preview"
                                className="rounded-circle border"
                                width="60"
                                height="60"
                              />
                            ) : (
                              <span
                                className="d-inline-block rounded-circle bg-light text-muted text-center fs-4 border"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  lineHeight: "60px",
                                }}
                              >
                                <i className="fa-solid fa-user"></i>
                              </span>
                            )}
                          </div>
  
                          {/* File Upload */}
                          <div className="mb-2">
                            <label className="form-label">Profile Picture</label>
                            <input
                              type="file"
                              className="form-control form-control-sm"
                              name="logo"
                              onChange={handleInputChange}
                              accept="image/*"
                              required={showAddModal}
                            />
                          </div>
  
                          {/* Form Fields */}
                          <div className="row g-2">
                            <div className="col-md-12">
                              <label className="form-label">Name</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                name="ResearcherName"
                                value={formData.ResearcherName}
                                onChange={handleInputChange}
                                pattern="^[A-Za-z\s]+$"
                                title="Only letters and spaces are allowed."
                                required
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Email</label>
                              <input
                                type="email"
                                className="form-control form-control-sm"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Password</label>
                              <div className="input-group input-group-sm">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  className="form-control"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  required
                                  pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?':{}|<>])[A-Za-z\d!@#$%^&*(),.?':{}|<>]{6,}$"
                                  title="Password must be at least 6 characters long and contain at least one letter, one number, and one special character."
                                />
  
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  <i
                                    className={
                                      showPassword
                                        ? "fa-regular fa-eye"
                                        : "fa-regular fa-eye-slash"
                                    }
                                  ></i>
                                </button>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Account Type</label>
                              <input
                                type="text"
                                className="form-control form-control-sm bg-light"
                                name="accountType"
                                value={formData.accountType}
                                readOnly
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Organization</label>
                              <input
                                type="text"
                                className="form-control form-control-sm bg-light"
                                name="nameofOrganization"
                                value={organization.OrganizationName}
                                readOnly
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label">Phone Number</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                                pattern="^\d{4}-\d{7}$"
                                title="Format: 0304-5861729"
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Full Address</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                name="fullAddress"
                                value={formData.fullAddress}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">City</label>
                              <select
                                className="form-select form-select-sm p-2"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="" disabled>
                                  Select City
                                </option>
                                {cityname.map((city) => (
                                  <option key={city.id} value={city.id}>
                                    {city.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">District</label>
                              <select
                                className="form-select form-select-sm p-2"
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="" disabled>
                                  Select District
                                </option>
                                {districtname.map((district) => (
                                  <option key={district.id} value={district.id}>
                                    {district.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label">Country</label>
                              <select
                                className="form-select form-select-sm p-2"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="" disabled>
                                  Select Country
                                </option>
                                {countryname.map((country) => (
                                  <option key={country.id} value={country.id}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
  
                        {/* Modal Footer */}
                        <div className="modal-footer py-2">
                          <button type="submit" className="tp-btn-8 px-3 py-2">
                            {showAddModal ? "Save" : "Update"}
                          </button>
                          <button
                            type="button"
                            className="tp-btn-8 bg-secondary text-white px-3 py-2"
                            onClick={() => {
                              setShowAddModal(false);
                              setShowEditModal(false);
                              resetFormData();
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </>
            )}
  
            {/* Modal for Deleting Researchers */}
            {showHistoryModal && (
              <>
                {/* Bootstrap Backdrop with Blur */}
                <div
                  className="modal-backdrop fade show"
                  style={{ backdropFilter: "blur(5px)" }}
                ></div>
  
                {/* Modal Content */}
                <div
                  className="modal show d-block"
                  tabIndex="-1"
                  role="dialog"
                  style={{
                    zIndex: 1050,
                    position: "fixed",
                    top: "100px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="modal-dialog modal-md" role="document">
                    <div className="modal-content">
                      {/* Modal Header */}
                      <div className="modal-header">
                        <h5 className="modal-title">History</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowHistoryModal(false)}
                          style={{
                            fontSize: "1.5rem",
                            position: "absolute",
                            right: "10px",
                            top: "10px",
                            cursor: "pointer",
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
  
                      {/* Chat-style Modal Body */}
                      <div
                        className="modal-body"
                        style={{
                          maxHeight: "500px",
                          overflowY: "auto",
                          backgroundColor: "#e5ddd5", // WhatsApp-style background
                          padding: "15px",
                          borderRadius: "10px",
                        }}
                      >
                        {historyData && historyData.length > 0 ? (
                          historyData.map((log, index) => {
                            const hiddenFields = [
                              "logo",
                              "ntnNumber",
                              "type",
                              "city",
                              "country",
                              "district",
                              "OrganizationName",
                              "nameofOrganization",
                              "CollectionSiteName",
                              "HECPMDCRegistrationNo",
                              "organization_id",
                              "collectionsite_id",
                            ]; // Add fields you want to hide
  
                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  marginBottom: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    padding: "10px 15px",
                                    borderRadius: "15px",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    width: "100%",
                                  }}
                                >
                                  {Object.entries(log).map(([key, value]) =>
                                    !hiddenFields.includes(key) ? ( // Only show fields that are NOT in hiddenFields array
                                      <div key={key}>
                                        <b>{key.replace(/_/g, " ")}:</b> {value}
                                      </div>
                                    ) : null
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-left">No history available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
};

export default ResearcherArea;

