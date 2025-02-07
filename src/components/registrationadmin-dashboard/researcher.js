import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const ResearcherArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const itemsPerPage = 10;

  const [recordsPerPage, setRecordsPerPage] = useState(5); // Default: 5 per page
  const [currentPage, setCurrentPage] = useState(1);
  const totalRecords = researchers.length; // Total records count
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Calculate pagination indices
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedData = researchers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const resetFormData = () => {
    setFormData({
      ResearcherName: "",
      email: "",
      phoneNumber: "",
      nameofOrganization: "",
      // created_at: "",
      status: "",
      // logo: ""
    });
  };
  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing records per page
  };
  // Fetch researchers from backend when component loads
  useEffect(() => {
    fetchResearchers(); // Call the function when the component mounts
  }, []);
  const fetchResearchers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/researcher/get"
      );
      setResearchers(response.data);
      setAllResearchers(response.data); // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
            const response = await axios.post('http://localhost:5000/api/researchers/post', formData);
            console.log("Researcher added successfully:", response.data);

            // Refresh the researcher list after successful submission
            const newResponse = await axios.get('http://localhost:5000/api/admin/researcher/get');
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
            await axios.delete(`http://localhost:5000/api/researchers/delete/${selectedResearcherId}`);
            console.log(`Researcher with ID ${selectedResearcherId} deleted successfully.`);

      // Set success message
      setSuccessMessage("Researcher deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

            // Refresh the researcher list after deletion
            const newResponse = await axios.get('http://localhost:5000/api/admin/researcher/get');
            setResearchers(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedResearcherId(null);
    } catch (error) {
      console.error(
        `Error deleting researcher with ID ${selectedResearcherId}:`,
        error
      );
    }
  };
  const sendApprovalEmail = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/user/send-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.ResearcherName,
            status: formData.status,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Email sent successfully:", data.message);
      } else {
        console.error("Error sending email:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
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
                `http://localhost:5000/api/admin/researchers/edit/${selectedResearcherId}`,
                formData
            );
            console.log("Researcher updated successfully:", response.data);

            const newResponse = await axios.get(
                "http://localhost:5000/api/admin/researcher/get"
            );
            setResearchers(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Researcher updated successfully.");
      sendApprovalEmail();
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

  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchResearchers();
    } else {
      const filtered = allresearchers.filter(
        (researcher) =>
          field === "status"
            ? researcher[field]
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase()) // Change to partial matching for status
            : researcher[field]
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase()) // Partial match for other fields
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
    <section className="policy__area pb-120 overflow-hidden">
      <div className="container-fluid mt-n5">
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-md-10">
            <div className="policy__wrapper policy__translate position-relative mt-5">
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

                {/* Status Filter */}
                <div className="d-flex flex-wrap align-items-center justify-content-between w-100 gap-2">
                  {/* Left-aligned Status Filter */}
                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor="statusFilter" className="mb-2 mb-sm-0">
                      Status:
                    </label>
                    <select
                      id="statusFilter"
                      className="form-control mb-2"
                      style={{ width: "auto" }}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                    >
                      <option value="">All</option>
                      <option value="pending">pending</option>
                      <option value="approved">approved</option>
                    </select>
                  </div>

                  {/* Right-aligned Show Filter */}
                  <div className="d-flex justify-content-end align-items-center">
                    <label className="mb-0 d-flex align-items-center">
                      Show:
                      <select
                        id="recordsPerPage"
                        className="form-select ms-2 w-auto"
                        value={recordsPerPage}
                        onChange={handleRecordsPerPageChange}
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value={totalRecords}>All</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* Table with responsive scroll */}
              <div className="table-responsive w-100 ">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark ">
                    <tr className="text-center">
                      {[
                        { label: "ID", placeholder: "Search ID", field: "id" },
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
                          label: "Status",
                          placeholder: "Search Status",
                          field: "status",
                        },
                      ].map(({ label, placeholder, field }) => (
                        <th key={field} className="px-4">
                          <input
                            type="text"
                            className="form-control w-100 px-4 py-1 mx-auto"
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
                    {paginatedData.length > 0 ? (
                      paginatedData.map((researcher) => (
                        <tr
                          key={researcher.id}
                          className={
                            researcher.status === "pending"
                              ? "table-warning"
                              : researcher.status === "unapproved"
                              ? "table-danger"
                              : researcher.status === "approved"
                              ? "table-success"
                              : ""
                          }
                        >
                          <td>{researcher.id}</td>
                          <td>{researcher.ResearcherName}</td>
                          <td>{researcher.email}</td>
                          <td>{researcher.phoneNumber}</td>
                          <td>{researcher.OrganizationName}</td>
                          <td>{researcher.status}</td>

                          <td>
                            <div className="d-flex justify-content-around gap-2">
                              <button
                                className="btn btn-success btn-sm py-0 px-1"
                                onClick={() => handleEditClick(researcher)}
                                title="Edit Researcher"
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </button>

                              <button
                                className="btn btn-danger btn-sm py-0 px-1"
                                onClick={() => {
                                  setSelectedResearcherId(researcher.id);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete Researcher"
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No Researcher Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-between w-100 gap-2">
              <p style={{ marginTop: "10px" }}>
                Showing {Math.min(indexOfLastRecord, totalRecords)} out of{" "}
                {totalRecords} entries
              </p>

              {/* Pagination Controls */}
              <ul className="pagination justify-content-end">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={() =>
                      currentPage > 1 && setCurrentPage(currentPage - 1)
                    }
                  >
                    &laquo;
                  </a>
                </li>
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    <a
                      className="page-link"
                      href="#"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </a>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <a
                    className="page-link"
                    href="#"
                    onClick={() =>
                      currentPage < totalPages &&
                      setCurrentPage(currentPage + 1)
                    }
                  >
                    &raquo;
                  </a>
                </li>
              </ul>
              </div>

              {/* <div>
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>
        <span> Page {currentPage} </span>
        <button 
          disabled={indexOfLastRecord >= totalRecords} 
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div> */}
              {/* Modal for Adding Committe members */}
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
                      top: "120px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="modal-dialog" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                            {showAddModal
                              ? "Add Researcher"
                              : "Edit Researcher"}
                          </h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => {
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

                        <form
                          onSubmit={showAddModal ? handleSubmit : handleUpdate} // Conditionally use submit handler
                        >
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
                              {showAddModal ? "Save" : "Update Reseracher"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal for Deleting Researchername */}
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
                        <div
                          className="modal-header"
                          style={{ backgroundColor: "transparent" }}
                        >
                          <h5 className="modal-title">Delete Researcher</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowDeleteModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <p>
                            Are you sure you want to delete this Researcher?
                          </p>
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
