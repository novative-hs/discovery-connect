import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faPlus,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import Pagination from "@ui/Pagination";
import moment from "moment";

const TestMethodArea = () => {
  const id = sessionStorage.getItem("userID");
 const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedTestMethodnameId, setSelectedTestMethodnameId] =
    useState(null); // Store ID of Plasma to delete
  const [formData, setFormData] = useState({
    name: "",
    added_by: id,
  });
  const [editTestMethodname, setEditTestMethodname] = useState(null); // State for selected TestMethod to edit
  const [testmethodname, setTestMethodname] = useState([]); // State to hold fetched City
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredTestMethodname, setFilteredTestMethodname] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  // Api Path
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // ✅ FETCH DATA ON LOAD
  useEffect(() => {
   const fetchTestMethodname = async () => {
    try {
      const response = await axios.get(
        `${url}/samplefields/get-samplefields/testmethod`
      );
      setFilteredTestMethodname(response.data);
      setTestMethodname(response.data); // Store fetched TestMethod in state
    } catch (error) {
      console.error("Error fetching TestMethod :", error);
    }
  };
    fetchTestMethodname();
  }, [url]);

  // ✅ UPDATE PAGINATION TOTAL PAGES
 

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredTestMethodname.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredTestMethodname,currentPage]);

  // ✅ CONTROL SCROLL WHEN MODAL OPEN
  useEffect(() => {
    const isModalOpen = showDeleteModal || showAddModal || showEditModal || showHistoryModal;
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    document.body.classList.toggle("modal-open", isModalOpen);
  }, [showDeleteModal, showAddModal, showEditModal, showHistoryModal]);

  const currentData = filteredTestMethodname.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    const filtered = value.trim()
      ? testmethodname.filter((testmethod) =>
          field === "added_by"
            ? "registration admin".includes(value.toLowerCase())
            : testmethod[field]?.toString().toLowerCase().includes(value.toLowerCase())
        )
      : testmethodname;
    setFilteredTestMethodname(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormData = () => {
    setFormData({ name: "", added_by: id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${url}/samplefields/post-samplefields/testmethod`, formData);
      const response = await axios.get(`${url}/samplefields/get-samplefields/testmethod`);
      setFilteredTestMethodname(response.data);
      setTestMethodname(response.data);
      setSuccessMessage("Test Method name added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      resetFormData();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding Test Method name", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${url}/samplefields/put-samplefields/testmethod/${selectedTestMethodnameId}`, formData);
         const existingtestmethod = testmethodname.find(
        (c) => c.id === selectedTestMethodnameId
      );

      // Build the updated city correctly
      const updatedtestmethod = {
        id: selectedTestMethodnameId,
        name: formData.name,   // map formData.cityname → name
        added_by: existingtestmethod?.added_by || "Registration Admin",
        created_at: existingtestmethod?.created_at,  // keep original
        updated_at: new Date().toISOString(),  // update timestamp
      };

      // Update in countriesname
      setTestMethodname((prev) =>
        prev.map((testmethod) =>
          testmethod.id === selectedTestMethodnameId ? updatedtestmethod : testmethod
        )
      );

      // Update in filteredCityname
      setFilteredTestMethodname((prev) =>
        prev.map((testmethod) =>
          testmethod.id === selectedTestMethodnameId ? updatedtestmethod : testmethod
        )
      );
      setSuccessMessage("Test Method name updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      resetFormData();
      setShowEditModal(false);
    } catch (error) {
      console.error(`Error updating Test Method: ${selectedTestMethodnameId}`, error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${url}/samplefields/delete-samplefields/testmethod/${selectedTestMethodnameId}`);
      const response = await axios.get(`${url}/samplefields/get-samplefields/testmethod`);
      setFilteredTestMethodname(response.data);
      setTestMethodname(response.data);
      setSuccessMessage("Test Method name deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowDeleteModal(false);
      setSelectedTestMethodnameId(null);
    } catch (error) {
      console.error(`Error deleting Test Method: ${selectedTestMethodnameId}`, error);
    }
  };
 const handleEditClick = (testmethodname) => {
    setSelectedTestMethodnameId(testmethodname.id);
    setEditTestMethodname(testmethodname);
    setFormData({
      name: testmethodname.name,
      added_by: id,
    });
    setShowEditModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      const payload = data.map((row) => ({ name: row.name, added_by: id }));

      try {
        await axios.post(`${url}/samplefields/post-samplefields/testmethod`, { bulkData: payload });
        const response = await axios.get(`${url}/samplefields/get-samplefields/testmethod`);
        setFilteredTestMethodname(response.data);
        setTestMethodname(response.data);
        setSuccessMessage("Successfully added")
      } catch (error) {
        console.error("Error uploading test Method", error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const formatDate = (date) => {
    const formatted = new Date(date).toLocaleDateString("en-GB", {
      year: "2-digit",
      month: "short",
      day: "2-digit",
    });
    const [day, month, year] = formatted.split(" ");
    return `${day}-${month.charAt(0).toUpperCase() + month.slice(1)}-${year}`;
  };

   const handleExportToExcel = () => {
       const dataToExport = filteredTestMethodname.map((item) => ({
         Name: item.name ?? "", // Fallback to empty string
         "Added By": "Registration Admin",
         "Created At": item.created_at ? formatDate(item.created_at) : "",
         "Updated At": item.updated_at ? formatDate(item.updated_at) : "",
       }));
     
       // Add an empty row with all headers if filteredCityname is empty (optional)
       if (dataToExport.length === 0) {
         dataToExport.push({
           Name: "",
           "Added By": "",
           "Created At": "",
           "Updated At": "",
         });
       }
     
       const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: ["Name", "Added By", "Created At", "Updated At"] });
       const workbook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(workbook, worksheet, "Test Method");
     
       XLSX.writeFile(workbook, "Test_Method_List.xlsx");
     };
  
  if (!id) return <div>Loading...</div>;

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
              <h5 className="m-0 fw-bold ">Test Method List</h5>
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

                {/* Add Test Method Button */}
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
                  <i className="fas fa-plus"></i> Add Test Method
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
                    // { label: "ID", placeholder: "Search ID", field: "id" },
                    {
                      label: "Test Method",
                      placeholder: "Search Test Method",
                      field: "name",
                    },
                    {
                      label: "Added By",
                      placeholder: "Search Added by",
                      field: "added_by",
                    },
                    {
                      label: "Created At",
                      placeholder: "Search Created at",
                      field: "created_at",
                    },
                    {
                      label: "Updated At",
                      placeholder: "Search Updated at",
                      field: "updated_at",
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
                          <div className="d-flex justify-content-around gap-2">
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
                              title="Edit Test Method"
                            >
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>
                            <button
                              className="btn btn-danger btn-sm "
                              onClick={() => {
                                setSelectedTestMethodnameId(id);
                                setShowDeleteModal(true);
                              }}
                              title="Delete Test Method"
                            >
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </button>
                            <button
                              className="btn btn-info btn-sm "
                              onClick={() =>
                                handleShowHistory("testmethod", id)
                              }
                              title="History Test Method"
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
                      No Test Method Available
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
                        {showAddModal ? "Add Test Method" : "Edit Test Method"}
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
                          <label>Test Method Name</label>
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
                          {showAddModal ? "Save" : "Update Test Method"}
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
                      <h5 className="modal-title">Delete Test Method</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this Test Method?</p>
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
                                <b>Test Method:</b> {created_name} was{" "}
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
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    marginTop: "5px", // Spacing between messages
                                  }}
                                >
                                  <b>Test Method:</b> {updated_name} was{" "}
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

export default TestMethodArea;
