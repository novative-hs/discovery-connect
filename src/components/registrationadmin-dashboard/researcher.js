import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faHistory,
  faShoppingCart,
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
    // created_at: "",
    status: "",
    // logo: ""
  });

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
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      setResearchers(allResearchers);
    } else {
      const filtered = allResearchers.filter((researcher) => {
        return researcher[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      setResearchers(filtered);
    }

    setCurrentPage(0); // Reset to first page when filtering
  };

  useEffect(() => {
    const updatedFilteredResearchers = researchers.filter((researcher) => {
      if (!statusFilter) return true;
      return researcher.status.toLowerCase() === statusFilter.toLowerCase();
    });

    setFilteredResearchers(updatedFilteredResearchers);
    setCurrentPage(0); // Reset to first page when filtering
  }, [researchers, statusFilter]);

  const currentData = filteredResearchers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected); // React Paginate uses 0-based index
  };
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researchers/delete/${selectedResearcherId}`
      );
      if (response.data && response.data.message) {
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3 seconds
      }

      fetchResearchers(); // Refresh data after delete
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
    setEditResearcher(researcher); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      ResearcherName: researcher.ResearcherName,
      email: researcher.email,
      phoneNumber: researcher.phoneNumber,
      OrganizationName: researcher.OrganizationName,
      // created_at: researcher.created_at,
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

      const newResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researcher/get`
      );
      setResearchers(newResponse.data);

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
              <h5 className="m-0 fw-bold ">Researcher List</h5>
              {/* Status Filter */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 gap-3 mb-3">
                {/* Filter Section (left-aligned) */}
                <div className="d-flex flex-column flex-sm-row align-items-center gap-2">
                  <label htmlFor="statusFilter" className="mb-2 mb-sm-0">
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
                    <option value="approved">Approved</option>
                  </select>
                </div>

                {/* Export Button (right-aligned) */}
                <div>
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
                          onChange={(e) =>
                            handleFilterChange(field, e.target.value)
                          }
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
                        {/* <td>{researcher.id}</td> */}
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
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                handleShowOrderHistory(researcher.id)
                              }
                              title="History"
                            >
                              <FontAwesomeIcon
                                icon={faShoppingCart}
                                size="sm"
                              />
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
        borderLeft: `6px solid ${
          status === "approved" ? "#28a745" : "#dc3545"
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
          {moment(updated_at).format("DD MMM YYYY, h:mm A")}
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
                        {/* Researcher Name Styling */}
                        <div className="mb-4 text-center">
                          <span className="h5 fw-bold text-primary">
                            Researcher:{" "}
                          </span>
                          <span className="h5 text-dark">
                            {orderhistoryData[0]?.researcher_name}
                          </span>
                        </div>

                        {/* Table with modern styling */}
                        <div className="table-responsive">
                          <table className="table table-hover table-striped align-middle">
                            <thead className="table-dark">
                              <tr>
                                <th>Analyte</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                                <th>Order Status</th>
                                <th>Technical Admin Status</th>
                                <th>Scientific CommitteeMember Status</th>
                                <th>Ethical CommitteeMember Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderhistoryData.map((order, index) => (
                                <tr key={index}>
                                  <td>{order.Analyte}</td>
                                  <td>{order.price}</td>
                                  <td>{order.quantity}</td>
                                  <td>{order.totalpayment}</td>
                                  <td>{order.order_status}</td>
                                  <td>{order.technicaladmin_status}</td>
                                  <td>{order.scientific_committee_status}</td>
                                  <td>{order.ethical_committee_status}</td>
                                </tr>
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
