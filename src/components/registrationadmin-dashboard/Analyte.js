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
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    added_by: id,
    testresultunit_id: "",
    image: "",
    low_min: "",
    low_max: "",
    medium_min: "",
    medium_max: "",
    high_min: "",
    high_max: "",
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
        const response = await axios.get(
          `${url}/samplefields/get/analyte`
        );
        setAnalytename(response.data);
        setFilteredAnalytename(response.data); // Initialize filtered list
      } catch (error) {
        console.error("Error fetching Analyte:", error);
      }
    };
    fetchTestResultUnit()
    fetchAnalytename(); // Call the function when the component mounts
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

  const currentData = filteredAnalytename.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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
    let filtered = [];

    if (value.trim() === "") {
      filtered = Analytename; // Show all if filter is empty
    } else {
      filtered = Analytename.filter((Analyte) => {
        let fieldValue = Analyte[field];

        if (field === "added_by") {
          // Convert numeric ID to a readable string for comparison
          const addedByLabel =
            fieldValue === 1 ? "registration admin" : fieldValue.toString();
          return addedByLabel.toLowerCase().includes(value.toLowerCase());
        }

        return fieldValue
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
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
        image: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };



  const handleSubmit = async (e) => {
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("added_by", formData.added_by);
    payload.append("testresultunit_id", formData.testresultunit_id);
    payload.append("image", formData.image); // must be a File object
    payload.append("low_min", formData.low_min);
    payload.append("low_max", formData.low_max);
    payload.append("medium_min", formData.medium_min);
    payload.append("medium_max", formData.medium_max);
    payload.append("high_min", formData.high_min);
    payload.append("high_max", formData.high_max);

    e.preventDefault();
    try {


      await axios.post(`${url}/samplefields/post-analytes/analyte`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const response = await axios.get(`${url}/samplefields/get/analyte`);
      setFilteredAnalytename(response.data);
      setAnalytename(response.data);
      setSuccessMessage("Analyte added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      setFormData({
        name: "",
        added_by: id,
        testresultunit_id: "",
        image: "",
        low_min: "",
        low_max: "",
        medium_min: "",
        medium_max: "",
        high_min: "",
        high_max: "",
      });

      setLogoPreview(false);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding Analyte", error);
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
      low_min: Analytename.low_minconcentration || "",
      low_max: Analytename.low_maxconcentration || "",
      medium_min: Analytename.medium_minconcentration || "",
      medium_max: Analytename.medium_maxconcentration || "",
      high_min: Analytename.high_minconcentration || "",
      high_max: Analytename.high_maxconcentration || "",
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

      if (formData.testresultunit_id) {
        form.append("testresultunit_id", formData.testresultunit_id);
      }

      if (formData.image instanceof File) {
        form.append("image", formData.image);
      }
      form.append("low_min", formData.low_min);
      form.append("low_max", formData.low_max);
      form.append("medium_min", formData.medium_min);
      form.append("medium_max", formData.medium_max);
      form.append("high_min", formData.high_min);
      form.append("high_max", formData.high_max);


      await axios.put(
        `${url}/samplefields/put-samplefields/analyte/${selectedAnalyteId}`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const response = await axios.get(`${url}/samplefields/get/analyte`);
      setFilteredAnalytename(response.data);
      setAnalytename(response.data);
      setShowEditModal(false);
      setSuccessMessage("Analyte updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      setFormData({
        name: "",
        added_by: id,
        testresultunit_id: "",
        image: "",
        low_min: "",
        low_max: "",
        medium_min: "",
        medium_max: "",
        high_min: "",
        high_max: "",
      });

      setLogoPreview(false);
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

    const reader = new FileReader();
    reader.onload = async (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      const payload = data.map((row) => ({ name: row.name, added_by: id }));

      try {
        await axios.post(`${url}/samplefields/post-analytes/analyte`, { bulkData: payload });
        const response = await axios.get(`${url}/samplefields/get/analyte`);
        setFilteredAnalytename(response.data);
        setAnalytename(response.data);
        setSuccessMessage("Successfully added")
      } catch (error) {
        console.error("Error uploading file", error);
      }
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
                {currentData.length > 0 ? (
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
                    <td colSpan="6" className="text-center">
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
                  top: "60px",
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
                            testresultunit_id: "",
                            image: "",
                            low_min: "",
                            low_max: "",
                            medium_min: "",
                            medium_max: "",
                            high_min: "",
                            high_max: "",
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
                          <div className="row mt-2">
                            {/* Low Range */}
                            <div className="col-md-12 mb-3">
                              <label className="fw-bold">Low Range</label>
                              <div className="d-flex gap-2">
                                <input
                                  type="number"
                                  className="form-control"
                                  name="low_min"
                                  placeholder="Low Min"
                                  value={formData.low_min}
                                  onChange={handleInputChange}
                                  required
                                />
                                <input
                                  type="number"
                                  className="form-control"
                                  name="low_max"
                                  placeholder="Low Max"
                                  value={formData.low_max}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* Medium Range */}
                            <div className="col-md-12 mb-3">
                              <label className="fw-bold">Medium Range</label>
                              <div className="d-flex gap-2">
                                <input
                                  type="number"
                                  className="form-control"
                                  name="medium_min"
                                  placeholder="Medium Min"
                                  value={formData.medium_min}
                                  onChange={handleInputChange}
                                  required
                                />
                                <input
                                  type="number"
                                  className="form-control"
                                  name="medium_max"
                                  placeholder="Medium Max"
                                  value={formData.medium_max}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* High Range */}
                            <div className="col-md-12 mb-3">
                              <label className="fw-bold">High Range</label>
                              <div className="d-flex gap-2">
                                <input
                                  type="number"
                                  className="form-control"
                                  name="high_min"
                                  placeholder="High Min"
                                  value={formData.high_min}
                                  onChange={handleInputChange}
                                  required
                                />
                                <input
                                  type="number"
                                  className="form-control"
                                  name="high_max"
                                  placeholder="High Max"
                                  value={formData.high_max}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>


                        </div>

                       
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
