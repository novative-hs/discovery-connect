import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory } from "@fortawesome/free-solid-svg-icons";

const CollectionsiteArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollectionsiteId, setSelectedCollectionsiteId] = useState(null); // Store ID of collectionsite to delete
  const [formData, setFormData] = useState({
    CollectionSiteName: "",
    email: "",
    phoneNumber: "",
    // created_at: "",
    status: "",
    // logo: ""
  });
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editCollectionsite, setEditCollectionsite] = useState(null); // State for selected collectionsite to edit
  const [collectionsites, setCollectionsites] = useState([]); // State to hold fetched collectionsites
  const [allcollectionsites, setAllCollectionsites] = useState([]); // State to hold fetched collectionsites
  const [successMessage, setSuccessMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(collectionsites.length / itemsPerPage);

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/get-reg-history/${filterType}/${id}`);
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
      const response = await axios.get('http://localhost:5000/api/collectionsite/get');
      setAllCollectionsites(response.data)
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

  // const formatDateTime = (dateTime) => {
  //   const date = new Date(dateTime);
  //   const formattedDate = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
  //   return formattedDate;
  // };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post('http://localhost:5000/api/collectionsite/post', formData);
      console.log("Collectionsite added successfully:", response.data);

      // Refresh the collectionsite list after successful submission
      const newResponse = await axios.get('http://localhost:5000/api/collectionsite/get');
      setCollectionsites(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        CollectionSiteName: "",
        email: "",
        phoneNumber: "",
        // created_at: "",
        status: "",
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding collectionsite:", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`http://localhost:5000/api/collectionsite/delete/${selectedCollectionsiteId}`);
      console.log(`Collectionsite with ID ${selectedCollectionsiteId} deleted successfully.`);

      // Set success message
      setSuccessMessage("Collectionsite deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the collectionsite list after deletion
      const newResponse = await axios.get('http://localhost:5000/api/collectionsite/get');
      setCollectionsites(newResponse.data);

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
  const sendApprovalEmail = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.CollectionSiteName,
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

      const newResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/get`
      );
      setCollectionsites(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Collectionsite updated successfully.");
      sendApprovalEmail();
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

  const currentData = collectionsites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    if (!value.trim()) return fetchCollectionsites(); // Reset if input is empty
  
    setCollectionsites(
      allcollectionsites.filter((collectionsite) => {
        const fieldValue = collectionsite[field]?.toString().toLowerCase().trim(); // Normalize field
        const searchValue = value.toLowerCase().trim(); // Normalize input
  
        if (!fieldValue) return false;
  
        // Exact match for "status", partial match for others
        return field === "status"
          ? fieldValue.startsWith(searchValue) // Ensures "i" matches "inactive" but not "active"
          : fieldValue.includes(searchValue);
      })
    );
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

  const resetFormData = () => {
    setFormData({
      CollectionSiteName: "",
      email: "",
      phoneNumber: "",
      // created_at: "",
      status: "",
    });
  };
  return (
    <section className="policy__area pb-120">
      <div
        className="container"
        style={{ marginTop: "-20px", width: "auto", }}
      >
        <div
          className="row justify-content-center"
          style={{ marginTop: "290px" }}
        >
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              <div
                className="d-flex justify-content-between align-items-center mb-3"
                style={{
                  marginTop: "-20px",
                  width: "120%",
                  marginLeft: "-80px",
                }}
              >
                <div className="d-flex align-items-center">
                  <label
                    htmlFor="statusFilter"
                    className="mr-2"
                    style={{
                      marginLeft: "60px",
                      marginRight: "10px",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
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
                    }
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
                            handleFilterChange("CollectionSiteName", e.target.value)
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
                          placeholder="Search Email"
                          onChange={(e) =>
                            handleFilterChange("email", e.target.value)
                          }
                        />
                        Email</th>
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
                      currentData.map((collectionsite) => (
                        <tr key={collectionsite.id}>
                          <td>{collectionsite.id}</td>
                          <td>{collectionsite.CollectionSiteName}</td>
                          <td>{collectionsite.email}</td>
                          <td>{collectionsite.phoneNumber}</td>
                          {/* <td>{collectionsite.created_at}</td> */}
                          <td>{collectionsite.status}</td>
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
                                onClick={() => handleEditClick(collectionsite)}>
                                <FontAwesomeIcon icon={faEdit} size="sm" />
                              </button>{" "}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedCollectionsiteId(collectionsite.id);
                                  setShowDeleteModal(true);
                                }}
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
                        <td colSpan="6" className="text-center">
                          No Collectionsite Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}

              <div
                className="pagination d-flex justify-content-center align-items-center mt-3"
                style={{
                  gap: "10px",
                }}
              >
                {/* Previous Button */}
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Page Numbers with Ellipsis */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Show page number if it's the first, last, current, or adjacent to current
                  if (
                    pageNumber === 1 || // Always show the first page
                    pageNumber === totalPages || // Always show the last page
                    pageNumber === currentPage || // Show current page
                    pageNumber === currentPage - 1 || // Show previous page
                    pageNumber === currentPage + 1 // Show next page
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`btn btn-sm ${currentPage === pageNumber
                            ? "btn-primary"
                            : "btn-outline-secondary"
                          }`}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          minWidth: "40px",
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  // Add ellipsis if previous number wasn't shown
                  if (
                    (pageNumber === 2 && currentPage > 3) || // Ellipsis after the first page
                    (pageNumber === totalPages - 1 &&
                      currentPage < totalPages - 2) // Ellipsis before the last page
                  ) {
                    return (
                      <span
                        key={`ellipsis-${pageNumber}`}
                        style={{
                          minWidth: "40px",
                          textAlign: "center",
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  return null; // Skip the page number
                })}

                {/* Next Button */}
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>


              {/* Modal for Adding Collectionsites */}
              {/* {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Collectionsite</h5>
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
                            <label>Collection Site Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="CollectionSiteName"
                              value={formData.CollectionSiteName}
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
              {/* Edit Collectionsite Modal */}
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
                          <h5 className="modal-title">Edit Collection Site</h5>
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
                              Update Collection Site
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
                          <h5 className="modal-title">Delete Collectionsite</h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => setShowDeleteModal(false)}
                          >
                            <span>&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          <p>Are you sure you want to delete this collectionsite?</p>
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

export default CollectionsiteArea;
