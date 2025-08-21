//Analyte.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import * as XLSX from "xlsx";
const AnalyteArea = () => {
  const id = sessionStorage.getItem("userID");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAnalyteId, setSelectedAnalytenameId] = useState(null); // Store ID of City to delete
  const [logo, setLogo] = useState();
  const [selectedLogoUrl, setSelectedLogoUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const [searchParams, setSearchParams] = useState({
    name: '',
    added_by: '',
    testresultunit: '',
    status: '',
    created_at: '',
    updated_at: ''
  });

  const [formData, setFormData] = useState({
    name: "",
    added_by: id,
    testresultunit_id: "", // store the ID here
    image: ""
  });


  const [editAnalytename, setEditAnalytename] = useState(null); // State for selected City to edit
  const [Analytename, setAnalytename] = useState([]); // Store all cities
  const [testResultUnit, setTestResultUnit] = useState([]); // Store all cities
  const [filteredAnalytename, setFilteredAnalytename] = useState([]); // Store filtered cities
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  // Calculate total pages dynamically

  const [successMessage, setSuccessMessage] = useState("");
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  // Fetch City from backend when component loads
  useEffect(() => {
    const fetchAnalytename = async () => {
      try {
        const response = await axios.get(`${url}/samplefields/get/analyte`);
        // Ensure response.data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setAnalytename(data);
        setFilteredAnalytename(data);
      } catch (error) {
        console.error("Error fetching Analyte:", error);
        // Set to empty array on error
        setAnalytename([]);
        setFilteredAnalytename([]);
      }
    };
    fetchAnalytename();
    fetchTestResultUnit();
  }, [url]);

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredAnalytename.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredAnalytename, currentPage]);

  const currentData = Array.isArray(filteredAnalytename)
    ? filteredAnalytename.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    )
    : [];

  const fetchTestResultUnit = async () => {
    try {
      const response = await axios.get(
        `${url}/samplefields/get-samplefields/testresultunit`
      );
      setTestResultUnit(response.data);
    } catch (error) {
      console.error("Error fetching test result:", error);
    }
  };
  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    // Update search params state
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));

    if (!Array.isArray(Analytename)) {
      console.error("Analytename is not an array");
      return;
    }

    let filtered = Analytename;

    if (value.trim() !== "") {
      filtered = Analytename.filter((Analyte) => {
        if (!Analyte) return false;

        try {
          // Special handling for testresultunit which might be an object
          if (field === "testresultunit") {
            const unitValue = Analyte.testresultunit;
            if (!unitValue) return false;

            // Handle both object and string cases
            const unitName = typeof unitValue === 'object'
              ? unitValue.name
              : unitValue;
            return unitName?.toString().toLowerCase().includes(value.toLowerCase());
          }

          let fieldValue = Analyte[field];
          if (fieldValue === undefined || fieldValue === null) return false;

          if (field === "added_by") {
            const addedByLabel = fieldValue === 1 ? "registration admin" : fieldValue.toString();
            return addedByLabel.toLowerCase().includes(value.toLowerCase());
          }

          return fieldValue.toString().toLowerCase().includes(value.toLowerCase());
        } catch (error) {
          console.error(`Error filtering by ${field}:`, error);
          return false;
        }
      });
    }

    setFilteredAnalytename(filtered);
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
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({
        ...formData,
        image: files[0], // Handle image file
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      setSuccessMessage("Analyte name is required");
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("added_by", formData.added_by);

      // Optional fields - only append if they exist
      if (formData.testresultunit_id) {
        payload.append("testresultunit_id", formData.testresultunit_id);
      }
      if (formData.image instanceof File) {
        payload.append("image", formData.image);
      }

      const response = await axios.post(
        `${url}/samplefields/post-analytes/analyte`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh data
      const updatedResponse = await axios.get(`${url}/samplefields/get/analyte`);
      setFilteredAnalytename(updatedResponse.data);
      setAnalytename(updatedResponse.data);

      setSuccessMessage("Analyte added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      setFormData({
        name: "",
        added_by: id,
        testresultunit_id: "",
        image: ""
      });
      setLogoPreview(null);
      setShowAddModal(false);

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setSuccessMessage(`Error: ${error.response?.data?.message || "Failed to add Analyte"}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleEditClick = (Analytename) => {
    setSelectedAnalytenameId(Analytename.id);
    setEditAnalytename(Analytename);

    setFormData({
      name: Analytename.name,
      testresultunit_id: Analytename.testresultunit_id,
      added_by: id,
      image: Analytename.image,
    });

    const logoPreviewUrl =
      typeof Analytename.image === "string"
        ? Analytename.image
        : Analytename.image?.data
          ? URL.createObjectURL(
            new Blob([new Uint8Array(Analytename.image.data)], { type: "image/png" })
          )
          : null;
    setLogoPreview(logoPreviewUrl);


    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("added_by", formData.added_by);
      form.append("searchParams", JSON.stringify(searchParams));

      if (formData.testresultunit_id) {
        form.append("testresultunit_id", formData.testresultunit_id);
      }

      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }

      const response = await axios.put(
        `${url}/samplefields/put-samplefields/analyte/${selectedAnalyteId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Get the current item before update to preserve all fields
      const currentItem = Analytename.find(item => item.id === selectedAnalyteId);

      // Create updated item with all preserved fields
      const updatedItem = {
        ...currentItem,
        name: formData.name,
        testresultunit_id: formData.testresultunit_id,
        // Preserve other fields like status, created_at, etc.
        updated_at: new Date().toISOString()
      };

      // Update both state arrays
      setAnalytename(prev =>
        prev.map(item =>
          item.id === selectedAnalyteId ? updatedItem : item
        )
      );

      setFilteredAnalytename(prev =>
        prev.map(item =>
          item.id === selectedAnalyteId ? updatedItem : item
        )
      );

      setShowEditModal(false);
      setSuccessMessage("Analyte updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      setFormData({
        name: "",
        added_by: id,
        testresultunit_id: "",
        image: "",
      });
      setLogoPreview(null);
    } catch (error) {
      console.error(`Error updating Analyte with ID ${selectedAnalyteId}:`, error);
    }
  };


  const handleDelete = async () => {
    try {
      await axios.delete(
        `${url}/samplefields/delete-samplefields/analyte/${selectedAnalyteId}`
      );
      const response = await axios.get(
        `${url}/samplefields/get/analyte`
      );
      setFilteredAnalytename(response.data);
      setAnalytename(response.data);
      setSuccessMessage("Analyte deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setShowDeleteModal(false);
      setSelectedAnalytenameId(null);
    } catch (error) {
      console.error(
        `Error deleting Analyte with ID ${selectedAnalyteId}:`,
        error
      );
    }
  };

  useEffect(() => {
    const isModalOpen =
      showDeleteModal || showAddModal || showEditModal || showHistoryModal;
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset messages and set loading state
    setErrorMessage('');
    setSuccessMessage('');
    setIsUploading(true);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        // 1. Parse Excel file
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // 2. Validate data
        if (jsonData.length === 0) {
          throw new Error("Excel file is empty or couldn't be read");
        }

        // 3. Process and validate rows
        const processedData = jsonData.map(row => {
          // Support multiple possible column names (case insensitive)
          const name =
            row.name || row.Name ||
            row.analyte || row.Analyte ||
            row.parameter || row.Parameter ||
            row['Test Parameter'] || row['test parameter'] ||
            row['Analyte Name'] || row['analyte name'];

          // Validate name exists and is string
          if (!name || typeof name !== 'string' || name.trim() === '') {
            return null;
          }

          return {
            name: name.trim(),
            ...(id && { added_by: id }) // Only include if id exists
          };
        }).filter(item => item !== null); // Remove invalid rows

        if (processedData.length === 0) {
          // Provide more detailed feedback about what went wrong
          const sampleHeaders = Object.keys(jsonData[0] || {}).join(", ");
          throw new Error(
            `No valid analyte names found. Please ensure your file has a column with one of these headers: 
          name, analyte, parameter, Test Parameter, or Analyte Name.
          Detected columns: ${sampleHeaders || 'none'}`
          );
        }

        // 4. Prepare payload
        const payload = {
          bulkData: processedData
        };

        // 5. Upload to server
        const response = await axios.post(
          `${url}/samplefields/post-analytes/analyte`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        // 6. Refresh analyte list
        const getResponse = await axios.get(`${url}/samplefields/get/analyte`);
        setFilteredAnalytename(getResponse.data);
        setAnalytename(getResponse.data);

        // 7. Show success message
        setSuccessMessage(`Successfully uploaded ${processedData.length} analytes`);
        setErrorMessage(''); // Clear any previous errors

      } catch (error) {
        console.error("Upload error:", error);

        // Handle different error types
        let errorMsg = "Upload failed. Please try again.";
        if (error.response) {
          // Backend error
          errorMsg = error.response.data.message || error.response.statusText;
        } else if (error.message.includes("Unexpected token")) {
          errorMsg = "Invalid file format. Please upload a valid Excel file.";
        } else if (error.message) {
          errorMsg = error.message;
        }

        setErrorMessage(errorMsg);
        setSuccessMessage(''); // Clear any previous success messages
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read file. Please try another file.");
      setIsUploading(false);
      setSuccessMessage(''); // Clear any previous success messages
    };

    reader.readAsBinaryString(file);
  };
  const handleExportToExcel = () => {
    const dataToExport = filteredAnalytename.map((item) => ({
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analyte");

    XLSX.writeFile(workbook, "Analyte_List.xlsx");
  };
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  }
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
              <h5 className="m-0 fw-bold ">Analytes List</h5>
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
                  <i className="fas fa-plus"></i> Add Analyte
                </button>

                {/* Upload Analytename List Button */}
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
                  <i className="fas fa-upload"></i> Upload Analyte Test
                  Parameter List
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
                      label: "Analyte",
                      placeholder: "Search Analyte",
                      field: "name",
                    },
                    {
                      label: "Added By",
                      placeholder: "Search Added by",
                      field: "added_by",
                    },
                    {
                      label: "Test Result Unit",
                      placeholder: "Search testresultunit",
                      field: "testresultunit"
                    },
                    {
                      label: "Status",
                      placeholder: "Search Status",
                      field: "status",
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
                {Array.isArray(currentData) && currentData.length > 0 ? (
                  currentData.map((Analytename) => (
                    <tr key={Analytename.id}>
                      <td>{Analytename.name}</td>
                      <td>Registration Admin</td>
                      <td>{Analytename.testresultunit || "----"}</td>
                      <td>{Analytename.status}</td>
                      <td>{formatDate(Analytename.created_at)}</td>
                      <td>{formatDate(Analytename.updated_at)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEditClick(Analytename)}
                            title="Edit Analyte"
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setSelectedAnalytenameId(Analytename.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Analyte"
                          >
                            <FontAwesomeIcon icon={faTrash} size="xs" />
                          </button>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleShowHistory(
                                "Analyte",
                                Analytename.id
                              )
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
                    <td colSpan="7" className="text-center">
                      No Analyte Available
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
                        {showAddModal
                          ? "Add Analyte"
                          : "Edit Analyte"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          setLogoPreview("")
                          setFormData({
                            name: "",
                            added_by: id,
                            testresultunit_id: "", // store the ID here
                            image: ""
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
                        {/* Row: Analyte + Test Result Unit */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label>Analyte</label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label>Test Result Unit</label>
                            <select
                              className="form-control"
                              name="testresultunit_id" // 👈 match backend key if you're storing the id
                              value={formData.testresultunit_id || ""}
                              onChange={handleInputChange}
                            // required
                            >
                              <option value="">Select Unit</option>
                              {testResultUnit?.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label>
                              Analyte Image
                              <span className="text-danger"></span>
                            </label>
                            <div className="d-flex align-items-center">
                              <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className="form-control"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  setFormData({ ...formData, image: file });
                                  setLogoPreview(URL.createObjectURL(file)); // for previewing
                                }}
                              />

                              {logoPreview && (
                                <img
                                  src={logoPreview}
                                  alt="Logo Preview"
                                  width="80"
                                  style={{
                                    marginLeft: "20px",
                                    borderRadius: "5px",
                                  }}
                                />
                              )}
                            </div>
                          </div>


                        </div>

                        {/* Row: Low Label + Range Inputs */}
                        {/* <div className="mb-2">
    <label className="fw-bold">Low</label>
  </div>

  <div className="d-flex align-items-center gap-2 mb-3">
    <input
      type="number"
      className="form-control"
      name="low_min"
      placeholder="Min"
      value={formData.low_min || ""}
      onChange={handleInputChange}
      required
    />
    <span className="mx-2">to</span>
    <input
      type="number"
      className="form-control"
      name="low_max"
      placeholder="Max"
      value={formData.low_max || ""}
      onChange={handleInputChange}
      required
    />
  </div> */}
                      </div>

                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          {showAddModal
                            ? "Save"
                            : "Update Analyte"}
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
                                <b>Analyte:</b> {created_name}{" "}
                                was <b>added</b> by Registration Admin at{" "}
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
                                  <b>Analyte:</b>{" "}
                                  {updated_name} was <b>updated</b> by
                                  Registration Admin at{" "}
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
                      <h5 className="modal-title">
                        Delete Analyte
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowDeleteModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>
                        Are you sure you want to delete this Analyte?
                      </p>
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

export default AnalyteArea;