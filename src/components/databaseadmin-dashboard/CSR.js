import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import moment from "moment";
const CSRArea = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const[historyData,setHistoryData]=useState([])
  const [editCSR, setEditCSR] = useState(null);
  const [selectedCSRId, setSelectedCSRId] = useState(null);
  const [allCSR, setAllCSR] = useState([]);
  const [CSR, setCSR] = useState([]);
  const [filteredCSR, setFilteredCSR] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    CSRName: "",
    email: "",
    phoneNumber: "",
    // created_at: "",
    status: "",
    // logo: ""
  });

  useEffect(() => {
    fetchCSR();
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
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/CSR/delete/${selectedCSRId}`
      );
      setSuccessMessage("CSR deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCSR(); // Refresh data after delete
      setShowDeleteModal(false);
      setSelectedCSRId(null);
    } catch (error) {
      console.error(
        `Error deleting CSR with ID ${selectedCSRId}:`,
        error
      );
    }
  };

  const handleEditClick = (CSR) => {
    setSelectedCSRId(CSR.id);
    setEditCSR(CSR); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      CSRName: CSR.CSRName,
      email: CSR.email,
      phoneNumber: CSR.phoneNumber,
      
      status: CSR.status,
    });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/CSR/edit/${selectedCSRId}`,
        formData
      );
      console.log("CSR updated successfully:", response.data);

      fetchCSR()

      setShowEditModal(false);
      setSuccessMessage("CSR updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating CSR with ID ${selectedCSRId}:`,
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
                <div className="d-flex flex-column flex-sm-row align-items-center gap-2 w-100">
                  <label htmlFor="statusFilter" className="mb-2 mb-sm-0">
                    Status:
                  </label>

                  <select
                    id="statusFilter"
                    className="form-control mb-2"
                    style={{ width: "auto" }}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    } // Pass "status" as the field
                  >
                    <option value="">All</option>
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                      {[
                        //{ label: "ID", placeholder: "Search ID", field: "id" },
                        {
                          label: "Name",
                          placeholder: "Search Name",
                          field: "CSRName",
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
                          label: "Status",
                          placeholder: "Search Status",
                          field: "status",
                        },
                      ].map(({ label, placeholder, field }) => (
                        <th key={field} className="col-md-1 px-2">
                         
                         <input
                        type="text"
                        className="form-control w-100 mx-auto"
                        placeholder={placeholder}
                        onChange={(e) =>
                          handleFilterChange(field, e.target.value)
                        }
                      />
                            {label}
                        </th>
                      ))}
                      <th className="col-1">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((CSR) => (
                        <tr key={CSR.id}>
                          {/* <td>{researcher.id}</td> */}
                          <td>{CSR.CSRName}</td>
                          <td>{CSR.email}</td>
                          <td>{CSR.phoneNumber}</td>
                          <td>{CSR.status}</td>
                          <td>
                          <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditClick(CSR)}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedCSRId(CSR.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() =>
                                  handleShowHistory("CSR", CSR.id)
                                }
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
    pageCount={Math.max(1, Math.ceil(filteredCSR.length / itemsPerPage))}
    focusPage={currentPage}
  />
)}
            </div>
            {/* Edit CSR Modal */}
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
                        <h5 className="modal-title">Edit CSR</h5>
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
                            <label>CSR name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="CSRName"
                              value={formData.CSRName}
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
                            Update CSR
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
                              created_name,
                              updated_name,
                              added_by,
                              created_at,
                              updated_at,
                            } = log;

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
                                  <b>CSR:</b> {created_name} was{" "}
                                  <b>added</b> by Registration Admin at{" "}
                                  {moment(created_at).format(
                                    "DD MMM YYYY, h:mm A"
                                  )}
                                </div>

                                {/* Message for City Update (Only if it exists) */}
                                {updated_name && updated_at && (
                                  <div
                                    style={{
                                      padding: "10px 15px",
                                      borderRadius: "15px",
                                      backgroundColor: "#dcf8c6", // Light green for updates
                                      boxShadow:
                                        "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                      maxWidth: "75%",
                                      fontSize: "14px",
                                      textAlign: "left",
                                      marginTop: "5px", // Spacing between messages
                                    }}
                                  >
                                    <b>CSR:</b> {updated_name} was{" "}
                                    <b>updated</b> by Registration Admin at{" "}
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
                        <h5 className="modal-title">Delete CSR</h5>
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
                        <p>Are you sure you want to delete this CSR?</p>
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-danger"
                          onClick={handleDelete}
                        >
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
          
        </div>
      </div>
    </section>
  );
};

export default CSRArea;
