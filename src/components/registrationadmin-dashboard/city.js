import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import * as XLSX from "xlsx";
const CityArea = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
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
  const [cityname, setcityname] = useState([]); // Store all cities
  const [filteredCityname, setFilteredCityname] = useState([]); // Store filtered cities
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  // Calculate total pages dynamically

  const [successMessage, setSuccessMessage] = useState("");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  // Fetch City from backend when component loads
  useEffect(() => {
    fetchcityname(); // Call the function when the component mounts
  }, []);
  const fetchcityname = async () => {
    try {
      const response = await axios.get(`${url}/city/get-city`);
      setcityname(response.data);
      setFilteredCityname(response.data); // Initialize filtered list
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredCityname.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredCityname]);

  const currentData = filteredCityname.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
  let filtered = [];

  if (value.trim() === "") {
    filtered = cityname;
  } else {
    filtered = cityname.filter((city) => {
      if (field === "added_by") {
        return "registration admin".includes(value.toLowerCase());
      }

      return city[field]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    });
  }

  setFilteredCityname(filtered);
  setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  setCurrentPage(0);
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST request to your backend API
      const response = await axios.post(`${url}/city/post-city`, formData);
    

      setSuccessMessage("City added successfully.");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      fetchcityname();

      // Clear form after submission
      setFormData({
        cityname: "",
        added_by: id,
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`${url}/city/delete-city/${selectedcitynameId}`);
    
      // Set success message
      setSuccessMessage("cityname deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the cityname list after deletion
      fetchcityname();

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
   
    setSelectedcitynameId(cityname.id);
    setEditcityname(cityname);

    setFormData({
      cityname: cityname.name,
      added_by: id,
    });

    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/city/put-city/${selectedcitynameId}`,
        formData
      );
    

      fetchcityname();

      setShowEditModal(false);
      setSuccessMessage("City updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setFormData({
        cityname: "",
        added_by: id,
      });
    } catch (error) {
      console.error(
        `Error updating cityname with ID ${selectedcitynameId}:`,
        error
      );
    } finally {
      setFormData({
        cityname: "",
        added_by: id,
      });
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
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet); // Convert sheet to JSON

      // Ensure 'id' is available
      if (!id) {
        console.error("Error: 'id' is not defined.");
        return;
      }

      // Add 'added_by' field
      const dataWithAddedBy = data.map((row) => ({
        name: row.name,
        added_by: id, // Ensure `id` is defined in the state
      }));

      try {
        // POST data to API
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/post-city`,
          { bulkData: dataWithAddedBy }
        );
       
        setSuccessMessage("Cities uploaded successfully");

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
        // Refresh the country list
        const newResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/get-city`
        );
        setFilteredCityname(newResponse.data);
        setcityname(newResponse.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };
const handleExportToExcel = () => {
  const dataToExport = filteredCityname.map((item) => ({
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
  XLSX.utils.book_append_sheet(workbook, worksheet, "City");

  XLSX.writeFile(workbook, "City_List.xlsx");
};

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
              <h5 className="m-0 fw-bold ">City List</h5>
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
                  <i className="fas fa-plus"></i> Add City
                </button>

                {/* Upload City List Button */}
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
                  <i className="fas fa-upload"></i> Upload City List
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
                      label: "City Name",
                      placeholder: "Search City Name",
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
                  currentData.map((cityname) => (
                    <tr key={cityname.id}>
                      {/* <td>{cityname.id}</td> */}
                      <td>{cityname.name}</td>
                      {/* <td>{cityname.added_by}</td> */}
                      <td>Registration Admin</td>
                      <td>{formatDate(cityname.created_at)}</td>
                      <td>{formatDate(cityname.updated_at)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEditClick(cityname)}
                            title="Edit City"
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setSelectedcitynameId(cityname.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete City"
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleShowHistory("city", cityname.id)
                            }
                            title="History Sample"
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
                      No City Available
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
                        {showAddModal ? "Add City" : "Edit City"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          setFormData({
                            cityname: "",
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
                          {showAddModal ? "Save" : "Update City"}
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
                                <b>City:</b> {created_name} was <b>added</b> by
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
                                  <b>City:</b> {updated_name} was <b>updated</b>{" "}
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

export default CityArea;
