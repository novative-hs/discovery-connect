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
import Pagination from "@ui/Pagination";
const CountryArea = () => {
  const id = sessionStorage.getItem("userID");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedcountrynameId, setselectedcountrynameId] = useState(null); // Store ID of Country to delete
  const [formData, setFormData] = useState({
    countryname: "",
    added_by: id,
  });
  const [editCountryname, setEditCountryname] = useState(null); // State for selected Country to edit
  const [countryname, setCountryname] = useState([]); // State to hold fetched Country
  const [filteredCountryname, setFilteredCountryname] = useState([]); // Store filtered cities
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  const [successMessage, setSuccessMessage] = useState("");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch Country from backend when component loads
  useEffect(() => {
     const fetchcountryname = async () => {
    try {
      const response = await axios.get(`${url}/country/get-country`);
      setFilteredCountryname(response.data);
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };
    fetchcountryname(); // Call the function when the component mounts
  }, [url]);
 
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredCountryname.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredCountryname,currentPage]);

  const currentData = filteredCountryname.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const handlePageChange = (event) => {
    setCurrentPage(event.selected); // React Paginate uses 0-based index
  };
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = countryname; // Show all if filter is empty
    } else {
      filtered = countryname.filter((country) => {
        if (field === "added_by") {
          return "registration admin".includes(value.toLowerCase());
        }
        return country[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
    }

    setFilteredCountryname(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
 const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${url}/country/post-country`, formData);
        const response = await axios.get(`${url}/country/get-country`);
        setFilteredCountryname(response.data);
        setCountryname(response.data);
        setSuccessMessage("Country added successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
        resetFormData();
        setShowAddModal(false);
      } catch (error) {
        console.error("Error adding Country", error);
      }
    };
const handleEditClick = (countryname) => {
    setselectedcountrynameId(countryname.id);
    setEditCountryname(countryname); // Store the Country data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      countryname: countryname.name, // Ensure it's 'countryname' and not 'name'
      added_by: id,
    });
  };

  const handleUpdate = async (e) => {
      e.preventDefault();
      try {
        await axios.put(`${url}/country/put-country/${selectedcountrynameId}`, formData);
        const response = await axios.get(`${url}/country/get-country`);
        setFilteredCountryname(response.data);
        setCountryname(response.data);
        setSuccessMessage("Country updated successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
        resetFormData();
        setShowEditModal(false);
      } catch (error) {
        console.error(`Error updating Country: ${selectedcountrynameId}`, error);
      }
    };

 const handleDelete = async () => {
    try {
      await axios.delete(`${url}/country/delete-country/${selectedcountrynameId}`);
      const response = await axios.get(`${url}/country/get-country`);
      setFilteredCountryname(response.data);
      setCountryname(response.data);
      setSuccessMessage("Country deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowDeleteModal(false);
      setselectedcountrynameId(null);
    } catch (error) {
      console.error(`Error deleting Country: ${selectedcountrynameId}`, error);
    }
  };
    useEffect(() => {
      const isModalOpen = showDeleteModal || showAddModal || showEditModal || showHistoryModal;
      document.body.style.overflow = isModalOpen ? "hidden" : "auto";
      document.body.classList.toggle("modal-open", isModalOpen);
    }, [showDeleteModal, showAddModal, showEditModal, showHistoryModal]);
   

  const formatDate = (date) => {
    const options = { year: "2-digit", month: "short", day: "2-digit" };
    const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
    const [day, month, year] = formattedDate.split(" ");

    // Capitalize the first letter of the month and keep the rest lowercase
    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year}`;
  };
  const resetFormData = () => {
    setFormData({ countryname: "", added_by: id }); // Reset to empty state
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
        await axios.post(`${url}/country/post-country`, { bulkData: payload });
        const response = await axios.get(`${url}/country/get-country`);
        setFilteredCountryname(response.data);
        setCountryname(response.data);
        setSuccessMessage("Successfully added")
      } catch (error) {
        console.error("Error uploading Country", error);
      }
    };
    reader.readAsBinaryString(file);
  };
  const handleExportToExcel = () => {
    const dataToExport = filteredCountryname.map((item) => ({
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

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
      header: ["Name", "Added By", "Created At", "Updated At"],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Country");

    XLSX.writeFile(workbook, "Country_List.xlsx");
  };
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  }
  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">
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
              <h5 className="m-0 fw-bold ">Country List</h5>
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
                  <i className="fas fa-plus"></i> Add Country
                </button>

                {/* Upload Country List Button */}
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
                  <i className="fas fa-upload"></i> Upload Country List
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
                    // { label: "ID", placeholder: "Search ID", field: "id", width: "col-md-2" },
                    {
                      label: "Country Name",
                      placeholder: "Search Country Name",
                      field: "name",
                      width: "col-md-1",
                    },
                    {
                      label: "Added By",
                      placeholder: "Search Added by",
                      field: "added_by",
                      width: "col-md-1",
                    },
                    {
                      label: "Created At",
                      placeholder: "Search Created at",
                      field: "created_at",
                      width: "col-md-1",
                    },
                    {
                      label: "Updated At",
                      placeholder: "Search Updated at",
                      field: "updated_at",
                      width: "col-md-1", // Increased width
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
                  <th className="col-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((countryname) => (
                    <tr key={countryname.id}>
                      {/* <td>{countryname.id}</td> */}
                      <td>{countryname.name}</td>
                      {/* <td>{countryname.added_by}</td> */}
                      <td>Registration Admin</td>
                      <td>{formatDate(countryname.created_at)}</td>
                      <td>{formatDate(countryname.updated_at)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEditClick(countryname)}
                            title="Edit Country" // This is the text that will appear on hover
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>{" "}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setselectedcountrynameId(countryname.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Country" // This is the text that will appear on hover
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleShowHistory("country", countryname.id)
                            }
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
                    <td colSpan="6" className="text-center">
                      No Country Available
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

          {/* Modal for Adding countrys */}
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
                        {showAddModal ? "Add Country" : "Edit Country"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
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
                          <label>Country Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="countryname"
                            value={formData.countryname}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          {showAddModal ? "Save" : "Update Country"}
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
                                <b>Country:</b> {created_name} was <b>added</b>{" "}
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
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    marginTop: "5px", // Spacing between messages
                                  }}
                                >
                                  <b>Country:</b> {updated_name} was{" "}
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
          {/* Edit countryname Modal */}

          {/* Modal for Deleting Countryname */}
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
                      <h5 className="modal-title">Delete Country</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>Are you sure you want to delete this Country?</p>
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

export default CountryArea;
