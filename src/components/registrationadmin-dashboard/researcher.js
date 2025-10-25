import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faHistory,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import moment from "moment";
import * as XLSX from "xlsx";


const ResearcherArea = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [orderhistoryData, setOrderHistoryData] = useState([]);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [editResearcher, setEditResearcher] = useState(null);
  const [selectedResearcherId, setSelectedResearcherId] = useState(null);
  const [allResearchers, setAllResearchers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [filteredResearchers, setFilteredResearchers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    ResearcherName: "",
    email: "",
    phoneNumber: "",
    nameofOrganization: "",
    status: "",
  });

  // Replace individual filter states with this:
  const [searchFilters, setSearchFilters] = useState({
    ResearcherName: "",
    email: "",
    phoneNumber: "",
    OrganizationName: "",
    created_at: "",
    status: ""
  });

  const [expandedOrders, setExpandedOrders] = useState([]);

  const toggleExpand = (trackingId) => {
    if (expandedOrders.includes(trackingId)) {
      setExpandedOrders(expandedOrders.filter((id) => id !== trackingId));
    } else {
      setExpandedOrders([...expandedOrders, trackingId]);
    }
  };

  const researcherName = orderhistoryData[0]?.researcher_name || "---";


  // Individual filter states
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [createdAtFilter, setCreatedAtFilter] = useState("");
  const [statusSearchFilter, setStatusSearchFilter] = useState("");

  useEffect(() => {
    fetchResearchers();
  }, []);

  const fetchResearchers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researcher/get`
      );
      setResearchers(response.data);
      setAllResearchers(response.data);
      setFilteredResearchers(response.data);
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };

  // Apply all filters together
  // Updated useEffect for filtering
  useEffect(() => {
    let filtered = allResearchers;

    // Apply all search filters
    Object.entries(searchFilters).forEach(([field, value]) => {
      if (value.trim() !== "") {
        filtered = filtered.filter(researcher => {
          if (field === "created_at") {
            return formatDate(researcher[field])?.toLowerCase().includes(value.toLowerCase());
          }
          return researcher[field]?.toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply status dropdown filter
    if (statusFilter.trim() !== "") {
      filtered = filtered.filter(researcher =>
        researcher.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setResearchers(filtered);
    setFilteredResearchers(filtered);
    setCurrentPage(0);
  }, [allResearchers, searchFilters, statusFilter]);


  const handleIndividualFilter = (field, value) => {
    switch (field) {
      case "ResearcherName":
        setNameFilter(value);
        break;
      case "email":
        setEmailFilter(value);
        break;
      case "phoneNumber":
        setContactFilter(value);
        break;
      case "OrganizationName":
        setOrganizationFilter(value);
        break;
      case "created_at":
        setCreatedAtFilter(value);
        break;
      case "status":
        setStatusSearchFilter(value);
        break;
      default:
        break;
    }
  };

  // Utility function
  const groupByOrder = (data) => {
    return data.reduce((acc, item) => {
      // unique key banado combination ka
      const key = `${item.order_id}_${item.tracking_id}`;

      if (!acc[key]) {
        acc[key] = {
          order_id: item.order_id,
          tracking_id: item.tracking_id,
          researcher_name: item.researcher_name,
          order_status: item.order_status,
          technicaladmin_status: item.technicaladmin_status,
          scientific_committee_status: item.scientific_committee_status,
          ethical_committee_status: item.ethical_committee_status,
          subtotal: item.subtotal,
          tax_value: item.tax_value,
          tax_type: item.tax_type,
          platform_value: item.platform_value,
          platform_type: item.platform_type,
          freight_value: item.freight_value,
          freight_type: item.freight_type,
          totalpayment: item.totalpayment,
          SamplePriceCurrency: item.SamplePriceCurrency,
          items: [],
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {});
  };



  // Updated filter handler
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const currentData = filteredResearchers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researchers/delete/${selectedResearcherId}`
      );
      if (response.data && response.data.message) {
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(""), 3000);
      }

      fetchResearchers();
      setShowDeleteModal(false);
      setSelectedResearcherId(null);
    } catch (error) {
      console.error(
        `Error deleting researcher with ID ${selectedResearcherId}:`,
        error
      );
    }
  };

  const handleEditClick = (researcher) => {
    setSelectedResearcherId(researcher.id);
    setEditResearcher(researcher);
    setShowEditModal(true);
    setFormData({
      ResearcherName: researcher.ResearcherName,
      email: researcher.email,
      phoneNumber: researcher.phoneNumber,
      OrganizationName: researcher.OrganizationName,
      status: researcher.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researchers/edit/${selectedResearcherId}`,
        formData
      );

      const updatedResearchers = researchers.map(researcher =>
        researcher.id === selectedResearcherId
          ? { ...researcher, ...formData }
          : researcher
      );

      setResearchers(updatedResearchers);
      setAllResearchers(updatedResearchers);

      setShowEditModal(false);
      setSuccessMessage("Researcher updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating researcher with ID ${selectedResearcherId}:`,
        error
      );
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
  const fetchOrderHistory = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researcher/orderhistory/${id}`
      );
      const data = await response.json();
      setOrderHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };
  const handleShowOrderHistory = (id) => {
    fetchOrderHistory(id);
    setShowOrderHistoryModal(true);
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    if (showDeleteModal || showEditModal || showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showEditModal, showHistoryModal]);
  const formatDate = (date) => {
    const options = {
      year: "2-digit",
      month: "short",
      day: "2-digit",
      // hour: "2-digit",
      // minute: "2-digit",
      // hour12: true,
      // timeZone: "Asia/Karachi", // optional: ensures correct timezone if needed
    };

    const formatted = new Date(date).toLocaleString("en-GB", options);

    const [datePart, timePart] = formatted.split(", ");
    const [day, month, year] = datePart.split(" ");

    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year}`;
  };
  const handleExportToExcel = () => {

    const dataToExport = filteredResearchers.map((item) => ({
      email: item.email ?? "",
      password: item.password ?? "",
      ResearcherName: item.ResearcherName ?? "",
      OrganizationName: item.OrganizationName ?? "",
      phoneNumber: item.phoneNumber ?? "",
      city: item.cityname ?? "",
      country: item.countryname ?? "",
      district: item.districtname ?? "",
      fullAddress: item.fullAddress ?? "",
      status: item.status ?? "",
      "Created At": item.created_at ? formatDate(item.created_at) : "",
      "Updated At": item.updated_at ? formatDate(item.updated_at) : "",
    }));

    // Ensure headers are preserved even if data is empty or some columns are all null
    const headers = [
      "email",
      "password",
      "ResearcherName",
      "OrganizationName",
      "phoneNumber",
      "city",
      "country",
      "district",
      "fullAddress",
      "status",
      "Created At",
      "Updated At",
    ];

    if (dataToExport.length === 0) {
      dataToExport.push(Object.fromEntries(headers.map((key) => [key, ""])));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
      header: headers,
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Researcher");

    XLSX.writeFile(workbook, "Researcher_List.xlsx");
  };
  const groupedOrders = groupByOrder(orderhistoryData);
  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="d-flex flex-column w-100">
            {/* Button Container */}
           <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success w-100 text-start" role="alert">
                  {successMessage}
                </div>
              )}
              <h5 className="m-0 fw-bold ">Researcher List</h5>
              {/* Status Filter */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 gap-3 mb-3">
                {/* Filter Section (left-aligned) */}
                   <div className="d-flex flex-wrap gap-3 align-items-center">
                  <label htmlFor="statusFilter" className="mb-2 mb-sm-0">
                    Status:
                  </label>

                  <select
                    id="statusFilter"
                    className="form-control"
                    style={{ width: "auto" }}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    value={statusFilter}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                {/* Export Button (right-aligned) */}
              
                  <button
                    onClick={handleExportToExcel}
                    style={{
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontWeight: "500",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <i className="fas fa-file-excel"></i> Export to Excel
                  </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive w-100">
              <table className="table table-hover table-bordered text-center align-middle w-auto border">
                <thead className="table-primary text-dark">
                  <tr className="text-center">
                    {[
                      {
                        label: "Name",
                        placeholder: "Search Name",
                        field: "ResearcherName",
                      },
                      {
                        label: "Email",
                        placeholder: "Search Email",
                        field: "email",
                      },
                      {
                        label: "Contact",
                        placeholder: "Search Contact",
                        field: "phoneNumber",
                      },
                      {
                        label: "Organization",
                        placeholder: "Search Organization",
                        field: "OrganizationName",
                      },
                      {
                        label: "Created at",
                        placeholder: "Search Created at",
                        field: "created_at",
                      },
                      {
                        label: "Status",
                        placeholder: "Search Status",
                        field: "status",
                      },
                    ].map(({ label, placeholder, field }) => (
                      <th key={field} style={{ minWidth: "170px" }}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder={placeholder}
                          onChange={(e) => handleFilterChange(field, e.target.value)}
                          value={searchFilters[field]}
                        />
                        <div className="fw-bold mt-1">{label}</div>
                      </th>
                    ))}
                    <th style={{ minWidth: "120px" }}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((researcher) => (
                      <tr key={researcher.id}>
                        <td>{researcher.ResearcherName}</td>
                        <td>{researcher.email}</td>
                        <td>{researcher.phoneNumber}</td>
                        <td>{researcher.OrganizationName}</td>
                        <td>{formatDate(researcher.created_at)}</td>
                        <td>{researcher.status}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(researcher)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedResearcherId(researcher.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() =>
                                handleShowHistory("researcher", researcher.id)
                              }
                              title="History"
                            >
                              <FontAwesomeIcon icon={faHistory} size="sm" />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                backgroundColor: "#6f42c1",
                                color: "#fff",
                                border: "none"
                              }}
                              onClick={() =>
                                handleShowOrderHistory(researcher.id)
                              }
                              title="History"
                            >
                              <FontAwesomeIcon icon={faReceipt} size="sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No researchers available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredResearchers.length >= 0 && (
              <Pagination
                handlePageClick={handlePageChange}
                pageCount={Math.max(
                  1,
                  Math.ceil(filteredResearchers.length / itemsPerPage)
                )}
                focusPage={currentPage}
              />
            )}
          </div>

          {/* Edit Researcher Modal */}
          {showEditModal && (
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
                      <h5 className="modal-title">Edit Researcher</h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowEditModal(false)}
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
                    <form onSubmit={handleUpdate}>
                      <div className="modal-body">
                        {/* Form Fields */}
                        <div className="form-group">
                          <label>Researcher name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="ResearcherName"
                            value={formData.ResearcherName}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="text"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label>Name Of Organization</label>
                          <input
                            type="text"
                            className="form-control"
                            name="OrganizationName"
                            value={formData.OrganizationName}
                            onChange={handleInputChange}
                            disabled
                          />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            className="form-control"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            {/* <option value="unapproved">unapproved</option> */}
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          Update Researcher
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
                          const {
                            email,
                            password,
                            ResearcherName,
                            nameofOrganization,
                            phoneNumber,
                            city_name,
                            country_name,
                            district_name,
                            fullAddress,
                            status,
                            created_at,
                            updated_at
                          } = log;

                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                marginBottom: "16px",
                              }}
                            >
                              {/* For 'added' or 'updated' statuses — show researcher detail */}
                              {(status === "added" || status === "updated") && (
                                <div
                                  style={{
                                    backgroundColor: status === "updated" ? "#dcf8c6" : "#ffffff",
                                    border: "1px solid #ccc",
                                    borderRadius: "18px",
                                    padding: "16px",
                                    maxWidth: "85%",
                                    boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    fontFamily: "Segoe UI, sans-serif",
                                  }}
                                >
                                  <div style={{ marginBottom: "8px", fontWeight: "bold", color: "#555" }}>
                                    Researcher status: {status === "added" ? "added" : "updated"}
                                  </div>
                                  <div><b>Name:</b> {ResearcherName}</div>
                                  <div><b>Email:</b> {email}</div>
                                  <div><b>Phone:</b> {phoneNumber}</div>
                                  <div><b>Organization:</b> {nameofOrganization}</div>
                                  <div><b>Country:</b> {country_name}</div>
                                  <div><b>District:</b> {district_name}</div>
                                  <div><b>City:</b> {city_name}</div>
                                  <div><b>Address:</b> {fullAddress}</div>

                                  {/* Conditionally show created_at or updated_at */}
                                  {status === "added" && created_at && (
                                    <div>
                                      <b>Created At:</b> {moment(created_at).format("DD MMM YYYY, h:mm A")}
                                    </div>
                                  )}

                                  {status === "updated" && updated_at && (
                                    <div>
                                      <b>Updated At:</b> {moment(updated_at).format("DD MMM YYYY, h:mm A")}
                                    </div>
                                  )}
                                </div>
                              )}


                              {/* For 'approved' or 'unapproved' — status only */}
                              {(status === "approved" || status === "unapproved") && (
                                <div
                                  style={{
                                    backgroundColor: status === "approved" ? "#e6f4ea" : "#fdecea",
                                    borderLeft: `6px solid ${status === "approved" ? "#28a745" : "#dc3545"
                                      }`,
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    maxWidth: "70%",
                                    fontSize: "14px",
                                    color: "#333",
                                    fontFamily: "Segoe UI, sans-serif",
                                  }}
                                >
                                  Researcher was <b>{status}</b> at
                                  {updated_at && (
                                    <div>
                                      {moment(updated_at).format("DD MMM YYYY, h:mm A")} by <b>Registration Admin</b>
                                    </div>
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
          {showDeleteModal && (
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
                  top: "120px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Delete Researcher</h5>
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
                      <p>Are you sure you want to delete this researcher?</p>
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

          {showOrderHistoryModal && (
            <div className="modal show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content shadow-lg border-0">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Order History</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowOrderHistoryModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    {orderhistoryData.length === 0 ? (
                      <div className="alert alert-info text-center py-4">
                        No order history found.
                      </div>
                    ) : (
                      <>
                        {/* Researcher Name */}
                        <div className="mb-4 text-center">
                          <span className="h5 fw-bold text-primary">Researcher: </span>
                          <span className="h5 text-dark">{researcherName}</span>
                        </div>

                        {/* Orders Table */}
                        <div className="table-responsive">
                          <table className="table table-hover table-striped align-middle">
                            <thead className="table-dark">
                              <tr>
                                <th>Tracking ID</th>
                                <th>Order Status</th>
                                <th>Technical Admin</th>
                                <th>Scientific Committee</th>
                                <th>Ethical Committee</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(groupedOrders).map(([orderId, order], index) => (
                                <React.Fragment key={orderId}>
                                  {/* Parent Row */}
                                  <tr>
                                    <td>{order.tracking_id || "---"}</td>
                                    <td>{order.order_status || "---"}</td>
                                    <td>{order.technicaladmin_status || "---"}</td>
                                    <td>{order.scientific_committee_status || "---"}</td>
                                    <td>{order.ethical_committee_status || "---"}</td>
                                    <td>
                                      <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => toggleExpand(index)}
                                      >
                                        {expandedOrders.includes(index) ? "Hide" : "View Order"}
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Expanded Details */}
                                  {expandedOrders.includes(index) && (
                                    <tr>
                                      <td colSpan="6">
                                        <div className="p-3 bg-light border rounded">
                                          <h6 className="fw-bold mb-3">Order Details</h6>

                                          <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                              <tr>
                                                <th>Analyte</th>
                                                <th>Gender</th>
                                                <th>Quantity X Volume</th>
                                                <th>Test Result & Unit</th>
                                                <th className="text-end">
                                                  Price ({order.SamplePriceCurrency})
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {order.items.map((item, i) => (
                                                <tr key={i}>
                                                  <td>{item.Analyte}</td>
                                                  <td>
                                                    {item.age || item.gender ? (
                                                      <>
                                                        {item.age && `${item.age} years`}
                                                        {item.age && item.gender && " | "}
                                                        {item.gender}
                                                      </>
                                                    ) : (
                                                      "---"
                                                    )}
                                                  </td>
                                                  <td>{`${item.quantity} X ${item.Volume}${item.VolumeUnit}`}</td>
                                                  <td>
                                                    {item.TestResult}
                                                    {item.TestResultUnit}
                                                  </td>
                                                  <td className="text-end">
                                                    {item.price?.toLocaleString()}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>

                                            {/* Summary Rows */}
                                            <tfoot>
                                              <tr>
                                                <th colSpan="4" className="text-end">Subtotal</th>
                                                <th className="text-end">
                                                  {Number(order.subtotal).toLocaleString()}
                                                </th>
                                              </tr>
                                              <tr>
                                                <th colSpan="4" className="text-end">
                                                  Tax ({order.tax_value}
                                                  {order.tax_type === "percent" ? "%" : ""})
                                                </th>
                                                <th className="text-end">
                                                  {order.tax_type === "percent"
                                                    ? (
                                                      (order.subtotal * order.tax_value) / 100
                                                    ).toLocaleString("en-PK", {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    })
                                                    : Number(order.tax_value || 0).toLocaleString("en-PK", {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    })}
                                                </th>
                                              </tr>
                                              <tr>
                                                <th colSpan="4" className="text-end">
                                                  Platform Charges ({order.platform_value}
                                                  {order.platform_type === "percent" ? "%" : ""})
                                                </th>
                                                <th className="text-end">
                                                  {order.platform_type === "percent"
                                                    ? (
                                                      (order.subtotal * order.platform_value) / 100
                                                    ).toLocaleString("en-PK", {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    })
                                                    : Number(order.platform_value || 0).toLocaleString(
                                                      "en-PK",
                                                      {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    )}
                                                </th>
                                              </tr>
                                              <tr>
                                                <th colSpan="4" className="text-end">
                                                  Freight Charges ({order.freight_value}
                                                  {order.freight_type === "percent" ? "%" : ""})
                                                </th>
                                                <th className="text-end">
                                                  {order.freight_type === "percent"
                                                    ? (
                                                      (order.subtotal * order.freight_value) / 100
                                                    ).toLocaleString("en-PK", {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    })
                                                    : Number(order.freight_value || 0).toLocaleString(
                                                      "en-PK",
                                                      {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                      }
                                                    )}
                                                </th>
                                              </tr>
                                              <tr className="table-success fw-bold">
                                                <th colSpan="4" className="text-end">Total</th>
                                                <th className="text-end">
                                                  {order.totalpayment
                                                    ? order.totalpayment.toLocaleString("en-PK", {
                                                      minimumFractionDigits: 2,
                                                      maximumFractionDigits: 2,
                                                    })
                                                    : ""}
                                                </th>
                                              </tr>
                                            </tfoot>
                                          </table>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResearcherArea;
