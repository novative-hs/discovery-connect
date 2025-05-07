import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faHistory,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import {
  useRegisterUserMutation,
  useUpdateProfileMutation,
} from "src/redux/features/auth/authApi";
import moment from "moment";
import { notifyError, notifySuccess } from "@utils/toast";
const CSRArea = () => {
  const [registerUser, {}] = useRegisterUserMutation();
  const [updateUser, {}] = useUpdateProfileMutation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [editCSR, setEditCSR] = useState(null);
  const [selectedCSRId, setSelectedCSRId] = useState(null);
  const [allCSR, setAllCSR] = useState([]);
  const [CSR, setCSR] = useState([]);
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [filteredCSR, setFilteredCSR] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  const [formData, setFormData] = useState({
    CSRName: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    district: "",
    country: "",
    fullAddress: "",
    created_at: "",
    status: "",
  });

  useEffect(() => {
    fetchCSR();
    fetchcityname();
    fetchdistrictname();
    fetchcountryname();
  }, []);

  const fetchCSR = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/CSR/get`
      );
      setCSR(response.data);
      setAllCSR(response.data);
    } catch (error) {
      console.error("Error fetching CSR:", error);
    }
  };
  const fetchcityname = async () => {
    try {
      const response = await axios.get(`${url}/city/get-city`);
      setcityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(`${url}/district/get-district`);
      setdistrictname(response.data); // Store fetched District in state
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };
  const fetchcountryname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
      );
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      setCSR(allCSR);
    } else {
      const filtered = allCSR.filter((CSR) => {
        return CSR[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      setCSR(filtered);
    }

    setCurrentPage(0); // Reset to first page when filtering
  };

  useEffect(() => {
    const updatedFilteredCSR = CSR.filter((CSR) => {
      if (!statusFilter) return true;
      return CSR.status.toLowerCase() === statusFilter.toLowerCase();
    });

    setFilteredCSR(updatedFilteredCSR);
    setCurrentPage(0); // Reset to first page when filtering
  }, [CSR, statusFilter]);

  const currentData = filteredCSR.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected); // React Paginate uses 0-based index
  };
  const handleToggleStatusOptions = (id) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the visibility of the dropdown for the given id
    }));
  };

  const handleStatusClick = async (id, option) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/CSR/edit/${id}`,
         { status: option } ,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage("CSR status updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCSR(); // Refresh data after delete
      setStatusOptionsVisibility((prev) => ({
        ...prev,
        [id]: false,
      }));
    } catch (error) {
      console.error(`Error changing CSR status with ID ${selectedCSRId}:`, error);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();

    const newformData = new FormData();

    // Append form fields
    newformData.append("email", formData.email);
    newformData.append("password", formData.password);
    newformData.append("accountType", "CSR");
    newformData.append("CSRName", formData.CSRName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);
    newformData.append("status", "inactive");
    // Debug log to inspect FormData entries
    for (let pair of newformData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Call the mutation (assuming the function is available)
    registerUser(newformData)
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Register Failed";
          notifyError(errorMessage);
        } else {
          notifySuccess("Organization Registered Successfully");
          fetchCSR()
          setShowAddModal(false);
        }
      })
      .catch((error) => {
        notifyError(error?.message || "An unexpected error occurred");
      });

    // Reset state and form (if necessary)
    setShowAddModal(false);
    resetFormData();
  };

  const handleEditClick = (CSR) => {
    setSelectedCSRId(CSR.id);
    setEditCSR(CSR); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      user_account_id: CSR.user_account_id,
      CSRName: CSR.CSRName,
      email: CSR.useraccount_email,
      password: CSR.useraccount_password,
      phoneNumber: CSR.phoneNumber,
      city: CSR.cityid,
      country: CSR.countryid,
      district: CSR.districtid,
      fullAddress: CSR.fullAddress,
      status: CSR.status,
    });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const newformData = new FormData();
    newformData.append("useraccount_email", formData.email);
    newformData.append("useraccount_password", formData.password);
    newformData.append("accountType", "CSR");
    newformData.append("CSRName", formData.CSRName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);

    for (let pair of newformData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const id = formData.user_account_id;

    updateUser({ id, formData: newformData })
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Update Failed";
          notifyError(errorMessage);
        } else {
          notifySuccess("Update Organization Successfully");
          fetchCSR();
          setShowEditModal(false);
        }
      })
      .catch((error) => {
        notifyError(error?.message || "An unexpected error occurred");
      });

    setShowEditModal(false);
    resetFormData();
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
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const resetFormData = () => {
    setFormData({
      CSRName: "",
      email: "",
      password: "",
      phoneNumber: "",
      city: "",
      district: "",
      country: "",
      fullAddress: "",
      created_at: "",
      status: "",
    });
  };
  useEffect(() => {
    if (showAddModal || showDeleteModal || showEditModal || showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal, showDeleteModal, showEditModal, showHistoryModal]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Get all the dropdown elements
      const dropdowns = document.querySelectorAll(".dropdown-menu");

      dropdowns.forEach((dropdown) => {
        // Check if the dropdown and its closest button group are valid
        const buttonGroup = dropdown.closest(".btn-group");

        // If dropdown exists and the clicked target is outside the dropdown and button group
        if (
          dropdown &&
          buttonGroup &&
          !dropdown.contains(event.target) &&
          !buttonGroup.contains(event.target)
        ) {
          const dropdownId = dropdown.dataset.id;
          // Close dropdown if clicked outside
          setStatusOptionsVisibility((prev) => ({
            ...prev,
            [dropdownId]: false,
          }));
        }
      });
    };

    // Add the event listener for click events
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="d-flex flex-column w-100">
            {/* Button Container */}
            <div className="d-flex flex-column justify-content-start justify-content-sm-start align-items-center gap-2 text-center w-100">
              {/* Success Message */}
              {successMessage && (
                <div
                  className="alert alert-success w-100 text-start"
                  role="alert"
                >
                  {successMessage}
                </div>
              )}
              <h5 className="m-0 fw-bold ">CSR List</h5>
              {/* Status Filter */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 gap-2">
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="statusFilter" className="mb-0">
                    Status:
                  </label>
                  <select
                    id="statusFilter"
                    className="form-control"
                    style={{ width: "auto" }}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">InActive</option>
                    <option value="active">Active</option>
                  </select>
                </div>

                {/* Add Organization Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: "#4a90e2",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    margin: 10,
                  }}
                >
                  <i className="fas fa-plus"></i> Add CSR
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ overflowX: "auto" }}>
  <table className="table table-hover table-bordered text-center align-middle w-100">
    <thead className="table-primary text-dark">
      <tr>
        {[
          { label: "Name", placeholder: "Search Name", field: "CSRName" },
          { label: "Email", placeholder: "Search Email", field: "useraccount_email" },
          { label: "Password", placeholder: "Search Password", field: "useraccount_password" },
          { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },
          { label: "City", placeholder: "Search City", field: "city" },
          { label: "Country", placeholder: "Search Country", field: "country" },
          { label: "District", placeholder: "Search District", field: "district" },
          { label: "Full Address", placeholder: "Search Full Address", field: "fullAddress" },
          { label: "Status", placeholder: "Search Status", field: "status" },
        ].map(({ label, placeholder, field }) => (
          <th key={field} style={{ minWidth: "180px" }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder={placeholder}
              onChange={(e) => handleFilterChange(field, e.target.value)}
            />
            <div className="fw-bold mt-1">{label}</div>
          </th>
        ))}
        <th style={{ minWidth: "100px" }}>Action</th>
      </tr>
    </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((CSR) => (
                      <tr key={CSR.id}>
                        {/* <td>{researcher.id}</td> */}
                        <td>{CSR.CSRName}</td>
                        <td>{CSR.useraccount_email}</td>
                        <td>{CSR.useraccount_password}</td>
                        <td>{CSR.phoneNumber}</td>
                        <td>{CSR.city}</td>
                        <td>{CSR.country}</td>
                        <td>{CSR.district}</td>
                        <td>{CSR.fullAddress}</td>
                        <td>{CSR.status}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(CSR)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <div className="btn-group position-relative">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  handleToggleStatusOptions(CSR.id)
                                }
                                title="Edit Status"
                              >
                                <FontAwesomeIcon
                                  icon={faQuestionCircle}
                                  size="xs"
                                />
                              </button>

                              {statusOptionsVisibility[CSR.id] && (
                                <div
                                  className="dropdown-menu show position-absolute"
                                  data-id={CSR.id}
                                  style={{ zIndex: 1000 }}
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleStatusClick(CSR.id, "active")
                                    }
                                  >
                                    Active
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleStatusClick(CSR.id, "inactive")
                                    }
                                  >
                                    InActive
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => handleShowHistory("CSR", CSR.id)}
                              title="History"
                            >
                              <FontAwesomeIcon icon={faHistory} size="sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No CSR available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredCSR.length >= 0 && (
              <Pagination
                handlePageClick={handlePageChange}
                pageCount={Math.max(
                  1,
                  Math.ceil(filteredCSR.length / itemsPerPage)
                )}
                focusPage={currentPage}
              />
            )}
          </div>
          {/* Edit CSR Modal */}
          {(showAddModal || showEditModal) && (
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
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {showAddModal ? "Add CSR" : "Edit CSR"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          resetFormData();
                        }}
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

                    <form onSubmit={showAddModal ? onSubmit : handleUpdate}>
                      <div
                        className="modal-body"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Name"
                            name="CSRName"
                            value={formData.CSRName}
                            onChange={handleInputChange}
                            pattern="^[A-Za-z\s]+$"
                            title="Only letters and spaces are allowed."
                            required
                          />
                          {!/^[A-Za-z\s]*$/.test(formData.CSRName) && (
                            <small className="text-danger">
                              Only letters and spaces are allowed.
                            </small>
                          )}
                        </div>

                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Email"
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
                              placeholder="Enter Password"
                              value={formData.password}
                              onChange={handleInputChange}
                              pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"
                              title="Password must be at least 6 characters long and contain at least one letter, one number, and one special character."
                              required
                            />
                            <span
                              className="input-group-text"
                              style={{ cursor: "pointer" }}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i
                                className={
                                  showPassword
                                    ? "fa-regular fa-eye"
                                    : "fa-regular fa-eye-slash"
                                }
                              ></i>
                            </span>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            pattern="^\d{4}-\d{7}$"
                            placeholder="0123-4567890"
                            title="Phone number must be in the format 0123-4567890 and numeric"
                          />
                        </div>

                        <div className="form-group">
                          <label>City</label>
                          <select
                            className="form-control p-2"
                            name="city"
                            value={formData.city} // Store the selected city ID in formData
                            onChange={handleInputChange} // Handle change to update formData
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
                        <div className="form-group">
                          <label>District</label>
                          <select
                            className="form-control  p-2"
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
                        <div className="form-group">
                          <label>Country</label>
                          <select
                            className="form-control p-2"
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
                        <div className="form-group">
                          <label>Full Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="fullAddress"
                            placeholder="Enter Full Address"
                            value={formData.fullAddress}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          {showAddModal ? "Save" : "Update"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}
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
                          const { CSRName, status, created_at, updated_at } =
                            log;

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
                              {/* Message for City Addition */}
                             { (status === "active" || status === "added" )&&(
                                <div
                                  style={{
                                    padding: "10px 15px",
                                    borderRadius: "15px",
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                  }}
                                >
                                  <b>CSR:</b> {CSRName} was <b>{status}</b> by
                                  Database Admin at{" "}
                                  {moment(created_at).format(
                                    "DD MMM YYYY, h:mm A"
                                  )}
                                </div>
                              )}

                              {/* Message for City Update (Only if it exists) */}
                              {status === "updated"|| status==='inactive' && (
                                <div
                                  style={{
                                    padding: "10px 15px",
                                    borderRadius: "15px",
                                    backgroundColor: "#dcf8c6", // Light green for updates
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    marginTop: "5px", // Spacing between messages
                                  }}
                                >
                                  <b>CSR:</b> {CSRName} was <b>{status}</b> by
                                  Database Admin at{" "}
                                  {moment(updated_at).format(
                                    "DD MMM YYYY, h:mm A"
                                  )}
                                </div>
                              )}
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
          {/* Modal for Deleting Researchers */}
        </div>
      </div>
    </section>
  );
};

export default CSRArea;
