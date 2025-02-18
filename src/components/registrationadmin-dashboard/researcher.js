import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faHistory } from '@fortawesome/free-solid-svg-icons';

const ResearcherArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedResearcherId, setSelectedResearcherId] = useState(null); // Store ID of researcher to delete
  const [allresearchers, setAllResearchers] = useState([]); // State to hold fetched researchers
  const [formData, setFormData] = useState({
    ResearcherName: "",
    email: "",
    phoneNumber: "",
    nameofOrganization: "",
    // created_at: "",
    status: "",
    // logo: ""
  });
  const [editResearcher, setEditResearcher] = useState(null); // State for selected researcher to edit
  const [researchers, setResearchers] = useState([]); // State to hold fetched researchers
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(researchers.length / itemsPerPage);
  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`);
      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Call this function when opening the modal
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  // Fetch researchers from backend when component loads
  useEffect(() => {

    fetchResearchers(); // Call the function when the component mounts
  }, []);
  const fetchResearchers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researcher/get`
      );
      setResearchers(response.data);
      setAllResearchers(response.data) // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // const formatDateTime = (dateTime) => {
  //   const date = new Date(dateTime);
  //   const formattedDate = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
  //   return formattedDate;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researchers/post`, formData);
      console.log("Researcher added successfully:", response.data);

      // Refresh the researcher list after successful submission
      const newResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researcher/get`);
      setResearchers(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        ResearcherName: "",
        email: "",
        phoneNumber: "",
        nameofOrganization: "",
        // created_at: "",
        status: "",

      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding researcher:", error);
    }
  };


  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researchers/delete/${selectedResearcherId}`);
      console.log(`Researcher with ID ${selectedResearcherId} deleted successfully.`);

      // Set success message
      setSuccessMessage('Researcher deleted successfully.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Refresh the researcher list after deletion
      const newResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/researcher/get`);
      setResearchers(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedResearcherId(null);
    } catch (error) {
      console.error(`Error deleting researcher with ID ${selectedResearcherId}:`, error);
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
      console.log("Researcher updated successfully:", response.data);

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
      console.error(`Error updating researcher with ID ${selectedResearcherId}:`, error);
    }
  };

  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchResearchers();
    } else {
      // Perform exact match for "status" field
      const filtered = allresearchers.filter((researcher) =>
        field === "status"
          ? researcher[field]?.toString().toLowerCase() === value.toLowerCase()
          : researcher[field]
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase())
      );
      setResearchers(filtered);
    }
  };
  // Filter samples based on the selected status
  const filteredResearchers = researchers.filter((researcher) => {
    if (!statusFilter) return true;
    return researcher.status === statusFilter;
  });

  const currentData = filteredResearchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    if (showDeleteModal || showAddModal || showEditModal || showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showAddModal, showEditModal, showHistoryModal]);

  return (
    <section className="policy__area pb-120">
      <div
        className="container"
        style={{ marginTop: "-20px", width: "auto", }}
      >
        <div
          className="row justify-content-center"
          style={{ marginTop: "290px" }}
        ><div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: "-20px", width: "120%", marginLeft: "-80px" }}>
                <div className="d-flex align-items-center">
                  <label htmlFor="statusFilter" className="mr-2" style={{ marginLeft: "60px", marginRight: "10px", fontSize: "16px", fontWeight: "bold" }}>Status:</label>
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
                    {/* <option value="unapproved">unapproved</option> */}
                  </select>
                </div>

              </div>

              {/* Table */}
              <div
                className="table-responsive"
                style={{
                  margin: "0 auto", // Center-align the table horizontally
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ID"
                          onChange={(e) =>
                            handleFilterChange("id", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        ID
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Name"
                          onChange={(e) =>
                            handleFilterChange("ResearcherName", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Name
                      </th>
                      <th>

                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Email"
                          onChange={(e) =>
                            handleFilterChange("email", e.target.value)
                          }
                        />
                        Email
                      </th>

                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Phone Number"
                          onChange={(e) =>
                            handleFilterChange("phoneNumber", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Contact
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Organization"
                          onChange={(e) =>
                            handleFilterChange(
                              "nameofOrganization",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Organization
                      </th>
                      {/* <th>Registered_at</th> */}
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search status"
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Status
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((researcher) => (
                        <tr key={researcher.id}>
                          <td>{researcher.id}</td>
                          <td>{researcher.ResearcherName}</td>
                          <td>{researcher.email}</td>
                          <td>{researcher.phoneNumber}</td>
                          <td>{researcher.OrganizationName}</td>
                          <td>{researcher.status}</td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                                gap: "5px",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditClick(researcher)}
                                title="Edit Researcher" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faEdit} size="sm" />
                              </button>{" "}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedResearcherId(researcher.id);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete Researcher"
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </button>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handleShowHistory("researcher", researcher.id)}
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
                        <td colSpan="8" className="text-center">
                          No researchers available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
             {/* Pagination Controls */}
             <div className="pagination d-flex justify-content-end align-items-center mt-3">
                <nav aria-label="Page navigation example">
                  <ul className="pagination justify-content-end">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Previous"
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                      >
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">Previous</span>
                      </a>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                        >
                          <a
                            className="page-link"
                            href="#"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </a>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Next"
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                      >
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
              {/* Modal for Adding Researchers */}
              {/* {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Researcher</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowAddModal(false)}
                          style={{
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body"> */}
              {/* Form Fields */}
              {/* <div className="form-group">
                            <label>Researcher Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="ResearcherName"
                              value={formData.ResearcherName}
                              onChange={handleInputChange}
                              required
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
                              required
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
                              required
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Edit Researcher Modal */}
              {showEditModal && (
                <>
                  {/* Bootstrap Backdrop with Blur */}
                  <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

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
                          <h5 className="modal-title">Edit Researcher</h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => setShowEditModal(false)}
                            style={{
                              // background: 'none',
                              // border: 'none',
                              fontSize: '1.5rem',
                              position: 'absolute',
                              right: '10px',
                              top: '10px',
                              cursor: 'pointer'
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
                  <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

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
                              const { created_name, updated_name, added_by, created_at, updated_at } = log;

                              return (
                                <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "10px" }}>
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
                                    <b>City:</b> {created_name} was <b>added</b> by Registration Admin at {moment(created_at).format("DD MMM YYYY, h:mm A")}
                                  </div>

                                  {/* Message for City Update (Only if it exists) */}
                                  {updated_name && updated_at && (
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
                                      <b>City:</b> {updated_name} was <b>updated</b> by Registration Admin at {moment(updated_at).format("DD MMM YYYY, h:mm A")}
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
                  <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

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
        </div>
      </div>
    </section>
  );
};

export default ResearcherArea;
