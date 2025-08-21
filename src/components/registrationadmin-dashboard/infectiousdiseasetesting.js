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

const VolumeUnitArea = () => {
  const id = sessionStorage.getItem("userID");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedinfectiousdiseasenameId, setSelectedinfectiousdiseasenameId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    added_by: id,
  });
  const [editinfectiousdiseasename, setEditinfectiousdiseasename] = useState(null);
  const [infectiousdiseasename, setinfectiousdiseasename] = useState([]);
  const [filteredinfectiousdiseasename, setFilteredinfectiousdiseasename] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // ✅ FETCH DATA ON LOAD
  useEffect(() => {
    const fetchinfectiousdiseasename = async () => {
      try {
        const response = await axios.get(`${url}/samplefields/get-samplefields/infectiousdiseasetesting`);
        setinfectiousdiseasename(response.data);
        setFilteredinfectiousdiseasename(response.data);
      } catch (error) {
        console.error("Error fetching infectious disease:", error);
      }
    }

    fetchinfectiousdiseasename();
  }, [url]);

  // ✅ UPDATE PAGINATION TOTAL PAGES
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredinfectiousdiseasename.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredinfectiousdiseasename, currentPage]);

  // ✅ CONTROL SCROLL WHEN MODAL OPEN
  useEffect(() => {
    const isModalOpen =
      showDeleteModal || showAddModal || showEditModal || showHistoryModal;
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    document.body.classList.toggle("modal-open", isModalOpen);
  }, [showDeleteModal, showAddModal, showEditModal, showHistoryModal]);

  const currentData = filteredinfectiousdiseasename.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = infectiousdiseasename;
    } else {
      filtered = infectiousdiseasename.filter((infectiousdisease) => {
        if (field === "added_by") {
          return "registration admin".includes(value.toLowerCase());
        }
        return infectiousdisease[field]?.toString().toLowerCase().includes(value.toLowerCase())
      });
    }

    setFilteredinfectiousdiseasename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  };

  const handleEditClick = (infectiousdiseasename) => {
    setSelectedinfectiousdiseasenameId(infectiousdiseasename.id);
    setEditinfectiousdiseasename(infectiousdiseasename);
    setFormData({
      name: infectiousdiseasename.name,
      added_by: id,
    });
    setShowEditModal(true);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormData = () => {
    setFormData({ name: "", added_by: id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // For creation, we need to refetch to get the complete object with all fields
      await axios.post(
        `${url}/samplefields/post-samplefields/infectiousdiseasetesting`,
        formData
      );
      const response = await axios.get(
        `${url}/samplefields/get-samplefields/infectiousdiseasetesting`
      );
      setFilteredinfectiousdiseasename(response.data);
      setinfectiousdiseasename(response.data);
      setSuccessMessage("infectious disease testing added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      resetFormData();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding infectious disease testing", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // First get the current item to preserve all fields
      const currentItem = infectiousdiseasename.find(item => item.id === selectedinfectiousdiseasenameId);

      await axios.put(
        `${url}/samplefields/put-samplefields/infectiousdiseasetesting/${selectedinfectiousdiseasenameId}`,
        formData
      );

      // Update the item while preserving all existing fields
      const updatedItem = {
        ...currentItem,
        name: formData.name,
        // Preserve all other fields including timestamps
        updated_at: new Date().toISOString() // Update the timestamp
      };

      // Update both lists without refetching
      setinfectiousdiseasename(prev =>
        prev.map(item =>
          item.id === selectedinfectiousdiseasenameId
            ? updatedItem
            : item
        )
      );
      setFilteredinfectiousdiseasename(prev =>
        prev.map(item =>
          item.id === selectedinfectiousdiseasenameId
            ? updatedItem
            : item
        )
      );

      setSuccessMessage("Infectious Disease Name updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      resetFormData();
      setShowEditModal(false);
    } catch (error) {
      console.error(
        `Error updating Infectious Disease Name: ${selectedinfectiousdiseasenameId}`,
        error
      );
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${url}/samplefields/delete-samplefields/infectiousdiseasetesting/${selectedinfectiousdiseasenameId}`,
      );

      // Update both lists without refetching
      setinfectiousdiseasename(prev =>
        prev.filter(item => item.id !== selectedinfectiousdiseasenameId)
      );
      setFilteredinfectiousdiseasename(prev =>
        prev.filter(item => item.id !== selectedinfectiousdiseasenameId)
      );

      setSuccessMessage("Infectious Disease Name deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowDeleteModal(false);
      setSelectedinfectiousdiseasenameId(null);
    } catch (error) {
      console.error(
        `Error deleting Infectious Disease Name: ${selectedinfectiousdiseasenameId}`,
        error
      );
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      const payload = data.map((row) => ({ name: row.Name, added_by: id }));

      try {
        await axios.post(`${url}/samplefields/post-samplefields/infectiousdiseasetesting`, {
          bulkData: payload,
        });
        const response = await axios.get(
          `${url}/samplefields/get-samplefields/infectiousdiseasetesting`
        );
        setFilteredinfectiousdiseasename(response.data);
        setinfectiousdiseasename(response.data);
        setSuccessMessage("Successfully added")
      } catch (error) {
        console.error("Error uploading infectious disease", error);
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
    const dataToExport = filteredinfectiousdiseasename.map((item) => ({
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "infectiousdisease");

    XLSX.writeFile(workbook, "Infectious_disease_testing_List.xlsx");
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
              <div className="alert alert-success mb-3" role="alert">
                {successMessage}
              </div>
            )}

            {/* Button Container */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <h5 className="m-0 fw-bold ">Infectious disease Testing List</h5>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                {/* Add City Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: "#4a90e2", // soft blue
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <i className="fas fa-plus"></i> Add Infectious Disease Testing
                </button>

                {/* Upload infectiousdisease List Button */}
                <label
                  style={{
                    backgroundColor: "#f1f1f1", // soft gray
                    color: "#333",
                    border: "1px solid #ccc",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    marginBottom: 0,
                  }}
                >
                  <i className="fas fa-upload"></i> Upload Infectious disease testing List
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    hidden
                    onChange={(e) => handleFileUpload(e)}
                  />
                </label>
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
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    //{ label: "ID", placeholder: "Search ID", field: "id" },
                    {
                      label: "Infectious Disease Testing Name",
                      placeholder: "Search infectious disease testing Name",
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
                  currentData.map((infectiousdisease) => (
                    <tr key={infectiousdisease.id}>
                      {/* <td>{cityname.id}</td> */}
                      <td>{infectiousdisease.name}</td>
                      {/* <td>{cityname.added_by}</td> */}
                      <td>Registration Admin</td>
                      <td>{formatDate(infectiousdisease.created_at)}</td>
                      <td>{formatDate(infectiousdisease.updated_at)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEditClick(infectiousdisease)}
                            title="Edit infectiousdisease"
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setSelectedinfectiousdiseasenameId(infectiousdisease.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete infectiousdisease"
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleShowHistory("infectiousdiseasetesting", infectiousdisease.id)
                            }
                            title="History infectious disease testing"
                          >
                            <FontAwesomeIcon icon={faHistory} size="xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Infectious Disease Testing Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}
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
                        {showAddModal ? "Add infectious disease" : "Edit infectious disease"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          setFormData({
                            name: "",
                            added_by: id,
                          });
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
                          <label>infectious disease testing Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          {showAddModal ? "Save" : "Update infectious disease testing"}
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
                                <b>Infectious disease testing :</b> {created_name} was <b>added</b> by
                                Registration Admin at{" "}
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
                                  <b>Infectious disease testing:</b> {updated_name} was <b>updated</b>{" "}
                                  by Registration Admin at{" "}
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
                      <h5 className="modal-title">Delete infectious disease testing</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this infectious disease testng?</p>
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

export default VolumeUnitArea;
