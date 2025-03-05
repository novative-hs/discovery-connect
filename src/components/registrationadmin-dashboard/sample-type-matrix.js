import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,  faHistory
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import Pagination from "@ui/Pagination";
import moment from "moment";
const SampleTypeMatrixArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("account_id on SampleTypeMatrix page is:", id);
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyData, setHistoryData] = useState([]);
  const [selectedSampleTypeMatrixnameId, setSelectedSampleTypeMatrixnameId] =useState(null); // Store ID of Plasma to delete
  const [formData, setFormData] = useState({
    name: "",
    added_by: id,
  });
  const [editSampleTypeMatrixname, setEditSampleTypeMatrixname] =
    useState(null); // State for selected City to edit
  const [sampletypematrixname, setSampleTypeMatrixname] = useState([]); // State to hold fetched City
  const [successMessage, setSuccessMessage] = useState("");
  const[filteredSampletypematrixname,setFilteredSampletypematrixname]=useState([])
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  // Api Path
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch ContainerType from backend when component loads
  useEffect(() => {
    fetchSampleTypeMatrixname(); // Call the function when the component mounts
  }, []);
  const fetchSampleTypeMatrixname = async () => {
    try {
      const response = await axios.get(
        `${url}/samplefields/get-samplefields/sampletypematrix`
      );
      setFilteredSampletypematrixname(response.data); // Initialize filtered list
      setSampleTypeMatrixname(response.data); // Store fetched SampleTypeMatrix in state
    } catch (error) {
      console.error("Error fetching Sample Type Matrix :", error);
    }
  };
 useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSampletypematrixname.length / itemsPerPage));
    setTotalPages(pages);
    
    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredSampletypematrixname]);
  
 
   const currentData = filteredSampletypematrixname.slice(
     currentPage * itemsPerPage,
     (currentPage + 1) * itemsPerPage
   );
 
   const handlePageChange = (event) => {
     setCurrentPage(event.selected);
   };
 
   const handleFilterChange = (field, value) => {
     let filtered = [];
 
     if (value.trim() === "") {
       filtered = sampletypematrixname; // Show all if filter is empty
     } else {
       filtered = sampletypematrixname.filter((sampletypematrix) =>
        sampletypematrix[field]?.toString().toLowerCase().includes(value.toLowerCase())
       );
     }
 
     setFilteredSampletypematrixname(filtered);
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
    console.log(formData);
    e.preventDefault();
    try {
      // POST request to your backend API
      const response = await axios.post(
        `${url}/samplefields/post-samplefields/sampletypematrix`,
        formData
      );
      console.log("Sample Type Matrix added successfully:", response.data);
      setSuccessMessage("Sample Type Matrix Name deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchSampleTypeMatrixname();
      // Clear form after submission
      setFormData({
        name: "",
        added_by: id,
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding SampleTypeMatrix ", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/samplefields/delete-samplefields/sampletypematrix/${selectedSampleTypeMatrixnameId}`
      );
      console.log(
        `Sample Type Matrix name with ID ${selectedSampleTypeMatrixnameId} deleted successfully.`
      );

      // Set success message
      setSuccessMessage("Sample Type Matrix Name deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the cityname list after deletion
      fetchSampleTypeMatrixname();

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedSampleTypeMatrixnameId(null);
    } catch (error) {
      console.error(
        `Error deleting SampleTypeMatrix  with ID ${selectedSampleTypeMatrixnameId}:`,
        error
      );
    }
  };

  useEffect(() => {
    if (showDeleteModal || showAddModal || showEditModal|| showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showAddModal, showEditModal,showHistoryModal]);

  const handleEditClick = (sampletypematrix) => {
    console.log("data in case of update is", sampletypematrix);

    setSelectedSampleTypeMatrixnameId(sampletypematrix.id);
    setEditSampleTypeMatrixname(sampletypematrix);

    setFormData({
      name: sampletypematrix.name,
      added_by: id,
    });

    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/samplefields/put-samplefields/sampletypematrix/${selectedSampleTypeMatrixnameId}`,
        formData
      );
      console.log(
        "Sample Type Matrix Name updated successfully:",
        response.data
      );

      fetchSampleTypeMatrixname();

      setShowEditModal(false);
      setSuccessMessage("Sample Type Matrix updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      resetFormData()
    } catch (error) {
      console.error(
        `Error updating Sample Type Matrix name with ID ${selectedSampleTypeMatrixnameId}:`,
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
    console.log("File upload triggered"); // Debugging
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
          `${url}/samplefields/post-samplefields/sampletypematrix`,
          { bulkData: dataWithAddedBy }
        );
        console.log("Sample Type Matrix added successfully:", response.data);

        fetchSampleTypeMatrixname();
      } catch (error) {
        console.error("Error adding Sample Type Matrix :", error);
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
                <div className="d-flex justify-content-end align-items-center gap-2 w-100">
                  {/* Add Storage Condition Button */}
                  <button
                    className="btn btn-primary mb-2"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Sample Type Matrix
                  </button>

                  {/* Upload Button (Styled as Label for Hidden Input) */}
                  <label className="btn btn-secondary mb-2">
                    Upload Sample Type Matrix List
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        handleFileUpload(e);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Table with responsive scroll */}
              <div className="table-responsive overflow-auto w-100">
              {" "}
              {/* Increased width & scrolling */}
              <table className="table table-bordered table-hover table-striped w-100">
                {" "}
                {/* Added w-100 */}
                <thead className="thead-dark">
                <tr className="text-center">
                      {[
                        { label: "ID", placeholder: "Search ID", field: "id",width: "col-md-2" },
                        {
                          label: "Sample Type Matrix",
                          placeholder: "Search Sample Type Matrix",
                          field: "name",
                          width: "col-md-4"
                        },
                        {
                          label: "Added By",
                          placeholder: "Search Added by",
                          field: "added_by",
                          width: "col-md-2"
                        },
                        {
                          label: "Created At",
                          placeholder: "Search Created at",
                          field: "created_at",
                          width: "col-md-2"
                        },
                        {
                          label: "Updated At",
                          placeholder: "Search Updated at",
                          field: "updated_at",
                          width: "col-md-2"
                        },
                      ].map(({ label, placeholder, field ,width}) => (
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
                      <th className="col-md--1">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map(
                        ({ id, name, added_by, created_at, updated_at }) => (
                          <tr key={id}>
                            <td>{id}</td>
                            <td>{name}</td>
                            <td>{added_by}</td>
                            <td>{formatDate(created_at)}</td>
                            <td>{formatDate(updated_at)}</td>
                            <td>
                              <div className="d-flex justify-content-around gap-2">
                                <button
                                  className="btn btn-success btn-sm py-0 px-1"
                                  onClick={() =>
                                    handleEditClick({
                                      id,
                                      name,
                                      added_by,
                                      created_at,
                                      updated_at,
                                    })
                                  }
                                  title="Edit SampleTypeMatrix"
                                >
                                  <FontAwesomeIcon icon={faEdit} size="xs" />
                                </button>
                                <button
                                  className="btn btn-danger btn-sm py-0 px-1"
                                  onClick={() => {
                                    setSelectedSampleTypeMatrixnameId(id);
                                    setShowDeleteModal(true);
                                  }}
                                  title="Delete Sample Type Matrix"
                                >
                                  <FontAwesomeIcon icon={faTrash} size="sm" />
                                </button>
                                <button
                                                                                                className="btn btn-info btn-sm py-0 px-1"
                                                                                                onClick={() =>
                                                                                                  handleShowHistory("sampletypematrix", id)
                                                                                                }
                                                                                                title="History Sample type matrix"
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
                          No Sample Type Matrix Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              { totalPages >=0 && (
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
                              ? "Add Sample Type Matrix"
                              : "Edit Sample Type Matrix"}
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
                              <label>Sample Type Matrix Name</label>
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
                              {showAddModal
                                ? "Save"
                                : "Update Sample Type Matrix"}
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
                            Delete Sample Type Matrix
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowDeleteModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <p>
                            Are you sure you want to delete this Sample Type Matrix?
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
                                                                <b>Sample Type Matrix:</b> {created_name} was <b>added</b>{" "}
                                                                by Registration Admin at{" "}
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
                                                                  <b>Sample Type Matrix:</b> {updated_name} was{" "}
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

export default SampleTypeMatrixArea;
