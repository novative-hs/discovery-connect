import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import Pagination from "@ui/Pagination";
import moment from "moment";

const SampleConditionArea = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("account_id on Sample Condition  page is:", id);
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  const [selectedSampleConditionnameId, setSelectedSampleConditionnameId] =
    useState(null); // Store ID of City to delete
  const [formData, setFormData] = useState({
    name: "",
    added_by: id,
  });
  const [editSampleConditionname, setEditSampleConditionname] = useState(null); // State for selected City to edit
  const [sampleconditionname, setSampleConditionname] = useState([]); // State to hold fetched City
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredSampleconditionname, setFilteredSampleconditionname] = useState([]); // Store filtered cities
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  // Api Path
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch City from backend when component loads
  useEffect(() => {
    fetchSampleConditionname(); // Call the function when the component mounts
  }, []);
  const fetchSampleConditionname = async () => {
    try {
      const response = await axios.get(
        `${url}/samplefields/get-samplefields/samplecondition`
      );
      setFilteredSampleconditionname(response.data); // Initialize filtered list
      setSampleConditionname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching Sample Condition", error);
    }
  };
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredSampleconditionname.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredSampleconditionname]);

  const currentData = filteredSampleconditionname.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = sampleconditionname; // Show all if filter is empty
    } else {
      filtered = sampleconditionname.filter((samplecondition) =>
        samplecondition[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    }

    setFilteredSampleconditionname(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
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

  // Call this function when opening the modal
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      // POST request to your backend API
      const response = await axios.post(
        `${url}/samplefields/post-samplefields/samplecondition`,
        formData
      );

      setSuccessMessage("Sample Condition Name deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      fetchSampleConditionname();
      // Clear form after submission
      resetFormData();
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Sample Condition:", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/samplefields/delete-samplefields/samplecondition/${selectedSampleConditionnameId}`
      );

      // Set success message
      setSuccessMessage("Sample Condition Name deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchSampleConditionname();
      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedSampleConditionnameId(null);
    } catch (error) {
      console.error(
        `Error deleting Storage temperature with ID ${selectedSampleConditionnameId}:`,
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

  const handleEditClick = (sampleconditionname) => {


    setSelectedSampleConditionnameId(sampleconditionname.id);
    setEditSampleConditionname(sampleconditionname);

    setFormData({
      name: sampleconditionname.name,
      added_by: id,
    });

    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/samplefields/put-samplefields/samplecondition/${selectedSampleConditionnameId}`,
        formData
      );


      fetchSampleConditionname();

      setShowEditModal(false);
      setSuccessMessage("Sample Condition updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating Sample Condition name with ID ${selectedSampleConditionnameId}:`,
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
    console.log("File selected:", file); // Debugging

    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet); // Convert sheet to JSON

      // Add 'added_by' field (ensure 'id' is defined in the state)
      const dataWithAddedBy = data.map((row) => ({
        name: row.name,
        added_by: id, // Ensure 'id' is defined in the component
      }));

      console.log("Data with added_by", dataWithAddedBy);

      try {
        // POST request inside the same function
        const response = await axios.post(
          `${url}/samplefields/post-samplefields/samplecondition`,
          { bulkData: dataWithAddedBy }
        );
        console.log("Sample condition added successfully:", response.data);

        fetchSampleConditionname();
      } catch (error) {
        console.error("Error adding Sample condition:", error);
      }
    };

    reader.readAsBinaryString(file);
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      added_by: id,
    });
  };

  const handleExportToExcel = () => {
    const dataToExport = filteredSampleconditionname.map((item) => ({
      Name: item.name,
      "Added By": "Registration Admin",
      "Created At": formatDate(item.created_at),
      "Updated At": formatDate(item.updated_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Condition");

    XLSX.writeFile(workbook, "Sample-Condition-List.xlsx");
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">

          {/* Button Container */}
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
              <h5 className="m-0 fw-bold ">Sample Condition List</h5>
              <div className="d-flex flex-wrap gap-3 align-items-center">

                {/* Export to Excel button */}
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

                {/* Add Sample Condition Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: "#4a90e2",
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
                  <i className="fas fa-plus"></i> Add Sample Condition
                </button>

                <label
                  style={{
                    backgroundColor: "#f1f1f1",
                    color: "#333",
                    border: "1px solid #ccc",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    marginBottom: 0,
                  }}
                >
                  <i className="fas fa-upload"></i> Upload List
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    hidden
                    onChange={(e) => handleFileUpload(e)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Table with responsive scroll */}
          <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    // { label: "ID", placeholder: "Search ID", field: "id",width: "col-md-2" },
                    {
                      label: "Sample Condition Name",
                      placeholder: "Search Sample Condition Name",
                      field: "name",
                      width: "col-md-1"
                    },
                    {
                      label: "Added By",
                      placeholder: "Search Added by",
                      field: "added_by",
                      width: "col-md-1"
                    },
                    {
                      label: "Created At",
                      placeholder: "Search Created at",
                      field: "created_at",
                      width: "col-md-1"
                    },
                    {
                      label: "Updated At",
                      placeholder: "Search Updated at",
                      field: "updated_at",
                      width: "col-md-1"
                    },
                  ].map(({ label, placeholder, field, width }) => (
                    <th key={field} className={`${width} px-2`}>
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
                  currentData.map(
                    ({ id, name, added_by, created_at, updated_at }) => (
                      <tr key={id}>
                        {/* <td>{id}</td> */}
                        <td>{name}</td>
                        {/* <td>{added_by}</td> */}
                        <td>Registration Admin</td>
                        <td>{formatDate(created_at)}</td>
                        <td>{formatDate(updated_at)}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-3">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() =>
                                handleEditClick({
                                  id,
                                  name,
                                  added_by,
                                  created_at,
                                  updated_at,
                                })
                              }
                              title="Edit Sample condition"
                            >
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedSampleConditionnameId(id);
                                setShowDeleteModal(true);
                              }}
                              title="Delete Sample Condition"
                            >
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </button>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() =>
                                handleShowHistory("samplecondition", id)
                              }
                              title="History Sample Condition"
                            >
                              <FontAwesomeIcon icon={faHistory} size="sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Sample Condition Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}

          {/* Modal for Adding Committe members */}
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
                          ? "Add SampleCondition"
                          : "Edit SampleCondition"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          resetFormData(); // Reset form data when closing the modal
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
                          <label>Sample Condition Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name" // Fix here
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          {showAddModal ? "Save" : "Update SampleCondition"}
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
                      <h5 className="modal-title">
                        Delete Sample Condition
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>
                        Are you sure you want to delete this Sample
                        Condition?
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
                                  boxShadow:
                                    "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                  maxWidth: "75%",
                                  fontSize: "14px",
                                  textAlign: "left",
                                }}
                              >
                                <b>Sample Condition:</b> {created_name} was{" "}
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
                                  <b>Sample Condition:</b> {updated_name} was{" "}
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

        </div>
      </div>

    </section>
  );
};

export default SampleConditionArea;
