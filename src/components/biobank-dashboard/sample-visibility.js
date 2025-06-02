import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon, } from "@fortawesome/react-fontawesome";
import {
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import { getsessionStorage } from "@utils/sessionStorage";
import Pagination from "@ui/Pagination";

const BioBankSampleArea = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>;
  } else {
    console.log("Collection site Id on sample page is:", id);
  }
  const [formData, setFormData] = useState({
    sample_visibility: "",
    added_by: id,
  });
  const [selectedSampleName, setSelectedSampleName] = useState('')
  const [selectedSampleVolume, setSelectedSampleVolume] = useState('')
  const [selectedSampleUnit, setSelectedSampleUnit] = useState('')
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSample, setEditSample] = useState(null);

  const fieldsToShowInOrder = [
    { label: "Disease Name", key: "diseasename" },
    { label: "Test Result Unit", key: "TestResultUnit" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },

  ];
  const tableHeaders = [
    { label: "Disease Name", key: "diseasename" },
    { label: "Volume", key: "volume" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Price", key: "price" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Test Result", key: "TestResult" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
  ];
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [filter, setFilter] = useState(""); // State for dropdown selection
  const [filtertotal, setfiltertotal] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const storedUser = getsessionStorage("user");
    fetchSamples(currentPage + 1, itemsPerPage, filter); // Call the function when the component mounts
  }, [currentPage]);

  // Fetch samples from the backend
  const fetchSamples = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { priceFilter, searchField, searchValue } = filters;

      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getsamples/${id}?page=${page}&pageSize=${pageSize}`;

      if (priceFilter) url += `&priceFilter=${priceFilter}`;
      if (searchField && searchValue) url += `&searchField=${searchField}&searchValue=${searchValue}`;

      const response = await axios.get(url);
      const { samples, totalCount } = response.data;
      console.log(samples)
      setSamples(samples);
      setFilteredSamples(samples);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setfiltertotal(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };


  useEffect(() => {

    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [currentPage, totalPages]);

  // Get the current data for the table
  const currentData = filteredSamples

  const handlePageChange = (event) => {
    const selectedPage = event.selected;
    setCurrentPage(selectedPage);
  };

  const handleFilterChange = (field, value) => {
  let filtered = [];

  if (value.trim() === "") {
    filtered = samples;
  } else {
    const lowerValue = value.toLowerCase();

    filtered = samples.filter((sample) => {
      if (field === "volume") {
        const combinedVolume = `${sample.volume ?? ""} ${sample.QuantityUnit ?? ""}`.toLowerCase();
        return combinedVolume.includes(lowerValue);
      }

      if (field === "price") {
        const combinedPrice = `${sample.price ?? ""} ${sample.SamplePriceCurrency ?? ""}`.toLowerCase();
        return combinedPrice.includes(lowerValue);
      }

      if (field === "gender") {
        return sample.gender?.toLowerCase().startsWith(lowerValue); // safe partial match
      }

      return sample[field]?.toString().toLowerCase().includes(lowerValue);
    });
  }

  setFilteredSamples(filtered);
  setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  setCurrentPage(0);
};

  const handleEditClick = async (e) => {
    e.preventDefault(); // Prevent form from reloading page

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/UpdateSampleStatus/${selectedSampleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error("Failed to update sample status.");
      }

      const data = await response.json();
      console.log("Update successful:", data);

      setShowEditModal(false);

      // ✅ Optional: Refresh the sample list
      const updatedSamples = await fetchSamples();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  useEffect(() => {
    if (
      showEditModal

    ) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [
    showEditModal,

  ]);

  const openEditModal = (sample) => {
    setSelectedSampleName(sample.diseasename)
    setSelectedSampleUnit(sample.QuantityUnit)
    setSelectedSampleVolume(sample.volume)
    setSelectedSampleId(sample.id);
    setEditSample(sample);
    setFormData({
      sample_visibility: sample.sample_visibility || "",
      added_by: id,
    });
    setShowEditModal(true);
  };

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  return (
    <section className="profile__area pt-30 pb-120">
      <div className="container-fluid px-md-4">
        <div
          className="text-danger fw-bold"
          style={{ marginTop: "-20px", marginBottom: "20px" }}>
          <h6>Note: Make the Samples Public or Private through the Edit Icon.</h6>
        </div>

        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-100 border">
            <thead className="table-primary text-dark">
              <tr className="text-center">
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">

                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                        placeholder={`Search ${label}`}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "100px", maxWidth: "130px", width: "100px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
                        {label}
                      </span>

                    </div>
                  </th>
                ))}
                <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="table-light">
              {Array.isArray(currentData) && currentData.length > 0 ? (
                currentData.map((sample) => (
                  <tr key={sample.id}>
                    {tableHeaders.map(({ key }, index) => (
                      <td
                        key={index}
                        className={
                          key === "price"
                            ? "text-end"
                            : key === "diseasename"
                              ? "text-start"
                              : "text-center text-truncate"
                        }
                        style={{
                          maxWidth: "150px",
                          overflowWrap: "break-word",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}
                      >
                        {key === "diseasename" ? (
                          <span
                            className="sample-name text-primary fw-semibold fs-6 text-decoration-underline"
                            role="button"
                            title="Sample Details"
                            onClick={() => openModal(sample)}
                            style={{
                              cursor: "pointer",
                              transition: "color 0.2s",
                            }}
                            onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                            onMouseOut={(e) => (e.target.style.color = "")}
                          >
                            {sample.diseasename || "----"}
                          </span>
                        ) : key === "volume" ? (
                          `${sample.volume || "----"} ${sample.QuantityUnit || ""}`
                        ) : key === "price" ? (
                          sample.price && sample.SamplePriceCurrency ? (
                            `${sample.price} ${sample.SamplePriceCurrency}`
                          ) : (
                            "----"
                          )
                        ) : (
                          sample[key] || "----"
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="d-flex justify-content-center gap-3">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => openEditModal(sample)}
                          title="Edit Sample Status"
                        >
                          <FontAwesomeIcon icon={faEdit} size="xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No samples available
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

        {showEditModal && (
          <>
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
                      <h5 className="modal-title">{selectedSampleName} -{selectedSampleVolume}{selectedSampleUnit}</h5>
                    </h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => {
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
                    onSubmit={handleEditClick}
                  >
                    <div className="modal-body">
                      {/* Form Fields */}
                      <div className="form-group">
                        <label>Sample Status</label>
                        <select
                          className="form-control"
                          name="sample_visibility"
                          value={formData.sample_visibility}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Sample Status</option>
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                    </div>

                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">
                        Update Sample
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
      <Modal show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"> Sample Details</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }} className="bg-light rounded">
          {selectedSample ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ key, label }) => {
                  const value = selectedSample[key];
                  if (value === undefined) return null;

                  return (
                    <div className="col-md-6" key={key}>
                      <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">{label}</span>
                        <span className="fs-6 text-dark">{value?.toString() || "----"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted p-3">No details to show</div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0"></Modal.Footer>
      </Modal>
    </section>
  );
};

export default BioBankSampleArea;
