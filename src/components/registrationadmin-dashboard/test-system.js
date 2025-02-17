import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
const TestSystemArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("account_id on Test System page is:", id);
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTestSystemnameId, setSelectedTestSystemnameId] =useState(null); // Store ID of Plasma to delete
  const [formData, setFormData] = useState({
    testsystemname: "",
    added_by: id,
  });
  const [editTestSystemname, setEditTestSystemname] =
    useState(null); // State for selected TestMethod to edit
  const [testsystemname, setTestSystemname] = useState([]); // State to hold fetched City
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(testsystemname.length / itemsPerPage);
  // Api Path
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch TestMethod from backend when component loads
  useEffect(() => {
    fetchTestSystemname(); // Call the function when the component mounts
  }, []);
  const fetchTestSystemname = async () => {
    try {
      const response = await axios.get(
        `${url}/testsystem/get-testsystem`
      );
      setTestSystemname(response.data); // Store fetched TestMethod in state
    } catch (error) {
      console.error("Error fetching Test System :", error);
    }
  };

  const currentData = testsystemname.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchTestSystemname(); // Reset to fetch original data
    } else {
      // Filter the sample array based on the field and value
      const filtered = testsystemname.filter((testsystem) =>
        testsystem[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setTestSystemname(filtered); // Update the state with filtered results
    }
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
        `${url}/testsystem/post-testsystem`,
        formData
      );
      console.log("Test System added successfully:", response.data);
      setSuccessMessage("Test System Name deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchTestSystemname();
      // Clear form after submission
      setFormData({
        testsystemname: "",
        added_by: id,
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Test System ", error);
    }
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/testsytem/delete-testsystem/${selectedTestSystemnameId}`
      );
      console.log(
        `Test System name with ID ${selectedTestSystemnameId} deleted successfully.`
      );

      // Set success message
      setSuccessMessage("Test System Name deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the cityname list after deletion
      const newResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/testsystem/get-testsystem`
      );
      setTestSystemname(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedTestSystemnameId(null);
    } catch (error) {
      console.error(
        `Error deleting Test System with ID ${selectedTestSystemnameId}:`,
        error
      );
    }
  };

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

  const handleEditClick = (testsystemname) => {
    console.log("data in case of update is", testsystemname);

    setSelectedTestSystemnameId(testsystemname.id);
    setEditTestSystemname(testsystemname);

    setFormData({
      testsystemname: testsystemname.name,
      added_by: id,
    });

    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/testsystem/put-testsystem/${selectedTestSystemnameId}`,
        formData
      );
      console.log(
        "Test System Name updated successfully:",
        response.data
      );

      fetchTestSystemname();

      setShowEditModal(false);
      setSuccessMessage("Test System updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating Test System name with ID ${selectedTestSystemnameId}:`,
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
          `${url}/testsystem/post-testsystem`,
          { bulkData: dataWithAddedBy }
        );
        console.log("Test System added successfully:", response.data);

        fetchTestSystemname();
      } catch (error) {
        console.error("Error adding Test System :", error);
      }
    };

    reader.readAsBinaryString(file);
  };

  const resetFormData = () => {
    setFormData({
      testsystemname: "",
    });
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
                    Add Test System
                  </button>

                  {/* Upload Button (Styled as Label for Hidden Input) */}
                  <label className="btn btn-secondary mb-2">
                    Upload Test System List
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
                          label: "Test System Name",
                          placeholder: "Search Test System Name",
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
                                  title="Edit Test System"
                                >
                                  <FontAwesomeIcon icon={faEdit} size="xs" />
                                </button>
                                <button
                                  className="btn btn-danger btn-sm py-0 px-1"
                                  onClick={() => {
                                    setSelectedTestSystemnameId(id);
                                    setShowDeleteModal(true);
                                  }}
                                  title="Delete Test System"
                                >
                                  <FontAwesomeIcon icon={faTrash} size="sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No Test System Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="pagination d-flex justify-content-end align-items-center mt-3 w-100">
                <nav aria-label="Page navigation example" className="w-100">
                  <ul className="pagination justify-content-end w-100">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Previous"
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                      >
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">Previous</span>
                      </a>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                        >
                          <a
                            className="page-link"
                            href="#"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </a>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Next"
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                      >
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

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
                              ? "Add Test System"
                              : "Edit Test System"}
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
                              <label>Test System Name</label>
                              <input
                                type="text"
                                className="form-control"
                                name="testsystemname" // Fix here
                                value={formData.testsystemname}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="modal-footer">
                            <button type="submit" className="btn btn-primary">
                              {showAddModal
                                ? "Save"
                                : "Update Test System"}
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
                            Delete Test System
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowDeleteModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <p>
                            Are you sure you want to delete this Test System?
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestSystemArea;
