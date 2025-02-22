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
import Pagination from "@ui/Pagination"
const CountryArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("account_id on country page is:", id);
  }
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
    fetchcountryname(); // Call the function when the component mounts
  }, []);
  const fetchcountryname = async () => {
    try {
      const response = await axios.get(`${url}/country/get-country`);
      setFilteredCountryname(response.data)
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredCountryname.length / itemsPerPage));
    setTotalPages(pages);
    
    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredCountryname]);
  

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
      filtered = countryname.filter((country) =>
        country[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`);
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
      // POST request to your backend API
      const response = await axios.post(
        `${url}/country/post-country`,
        formData
      );
      console.log("Country added successfully:", response.data);

      // Refresh the countryname list after successful submission
      const newResponse = await axios.get(`${url}/country/get-country`);
      setCountryname(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        countryname: "",
        added_by: id,
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding country:", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/delete-country/${selectedcountrynameId}`
      );
      console.log(
        `countryname with ID ${selectedcountrynameId} deleted successfully.`
      );

      // Set success message
      setSuccessMessage("countryname deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the countryname list after deletion
      const newResponse = await axios.get(`${url}/country/get-country`);
      setCountryname(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setselectedcountrynameId(null);
    } catch (error) {
      console.error(
        `Error deleting country with ID ${selectedcountrynameId}:`,
        error
      );
    }
  };
    useEffect(() => {
      if (showDeleteModal || showAddModal || showEditModal ||showHistoryModal) {
        // Prevent background scroll when modal is open
        document.body.style.overflow = "hidden";
        document.body.classList.add("modal-open");
      } else {
        // Allow scrolling again when modal is closed
        document.body.style.overflow = "auto";
        document.body.classList.remove("modal-open");
      }
    }, [showDeleteModal, showAddModal, showEditModal, showHistoryModal]);
    
  const handleEditClick = (countryname) => {
    console.log("data in case of update is", countryname);
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
      const response = await axios.put(
        `${url}/country/put-country/${selectedcountrynameId}`,
        formData
      );
      console.log("countryname updated successfully:", response.data);

      const newResponse = await axios.get(`${url}/country/get-country`);
      setCountryname(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Country updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating countryname with ID ${selectedcountrynameId}:`,
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
  const resetFormData = () => {
    setFormData({ countryname: "",added_by: id, }); // Reset to empty state
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/post-country`,
          { bulkData: dataWithAddedBy }
        );
        console.log("Countries added successfully:", response.data);

        // Refresh the country list
        const newResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
        );
        setCountryname(newResponse.data);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <section className="policy__area pb-120 overflow-hidden">
      <div className="container-fluid mt-n5">
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-md-10">
            <div className="policy__wrapper policy__translate position-relative mt-5">
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
                    Add Country
                  </button>

                  {/* Upload Button (Styled as Label for Hidden Input) */}
                  <label className="btn btn-secondary mb-2">
                    Upload Country List
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
              <div className="table-responsive w-100">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr className="text-center">
                      {[
                        { label: "ID", placeholder: "Search ID", field: "id" },
                        {
                          label: "Country Name",
                          placeholder: "Search Country Name",
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
                      currentData.map((countryname) => (
                        <tr key={countryname.id}>
                          <td>{countryname.id}</td>
                          <td>{countryname.name}</td>
                          <td>{countryname.added_by}</td>
                          <td>{formatDate(countryname.created_at)}</td>
                          <td>{formatDate(countryname.updated_at)}</td>
                          <td>
                          <div className="d-flex justify-content-around gap-2">
                            <button
                              className="btn btn-success btn-sm py-0 px-1"
                              onClick={() => handleEditClick(countryname)}
                              title="Edit Country" // This is the text that will appear on hover
                            >
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>{" "}
                            <button
                              className="btn btn-danger btn-sm py-0 px-1"
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
                              onClick={() => handleShowHistory("country", countryname.id)} 
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
          <b>Country:</b> {created_name} was <b>added</b> by Registration Admin at {moment(created_at).format("DD MMM YYYY, h:mm A")}
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
            <b>Country:</b> {updated_name} was <b>updated</b> by Registration Admin at {moment(updated_at).format("DD MMM YYYY, h:mm A")}
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

export default CountryArea;
