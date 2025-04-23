import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import moment from "moment";
const CollectionsiteArea = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editCollectionsite, setEditCollectionsite] = useState(null); // State for selected collectionsite to edit

  const [selectedCollectionsiteId, setSelectedCollectionsiteId] =
    useState(null);
  const [allcollectionsites, setAllCollectionsites] = useState([]); // State to hold fetched collectionsites
  const [collectionsites, setCollectionsites] = useState([]); // State to hold fetched collectionsites
  const [formData, setFormData] = useState({
    CollectionSiteName: "",
    email: "",
    phoneNumber: "",
    // created_at: "",
    status: "",
    // logo: ""
  });

  const [filteredCollectionsite, setFilteredCollectionsite] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(collectionsites.length / itemsPerPage);

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
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  // Fetch collectionsites from backend when component loads
  useEffect(() => {
    fetchCollectionsites(); // Call the function when the component mounts
  }, []);
  const fetchCollectionsites = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/get`
      );
      setAllCollectionsites(response.data);
      setCollectionsites(response.data); // Store fetched collectionsites in state
    } catch (error) {
      console.error("Error fetching collectionsites:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/delete/${selectedCollectionsiteId}`
      );
      console.log(
        `Collectionsite with ID ${selectedCollectionsiteId} deleted successfully.`
      );

      // Set success message
      setSuccessMessage(response.data.message);

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
        `Error deleting collectionsite with ID ${selectedCollectionsiteId}:`,
        error
      );
    }
  };
  const handleEditClick = (collectionsite) => {
    setSelectedCollectionsiteId(collectionsite.id);
    setEditCollectionsite(collectionsite); // Store the collectionsite data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      CollectionSiteName: collectionsite.CollectionSiteName,
      email: collectionsite.email,
      phoneNumber: collectionsite.phoneNumber,
      // created_at: collectionsite.created_at,
      status: collectionsite.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/edit/${selectedCollectionsiteId}`,
        formData
      );
      console.log("Collectionsite updated successfully:", response.data);
      fetchCollectionsites();
      setShowEditModal(false);

      setSuccessMessage("Collectionsite updated successfully.");
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

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      setCollectionsites(allcollectionsites);
    } else {
      const filtered = allcollectionsites.filter((collectionsite) => {
        return collectionsite[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      setCollectionsites(filtered);
    }

    setCurrentPage(0); // Reset to first page when filtering
  };
  useEffect(() => {
    const updatedFilteredCollectionsite = collectionsites.filter(
      (collectionsite) => {
        if (!statusFilter) return true;
        return (
          collectionsite.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
    );

    setFilteredCollectionsite(updatedFilteredCollectionsite);
    setCurrentPage(0); // Reset to first page when filtering
  }, [collectionsites, statusFilter]);

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const currentData = filteredCollectionsite.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
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

  useEffect(() => {
    if (showDeleteModal || showEditModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showEditModal]);

  const resetFormData = () => {
    setFormData({
      CollectionSiteName: "",
      email: "",
      phoneNumber: "",
      // created_at: "",
      status: "",
    });
  };
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
    console.log("Formatted:", formatted); // debug output

    const [datePart, timePart] = formatted.split(", ");
    const [day, month, year] = datePart.split(" ");

    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year} `;
  };
  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="row justify-content-center">
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
            <h5 className="m-0 fw-bold ">Collection Site List</h5>
            {/* Status Filter */}
            <div className="d-flex flex-column flex-sm-row align-items-center gap-2 w-100">
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
                <option value="pending">pending</option>
                <option value="approved">approved</option>
              </select>
            </div>
          </div>

          {/* Table with responsive scroll */}
          <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    // { label: "ID", placeholder: "Search ID", field: "id" },
                    {
                      label: "Name",
                      placeholder: "Search Name",
                      field: "CollectionSiteName",
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
                    <th key={field} className="col-md-2 px-1">
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
                  <th className="col-md-1">Action</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((collectionsite) => (
                    <tr key={collectionsite.id}>
                      {/* <td>{collectionsite.id}</td> */}
                      <td>{collectionsite.CollectionSiteName}</td>
                      <td>{collectionsite.email}</td>
                      <td>{collectionsite.phoneNumber}</td>
                      <td>{formatDate(collectionsite.created_at)}</td>
                      <td>{collectionsite.status}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEditClick(collectionsite)}
                            title="Edit collectionsite"
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setSelectedCollectionsiteId(collectionsite.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Collectionsite" // This is the text that will appear on hover
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleShowHistory(
                                "collectionsite",
                                collectionsite.id
                              )
                            }
                            title="History"
                          >
                            <FontAwesomeIcon icon={faHistory} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Collectionsite Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredCollectionsite.length >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={Math.max(
                1,
                Math.ceil(filteredCollectionsite.length / itemsPerPage)
              )}
              focusPage={currentPage}
            />
          )}
          {/* Modal for Edit Collectionsite  */}
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
                      <h5 className="modal-title">Edit collectionsite</h5>
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
                      onSubmit={handleUpdate} // Conditionally use submit handler
                    >
                      <div className="modal-body">
                        {/* Form Fields */}
                        <div className="form-group">
                          <label>Collection Site name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="CollectionSiteName"
                            value={formData.CollectionSiteName}
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
                        {/* <div className="form-group">
                            <label>Registered_at</label>
                            <input
                              type="datetime-local"
                              className="form-control"
                              name="created_at"
                              value={formData.created_at ? formatDateTime(formData.created_at) : ''}
                              onChange={handleInputChange}
                              required
                            />
                          </div> */}
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
                          Update Collectionsite
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
                              const { created_name, updated_name,OrganizationName, added_by, created_at, updated_at } = log;

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
                                    <b>Organization:</b> {OrganizationName} was <b>added</b> by Database Admin at {moment(created_at).format("DD MMM YYYY, h:mm A")}
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
                                      <b>Organization:</b> {updated_name} was <b>updated</b> by Database Admin at {moment(updated_at).format("DD MMM YYYY, h:mm A")}
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
                      <p>Are you sure you want to delete this Researcher?</p>
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
        </div>
      </div>
    </section>
  );
};

export default CollectionsiteArea;
