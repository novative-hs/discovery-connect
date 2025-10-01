import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faQuestionCircle,
  faExchangeAlt,
  faDollarSign,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { getsessionStorage } from "@utils/sessionStorage";
import Barcode from "react-barcode";
import Pagination from "@ui/Pagination";
import NiceSelect from "@ui/NiceSelect";
import InputMask from "react-input-mask";

const PooledSampleArea = () => {
  const id = sessionStorage.getItem("userID");

  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState(samples);

  const [selectedLogoUrl, setSelectedLogoUrl] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;
  const [totalPages, setTotalPages] = useState(0);

  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({});
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);


  // Add state for sample details modal
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  const tableHeaders = [
    { label: "Patient Name", key: "PatientName" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Location", key: "locationids" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result", key: "TestResult" },
    { label: "Volume", key: "volume" },
    // { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Sample Mode", key: "samplemode" },
  ];

  const fieldsToShowInOrder = [
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
  ];

  // Function to open sample details modal
  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowSampleModal(true);
  };

  // Function to close sample details modal
  const closeModal = () => {
    setShowSampleModal(false);
    setSelectedSample(null);
  };

  const openPatientModal = (sample) => {
  setSelectedPatient(sample);
  setShowPatientModal(true);
};

const closePatientModal = () => {
  setShowPatientModal(false);
  setSelectedPatient(null);
};


   // Fetch samples from the backend with multiple filters
// Fetch samples function mein error handling improve karo
const fetchSamples = useCallback(async (page = 1, pageSize = 50, filters = {}) => {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getsamplesPooled/${id}?page=${page}&pageSize=${pageSize}`;
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key].trim() !== '') {
        url += `&${key}=${encodeURIComponent(filters[key])}`;
      }
    });

    console.log("API URL:", url);

    const response = await axios.get(url);
    const { samples, totalCount, pageSize: serverPageSize } = response.data;

    setSamples(samples);
    setFilteredSamples(samples);
    setTotalPages(Math.ceil(totalCount / pageSize));
    setTotalCount(totalCount);
    setPageSize(serverPageSize);
  } catch (error) {
    console.error("Error fetching samples:", error);
    // Error case mein empty array set karo
    setSamples([]);
    setFilteredSamples([]);
    setTotalPages(0);
    setTotalCount(0);
  }
}, [id]);

  // Fetch samples from backend when component loads
 useEffect(() => {
  let isMounted = true;
  const storedUser = getsessionStorage("user");

  fetchSamples(currentPage + 1, itemsPerPage, filters); 

  return () => {
    isMounted = false;
  };
}, [currentPage, filters, fetchSamples]); 

  const currentData = filteredSamples;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust down if needed
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (event) => {
    const selectedPage = event.selected;
    setCurrentPage(selectedPage);
  };

  // Filter the researchers list
 const handleFilterChange = (field, value) => {
  setFilters(prevFilters => ({
    ...prevFilters,
    [field]: value
  }));
  setCurrentPage(0); // Reset to first page when filter changes
};

  if (id === null) {
    return <div>Loading...</div>;
  }

  return (
  <section className="profile__area pt-30 pb-120">
    <div className="container-fluid px-md-4">

      {/* Table */}
      <div className="table-responsive w-100">
        <table className="table table-bordered table-hover text-center align-middle w-auto border">
          <thead className="table-primary text-dark">
            <tr className="text-center">
              {tableHeaders.map(({ label, key }, index) => (
                <th
                  key={index}
                  className="px-2"
                  style={{ minWidth: "120px", whiteSpace: "nowrap" }}
                >
                  <div className="d-flex flex-column align-items-center">
                    <input
                      type="text"
                      className="form-control bg-light border form-control-sm text-center shadow-none rounded w-100"
                      placeholder={`Search ${label}`}
                      value={filters[key] || ""}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      style={{ minWidth: "110px" }}
                    />
                    <span
                      className="fw-bold mt-1 text-center fs-6"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-light">
            {currentData.length > 0 ? (
              currentData.map((sample) => (
                <tr key={sample.id}>
                  {tableHeaders.map(({ key }, index) => (
                    <td
                      key={index}
                      className={
                        key === "price"
                          ? "text-end"
                          : key === "Analyte" || key === "PatientName"
                          ? "text-start"
                          : "text-center text-truncate"
                      }
                      style={{
                        maxWidth: "150px",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {key === "PatientName" ? (
                        <span
                          className="text-primary fw-semibold fs-6 text-decoration-underline"
                          role="button"
                          title="Patient Details"
                          onClick={() => openPatientModal(sample)}
                          style={{
                            cursor: "pointer",
                            transition: "color 0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                          onMouseOut={(e) => (e.target.style.color = "")}
                        >
                          {sample.PatientName || "----"}
                        </span>
                      ) : key === "Analyte" ? (
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
                          {sample.Analyte || "----"}
                        </span>
                      ) : (
                        (() => {
                          if (key === "locationids") {
                            const tooltip = `Room Number=${sample.room_number || "----"} 
                                             Freezer ID=${sample.freezer_id || "----"} 
                                             Box ID=${sample.box_id || "----"} `;

                            const handleLogoClick = () => {
                              const logo =
                                typeof sample.logo === "string"
                                  ? sample.logo
                                  : sample.logo?.data
                                  ? URL.createObjectURL(
                                      new Blob(
                                        [new Uint8Array(sample.logo.data)],
                                        { type: "image/png" }
                                      )
                                    )
                                  : null;
                              if (logo) {
                                setSelectedLogoUrl(logo);
                                setShowLogoModal(true);
                              }
                            };
                            return (
                              <span
                                title={tooltip}
                                style={{
                                  cursor: "help",
                                  textDecoration: "underline",
                                  color: "#007bff",
                                }}
                                onClick={handleLogoClick}
                              >
                                {sample.locationids || "----"}
                              </span>
                            );
                          } else if (key === "volume") {
                            return `${sample.volume} ${sample.VolumeUnit || ""}`;
                          } else if (key === "age") {
                            if (!sample.age || sample.age === 0) {
                              return "-----";
                            }
                            return `${sample.age} years`;
                          } else if (key === "TestResult") {
                            if (!sample.TestResult && !sample.TestResultUnit) {
                             return "-----";
                            }
                             return `${sample.TestResult || ""} ${sample.TestResultUnit || ""}`.trim();
                          } else if (key === "price") {
                            return sample.price && sample.SamplePriceCurrency
                              ? `${sample.price} ${sample.SamplePriceCurrency}`
                              : "----";
                          } else {
                            return sample[key] || "----";
                          }
                        })()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center">
                  {Object.values(filters).some(
                    (filter) => filter && filter.trim() !== ""
                  )
                    ? "No Samples Available"
                    : "No samples available in the pooled area"}
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

      {/* Modal to show Sample Picture */}
      {showLogoModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog"
            style={{ marginTop: "80px" }}
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sample Picture</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body text-center">
                {selectedLogoUrl ? (
                  <img
                    src={selectedLogoUrl}
                    alt="Sample Logo"
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  />
                ) : (
                  <p>No logo available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Details Modal */}
      {showSampleModal && selectedSample && (
        <Modal
          show={showSampleModal}
          onHide={closeModal}
          size="lg"
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">
              Sample Details - {selectedSample.Analyte || "Unknown"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{ maxHeight: "500px", overflowY: "auto" }}
            className="bg-light rounded"
          >
            {(() => {
              const validFields = fieldsToShowInOrder.filter(({ key }) => {
                const value = selectedSample[key];
                return value !== undefined && value !== null && value !== "";
              });

              if (validFields.length === 0) {
                return (
                  <div className="text-center text-muted p-3">
                    No sample detail to show
                  </div>
                );
              }

              return (
                <div className="p-3">
                  <div className="row g-3">
                    {validFields.map(({ key, label }) => (
                      <div className="col-md-6" key={key}>
                        <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                          <span className="text-muted small fw-bold mb-1">
                            {label}
                          </span>
                          <span className="fs-6 text-dark">
                            {selectedSample[key]?.toString() || "----"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </Modal.Body>
        </Modal>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <Modal
          show={showPatientModal}
          onHide={closePatientModal}
          size="lg"
          centered
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">
              Patient Details - {selectedPatient.PatientName || "Unknown"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body
            style={{ maxHeight: "500px", overflowY: "auto" }}
            className="bg-light rounded"
          >
            <div className="p-3">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                    <span className="text-muted small fw-bold mb-1">
                      Patient Location
                    </span>
                    <span className="fs-6 text-dark">
                      {selectedPatient.PatientLocation || "----"}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                    <span className="text-muted small fw-bold mb-1">
                      MR Number
                    </span>
                    <span className="fs-6 text-dark">
                      {selectedPatient.MRNumber || "----"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="border-0"></Modal.Footer>
        </Modal>
      )}
    </div>
  </section>
);

};

export default PooledSampleArea;