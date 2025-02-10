import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
const CityArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  }
  else {
    console.log("account_id on city page is:", id);
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedcitynameId, setSelectedcitynameId] = useState(null); // Store ID of City to delete
  const [formData, setFormData] = useState({
    cityname: "",
    added_by: id,
  });
  const [editcityname, setEditcityname] = useState(null); // State for selected City to edit
  const [cityname, setcityname] = useState([]); // State to hold fetched City
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Calculate total pages
  const totalPages = Math.ceil(cityname.length / itemsPerPage);
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`
  // Fetch City from backend when component loads
  useEffect(() => {
    fetchcityname(); // Call the function when the component mounts
  }, []);
  const fetchcityname = async () => {
    try {
      const response = await axios.get(
        `${url}/city/get-city`
      );
      setcityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };

  const currentData = cityname.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchcityname(); // Reset to fetch original data
    } else {
      // Filter the sample array based on the field and value
      const filtered = cityname.filter((cityname) =>
        cityname[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
      setcityname(filtered); // Update the state with filtered results
    }
  };
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
        `${url}/city/post-city`,
        formData
      );
      console.log("City added successfully:", response.data);

      fetchcityname();
      // Clear form after submission
      setFormData({
        cityname: "",
        added_by: id,
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Committe Member:", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/city/delete-city/${selectedcitynameId}`
      );
      console.log(
        `cityname with ID ${selectedcitynameId} deleted successfully.`
      );

      // Set success message
      setSuccessMessage("cityname deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the cityname list after deletion
      const newResponse = await axios.get(
        "http://localhost:5000/api/city/get-city"
      );
      setcityname(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedcitynameId(null);
    } catch (error) {
      console.error(
        `Error deleting Committe Member with ID ${selectedcitynameId}:`,
        error
      );
    }
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

  const handleEditClick = (cityname) => {
    console.log("data in case of update is", cityname);
    setSelectedcitynameId(cityname.id);
    setEditcityname(cityname); // Store the City data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      cityname: cityname.name, // Ensure it's 'cityname' and not 'name'
      added_by: id
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/city/put-city/${selectedcitynameId}`,
        formData
      );
      console.log("cityname updated successfully:", response.data);

      fetchcityname();

      setShowEditModal(false);
      setSuccessMessage("City updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating cityname with ID ${selectedcitynameId}:`,
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
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet); // Convert sheet to JSON

      // Add 'added_by' field from state (assumes 'id' is available in state)
      const dataWithAddedBy = data.map((row) => ({
        name: row.name,
        added_by: id, // Make sure `id` is defined
      }));

      try {
        // POST data to your existing API
        const response = await axios.post(
          "http://localhost:5000/api/city/post-city",
          { bulkData: dataWithAddedBy }
        );
        console.log("Cities added successfully:", response.data);

        // Refresh the city list
        const newResponse = await axios.get(
          "http://localhost:5000/api/city/get-city"
        );
        setcityname(newResponse.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };

    reader.readAsBinaryString(file);
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
              <div className="d-flex justify-content-end align-items-center mb-3">
                {/* Upload City List Button */}


                {/* Add City Button */}
                <button
                  className="btn btn-primary me-3"
                  onClick={() => setShowAddModal(true)}
                >
                  Add City
                </button>
                <label className="btn btn-secondary me-3"> {/* Added `me-3` for spacing */}
                  Upload City List
                  <input
                    type="file"
                    accept=".xlsx, .xls" // Accept only Excel files
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </label>
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
                    <tr style={{ textAlign: 'center', }}>
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
                          placeholder="Search City Name"
                          onChange={(e) =>
                            handleFilterChange("name", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        City Name
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
                          placeholder="Search Added by"
                          onChange={(e) =>
                            handleFilterChange("added_by", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px",
                          }}
                        />
                        Added By</th>
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
                          placeholder="Search Created at"
                          onChange={(e) =>
                            handleFilterChange("created_at", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Created At
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
                          placeholder="Search Updated at"
                          onChange={(e) =>
                            handleFilterChange("updated_at", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Updated At
                      </th>

                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((cityname) => (
                        <tr key={cityname.id}>
                          <td>{cityname.id}</td>
                          <td>{cityname.name}</td>
                          <td>{cityname.added_by}</td>
                          <td>{formatDate(cityname.created_at)}</td>
                          <td>{formatDate(cityname.updated_at)}</td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                                gap: "5px",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm py-0 px-1"
                                onClick={() => handleEditClick(cityname)}
                                title="Edit City" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </button>{" "}
                              <button
                                className="btn btn-danger btn-sm py-0 px-1"
                                onClick={() => {
                                  setSelectedcitynameId(cityname.id);
                                  setShowDeleteModal(true);
                                }}
                                title="Delete City" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </button>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handleShowHistory("city", cityname.id)}
                                title="History Sample"
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
                          No City Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
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

              {/* Modal for Adding Committe members */}
              {showAddModal && (
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
                          <h5 className="modal-title">Add City</h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => setShowAddModal(false)}
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
                        <form onSubmit={handleSubmit}>
                          <div className="modal-body">
                            {/* Form Fields */}
                            <div className="form-group">
                              <label>City Name</label>
                              <input
                                type="text"
                                className="form-control"
                                name="cityname"
                                value={formData.cityname} // Use 'cityname' here instead of 'name'
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


              {/* Edit cityname Modal */}
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
                          <h5 className="modal-title">Edit City</h5>
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
                              <label>City Name</label>
                              <input
                                type="text"
                                className="form-control"
                                name="cityname"
                                value={formData.cityname}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button type="submit" className="btn btn-primary">
                              Update City
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal for Deleting cityname */}
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
                        <div className="modal-header" style={{ backgroundColor: "transparent" }}>
                          <h5 className="modal-title">Delete City</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowDeleteModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <p>Are you sure you want to delete this city?</p>
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

export default CityArea;