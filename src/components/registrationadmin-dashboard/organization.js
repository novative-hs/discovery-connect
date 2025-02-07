import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";

const OrganizationArea = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState(null); // Store ID of organization to delete
    const [formData, setFormData] = useState({
        OrganizationName: "",
        email: "",
        phoneNumber: "",
        // created_at: "",
        status: "",
        // logo: ""
    });
    const [allorganizations, setAllOrganizations] = useState([]); // State to hold fetched organizations
    const [editOrganization, setEditOrganization] = useState(null); // State for selected organization to edit
    const [organizations, setOrganizations] = useState([]); // State to hold fetched organizations
    const [successMessage, setSuccessMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter


    // Fetch organizations from backend when component loads
    useEffect(() => {
     

        fetchOrganizations(); // Call the function when the component mounts
    }, []);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    // Calculate total pages
    const totalPages = Math.ceil(organizations.length / itemsPerPage);
    const fetchOrganizations = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/admin/organization/get"
          );
          setAllOrganizations(response.data);
          setOrganizations(response.data); // Store fetched organizations in state
        } catch (error) {
          console.error("Error fetching organizations:", error);
        }
      };
    
      const currentData = organizations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );
    
      const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
      };
    
      // Filter the researchers list
      const handleFilterChange = (field, value) => {
        if (value === "") {
          fetchOrganizations();
        } else {
          // Perform exact match for "status" field
          const filtered = allorganizations.filter((organization) =>
            field === "status"
              ? organization[field]?.toString().toLowerCase() === value.toLowerCase()
              : organization[field]
                  ?.toString()
                  .toLowerCase()
                  .includes(value.toLowerCase())
          );
          setOrganizations(filtered);
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
            const response = await axios.post('http://localhost:5000/api/organizations/post', formData);
            console.log("Organization added successfully:", response.data);

            // Refresh the organization list after successful submission
            const newResponse = await axios.get('http://localhost:5000/api/admin/organization/get');
            setOrganizations(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        OrganizationName: "",
        email: "",
        phoneNumber: "",
        // created_at: "",
        status: "",
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding organization:", error);
    }
  };

    const handleDelete = async () => {
        try {
            // Send delete request to backend
            await axios.delete(`http://localhost:5000/api/admin/organization/delete/${selectedOrganizationId}`);
            console.log(`Organization with ID ${selectedOrganizationId} deleted successfully.`);

      // Set success message
      setSuccessMessage("Organization deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

            // Refresh the organization list after deletion
            const newResponse = await axios.get('http://localhost:5000/api/admin/organization/get');
            setOrganizations(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedOrganizationId(null);
    } catch (error) {
      console.error(
        `Error deleting organization with ID ${selectedOrganizationId}:`,
        error
      );
    }
  };
  const handleEditClick = (organization) => {
    setSelectedOrganizationId(organization.id);
    setEditOrganization(organization); // Store the organization data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      OrganizationName: organization.OrganizationName,
      email: organization.email,
      phoneNumber: organization.phoneNumber,
      // created_at: organization.created_at,
      status: organization.status,
    });
  };
  const sendApprovalEmail = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.OrganizationName,
          status:formData.status
        }),
      });
  
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
  const handleUpdate = async (e) => {
    e.preventDefault();

        try {
            const response = await axios.put(
                `http://localhost:5000/api/admin/organization/edit/${selectedOrganizationId}`,
                formData
            );
            console.log("Organization updated successfully:", response.data);

            const newResponse = await axios.get(
                "http://localhost:5000/api/admin/organization/get"
            );
            setOrganizations(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Organization updated successfully.");
      sendApprovalEmail();
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating organization with ID ${selectedOrganizationId}:`,
        error
      );
    }
  };

  const resetFormData = () => {
    setFormData({
      OrganizationName: "",
      email: "",
      phoneNumber: "",
      // created_at: "",
      status: "",
    });
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


              {/* Table with responsive scroll */}
              <div className="table-responsive w-100">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr className="text-center">
                      {[
                        { label: "ID", placeholder: "Search ID", field: "id" },
                        {
                          label: "Name",
                          placeholder: "Search Name",
                          field: "OrganizationName",
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
                        <th key={field} className="px-3">
                          <input
                            type="text"
                            className="form-control w-100 px-2 py-1 mx-auto"
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
                      currentData.map((organization) => (
                        <tr key={organization.id}>
                          <td>{organization.id}</td>
                          <td>{organization.OrganizationName}</td>
                          <td>{organization.email}</td>
                          <td>{organization.phoneNumber}</td>
                          {/* <td>{organization.created_at}</td> */}
                          <td>{organization.status}</td>
                          <td>
                            <div className="d-flex justify-content-around gap-2">
                              <button
                                className="btn btn-success btn-sm py-0 px-1"
                                onClick={() => handleEditClick(organization)}
                                title="Edit organization"
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </button>

                              <button
                                className="btn btn-danger btn-sm py-0 px-1"
                                onClick={() => {
                                  setSelectedOrganizationId(organization.id);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete organization" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No organization Available
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
                              ? "Add organization"
                              : "Edit organization"}
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
                              <label>Organization name</label>
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

export default OrganizationArea;
