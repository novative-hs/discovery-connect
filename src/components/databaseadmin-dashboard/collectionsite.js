import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import moment from "moment";
const CollectionSiteArea = () => {
  const [historyData, setHistoryData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollectionsiteId, setSelectedCollectionsiteId] =
    useState(null); // Store ID of Collection Sites to delete
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    CollectionSiteName: "",
    email: "",
    password: "",
    CollectionSiteType: "",
    phoneNumber: "",
    fullAddress: "",
    city: "",
    district: "",
    country: "",
    created_at: "",
    status: "",
  });

  const [editCollectionsite, setEditCollectionsite] = useState(null); // State for selected Collection Sites to edit
  const [collectionsites, setCollectionsites] = useState([]); // State to hold fetched Collection Sites
  const [successMessage, setSuccessMessage] = useState("");
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [formStep, setFormStep] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredCollectionsites, setFilteredCollectionsites] = useState([]); // Store filtered cities
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Calculate total pages
  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "CollectionSiteName" },
    { label: "Email", placeholder: "Search Email", field: "email" },
    { label: "Password", placeholder: "Search Password", field: "password" },
    { label: "CollectionSiteType", placeholder: "Search Collection Site Type", field: "CollectionSiteType" },
    { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },
    { label: "Address", placeholder: "Search Address", field: "fullAddress" },
    { label: "City", placeholder: "Search City", field: "city" },
    { label: "District", placeholder: "Search District", field: "district" },
    { label: "Country", placeholder: "Search Country", field: "country" },
    { label: "Created at", placeholder: "Search Date", field: "created_at" },
    { label: "Status", placeholder: "Search Status", field: "status" },
  ];

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch Collection Sites from backend when component loads
  useEffect(() => {
    fetchCollectionsites(); // Call the function when the component mounts
    fetchcityname();
    fetchdistrictname();
    fetchcountryname();
  }, []);

  const fetchCollectionsites = async () => {
    try {
      const response = await axios.get(`${url}/collectionsite/get`);
      setCollectionsites(response.data); // Store fetched Collection Sites in state
      setFilteredCollectionsites(response.data);
    } catch (error) {
      console.error("Error fetching Collection Sites:", error);
    }
  };
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredCollectionsites.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredCollectionsites]);

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

  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post(
        `${url}/collectionsite/post`,
        formData
      );

      // Refresh the collectionsite list after successful submission
      fetchCollectionsites();

      setSuccessMessage("Collection Site updated successfully.");
      resetFormData();
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Collection Site:", error);
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
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };
  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/collectionsite/delete/${selectedCollectionsiteId}`
      );

      // Set success message
      setSuccessMessage("Collectionsite deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the collectionsite list after deletion
      fetchCollectionsites();

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedCollectionsiteId(null);
    } catch (error) {
      console.error(
        `Error deleting Collection Site with ID ${selectedCollectionsiteId}:`,
        error
      );
    }
  };

  const handleEditClick = (collectionsite) => {
    setSelectedCollectionsiteId(collectionsite.id);
    setEditCollectionsite(collectionsite); // Store the Collection Sites data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      CollectionSiteName: collectionsite.CollectionSiteName,
      email: collectionsite.email,
      password: collectionsite.password,
      CollectionSiteType: collectionsite.CollectionSiteType,
      phoneNumber: collectionsite.phoneNumber,
      fullAddress: collectionsite.fullAddress,
      city: collectionsite.city,
      district: collectionsite.district,
      country: collectionsite.country,
      committetype: collectionsite.committetype,
      created_at: collectionsite.created_at,
      status: collectionsite.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/collectionsite/edit/${selectedCollectionsiteId}`,
        formData
      );


      fetchCollectionsites();
      setShowEditModal(false);
      setSuccessMessage("Collectionsite updated successfully.");

      setFormData({
        CollectionSiteName: "",
        email: "",
        password: "",
        CollectionSiteType: "",
        phoneNumber: "",
        fullAddress: "",
        city: "",
        district: "",
        country: "",
        created_at: "",
        status: "",
      });
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating collectionsite with ID ${selectedCollectionsiteId}:`,
        error
      );
    }
  };
  const formatDate = (date) => {
    const options = { year: "2-digit", month: "short", day: "2-digit" };
    const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
    const [day, month, year] = formattedDate.split(" ");

    // Capitalize the first letter of the month and keep the rest lowercase
    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year}`;
  };

  const resetFormData = () => {
    setFormData({
      CollectionSiteName: "",
      email: "",
      password: "",
      CollectionSiteType: "",
      phoneNumber: "",
      fullAddress: "",
      city: "",
      district: "",
      country: "",
      created_at: "",
      status: "",
    });
    setFormStep(1);
  };
  const handleStatusClick = async (collectionsiteId, option) => {
    try {
      const response = await axios.put(
        `${url}/collectionsite/status/edit/${collectionsiteId}`,
        { status: option }, // Only send the selected `status`
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage("Committe Member Status Updated successfully");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Update the collectionsites state to reflect the change
      setCollectionsites((prevMembers) =>
        prevMembers.map((member) =>
          member.id === collectionsiteId
            ? { ...member, status: option }
            : member
        )
      );
      // Hide the options after the update
      setStatusOptionsVisibility((prev) => ({
        ...prev,
        [collectionsiteId]: false,
      }));

      fetchCollectionsites();
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data?.error || error.message
      );
    }
  };

  const handleToggleStatusOptions = (collectionsiteId) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [collectionsiteId]: !prev[collectionsiteId],
    }));
  };

  const currentData = filteredCollectionsites.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  // Filter the Committe member list
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = collectionsites; // Show all if filter is empty
    } else {
      filtered = collectionsites.filter((collectionsite) =>
        // Use exact matching for 'status' field
        field === "status"
          ? collectionsite[field]?.toString().toLowerCase() === value.toLowerCase() // Match exactly
          : collectionsite[field]
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase()) // For other fields, use includes
      );
    }
    setFilteredCollectionsites(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };

  useEffect(() => {
    if (showDeleteModal || showAddModal || showEditModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showAddModal, showEditModal]);

  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">
          {/* {Button} */}
          <div className="d-flex flex-column w-100">
            {/* Success Message */}
            {successMessage && (
              <div
                className="alert alert-success w-100 text-start mb-2"
                role="alert"
              >
                {successMessage}
              </div>
            )}

            {/* Button Container */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              {/* Status Filter */}
              <div className="d-flex flex-column flex-sm-row align-items-center gap-2 w-auto">
                <label htmlFor="statusFilter" className="mb-2 mb-sm-0">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="form-control mb-2"
                  style={{ width: "auto" }}
                  onChange={(e) => handleFilterChange("status", e.target.value)} // Pass "status" as the field
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                {/* Add Collection Site Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: "#4a90e2", // soft blue
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <i className="fas fa-plus"></i> Add Collection Site
                </button>
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {columns.map(({ label, field, placeholder }) => (
                    <th key={label} className="px-4 py-2">
                      <input
                        type="text"
                        className="form-control  w-100"
                        placeholder={placeholder}
                        style={{ minWidth: "160px" }} // Ensures visibility and alignment
                        onChange={(e) =>
                          handleFilterChange(field, e.target.value)
                        }
                      />
                      <div className="fw-bold mt-1">{label}</div>{" "}
                      {/* Keeps label below input */}
                    </th>
                  ))}
                  <th className="col-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((collectionsite) => (
                    <tr key={collectionsite.id}>
                      {/* <td>{collectionsite.id}</td> */}
                      <td>{collectionsite.CollectionSiteName}</td>
                      <td>{collectionsite.email}</td>
                      <td>{collectionsite.password}</td>
                      <td>{collectionsite.CollectionSiteType}</td>
                      <td>{collectionsite.phoneNumber}</td>
                      <td>{collectionsite.fullAddress}</td>
                      <td>{collectionsite.city_name}</td>
                      <td>{collectionsite.district_name}</td>
                      <td>{collectionsite.country_name}</td>
                      <td>{formatDate(collectionsite.created_at)}</td>
                      <td>{collectionsite.status}</td>
                      <td>
                        <div className="d-flex justify-content-around gap-2">
                          <button
                            className="btn btn-success btn-sm py-0 px-1"
                            onClick={() => handleEditClick(collectionsite)}
                            title="Edit Collection Site"
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>

                          <div className="btn-group">
                            <button
                              className="btn btn-primary btn-sm py-0 px-1"
                              onClick={() =>
                                handleToggleStatusOptions(collectionsite.id)
                              }
                              title="Edit Status"
                            >
                              <FontAwesomeIcon
                                icon={faQuestionCircle}
                                size="xs"
                              />
                            </button>
                            {statusOptionsVisibility[collectionsite.id] && (
                              <div className="dropdown-menu show">
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(
                                      collectionsite.id,
                                      "Active"
                                    )
                                  }
                                >
                                  Active
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(
                                      collectionsite.id,
                                      "Inactive"
                                    )
                                  }
                                >
                                  Inactive
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            className="btn btn-danger btn-sm py-0 px-1"
                            onClick={() => {
                              setSelectedCollectionsiteId(collectionsite.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Collection Site"
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>

                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => {
                              handleShowHistory(
                                "collectionsite",
                                collectionsite.id
                              );
                            }}
                            title="Collection Site History"
                          >
                            <FontAwesomeIcon icon={faHistory} size="sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15" className="text-center">
                      No Collection Sites Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}

          <h6 class="text-danger small">Note: Handle 'Status' through Action Icons</h6>

          {/* Modal for Adding/Editing Collection sites */}
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
                        {showAddModal
                          ? "Add Collection Site"
                          : "Edit Collection Site"}
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

                    <form onSubmit={showAddModal ? handleSubmit : handleUpdate}>
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
                            name="CollectionSiteName"
                            value={formData.CollectionSiteName}
                            onChange={handleInputChange}
                            pattern="^[A-Za-z\s]+$"
                            title="Only letters and spaces are allowed."
                            required
                          />
                          {!/^[A-Za-z\s]*$/.test(
                            formData.CollectionSiteName
                          ) && (
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
                          <label>Collection Site Type</label>
                          <select
                            className="form-control"
                            name="CollectionSiteType"
                            value={formData.CollectionSiteType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">-- Select Collection Site Type --</option>
                            <option value="Hospital">Hospital</option>
                            <option value="Independent Lab">Independent Lab</option>
                            <option value="Blood Bank">Blood Bank</option>
                          </select>
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
                            placeholder="XXXX-XXXXXXX"
                            title="Phone number must be in the format e.g. 0332-4567890"
                          />
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
          {/* Modal for Deleting Collectionsites */}
          {showDeleteModal && (
            <>
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
                  top: "120px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Delete Collection Site</h5>

                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowDeleteModal(false)}
                        style={{
                          // background: 'none',
                          // border: 'none',
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
                    <div className="modal-body">
                      <p>
                        Are you sure you want to delete this collection site?
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-danger" onClick={handleDelete}>
                        Delete
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {showHistoryModal && (
            <>
              {/* Backdrop */}
              <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

              {/* Modal */}
              <div className="modal show d-block" role="dialog" style={{ zIndex: 1050, left: "50%", transform: "translateX(-50%)" }}>
                <div className="modal-dialog modal-md">
                  <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                      <h5 className="modal-title">History</h5>
                      <button type="button" className="close" onClick={() => setShowHistoryModal(false)} style={{ fontSize: "1.5rem", position: "absolute", right: "10px", cursor: "pointer" }}>
                        &times;
                      </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body" style={{ maxHeight: "500px", overflowY: "auto", backgroundColor: "#e5ddd5", padding: "15px", borderRadius: "10px" }}>
                      {historyData?.length ? historyData.map(({ CollectionSiteName, phoneNumber, fullAddress, city_name, district_name, country_name, created_at, updated_at, status }, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                          {/* History Message */}
                          <div style={{
                            padding: "10px 15px",
                            borderRadius: "15px",
                            backgroundColor: status === "added" ? "#ffffff" : "#dcf8c6",
                            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                            maxWidth: "75%",
                            fontSize: "14px",
                          }}>
                            <b>Collection Site:</b> {CollectionSiteName} was <b>{status}</b> by Database Admin at {moment(status === "added" ? created_at : updated_at).format("DD MMM YYYY, h:mm A")}
                            <br />
                            {phoneNumber && <><b>Phone:</b> {phoneNumber} <br /></>}
                            {fullAddress && <><b>Address:</b> {fullAddress}, {city_name}, {district_name}, {country_name} <br /></>}
                          </div>
                        </div>
                      )) : <p className="text-left">No history available.</p>}
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

export default CollectionSiteArea;
