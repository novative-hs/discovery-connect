import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import { getsessionStorage } from "@utils/sessionStorage";
import Pagination from "@ui/Pagination";

const BioBankSampleArea = () => {
  const id = sessionStorage.getItem("userID");
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState(samples);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fieldsToShowInOrder = [
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
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

  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
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


  const itemsPerPage = 10;

  useEffect(() => {
    const storedUser = getsessionStorage("user");

    const fetchAndStoreSamples = async () => {
      const sampleData = await fetchSamples();
      setSamples(sampleData);
      setFilteredSamples(sampleData);
    };

    fetchAndStoreSamples();
  }, []);

  const fetchSamples = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getQuarantineStock`
      );

      const ownSamples = response.data.map((sample) => ({
        ...sample,
        quantity: Number(sample.quantity) || 0,
      }));

      return ownSamples;
    } catch (error) {
      console.error("Error fetching samples:", error);
      return [];
    }
  };

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamples.length / itemsPerPage));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredSamples, currentPage]);

  const currentData = filteredSamples.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples;
    } else {
      const lowerValue = value.toLowerCase();

      filtered = samples.filter((sample) => {
        if (field === "volume") {
          const combinedVolume = `${sample.volume ?? ""} ${sample.VolumeUnit ?? ""
            }`.toLowerCase();
          return combinedVolume.includes(lowerValue);
        }
        if (field === "TestResult") {
          const combinedVolume = `${sample.TestResult ?? ""} ${sample.TestResultUnit ?? ""
            }`.toLowerCase();
          return combinedVolume.includes(lowerValue);
        }

        if (field === "price") {
          const combinedPrice = `${sample.price ?? ""} ${sample.SamplePriceCurrency ?? ""
            }`.toLowerCase();
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

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/delete/${selectedSampleId}`
      );
     
      const sampleData = await fetchSamples();
      setSamples(sampleData);
      setFilteredSamples(sampleData);

      setShowDeleteModal(false);
      setSelectedSampleId(null);
    } catch (error) {
      console.error(
        `Error deleting sample with ID ${selectedSampleId}:`,
        error
      );
    }
  };


  useEffect(() => {
    if (
      showDeleteModal ||
      showHistoryModal

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
    showDeleteModal,
    showHistoryModal,

  ]);

  const openModal = (sample) => {

    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-sample-history/${id}`
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

  if (id === null) {
    return <div>Loading...</div>;
  }
  return (
    <section className="profile__area pt-30 pb-120">
      <div className="container-fluid px-md-4">
        <div
          className="text-danger fw-bold"
          style={{ marginTop: "-20px", marginBottom: "20px" }}>
          <h6>Note: Click the delete icon to permanently remove the sample from stock.</h6>

        </div>
        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-auto border">
            <thead className="table-primary text-dark">
              <tr className="text-center">
               {tableHeaders.map(({ label, key }, index) => (
  <th key={index} className="px-2" style={{ minWidth: "120px", whiteSpace: "nowrap" }}>
    <div className="d-flex flex-column align-items-center">
      <input
        type="text"
        className="form-control bg-light border form-control-sm text-center shadow-none rounded w-100"
        placeholder={`Search ${label}`}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        style={{ minWidth: "110px" }}
      />
      <span className="fw-bold mt-1 text-center fs-6" style={{ whiteSpace: "nowrap" }}>
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
              {currentData.length > 0 ? (
                currentData.map((sample) => (
                  <tr key={sample.id}>
                    {tableHeaders.map(({ key }, index) => (
                      <td
                        key={index}
                        className={
                          key === "price"
                            ? "text-end"
                            : key === "Analyte"
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
                        {key === "Analyte" ? (
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
                        ) : key === "volume" ? (
                          `${sample.volume || "----"} ${sample.VolumeUnit || ""}`
                        ) : key === "age" ? (
                          `${sample.age || "----"} years`
                        ) : key === "TestResult" ? (
                          `${sample.TestResult || "----"} ${sample.TestResultUnit || ""}`
                        ) : key === "price" ? (
                          sample.price && sample.SamplePriceCurrency
                            ? `${sample.price} ${sample.SamplePriceCurrency}`
                            : "----"
                        ) : (
                          sample[key] || "----"
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="d-flex justify-content-center gap-3">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setSelectedSampleId(sample.id);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Sample"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleShowHistory("sample", sample.id)}
                          title="History"
                        >
                          <i className="fa fa-history"></i>
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

        {showDeleteModal && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(5px)" }}
            ></div>
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
                    <h5 className="modal-title">Delete Sample</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowDeleteModal(false)}
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
                  <div className="modal-body">
                    <p>Are you sure you want to delete this sample?</p>
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
        {/* Modal for History of Samples */}
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
                        // Only include the desired fields
                        const filteredLog = {
                          sample_visibility: log.sample_visibility,
                          comment: log.comments,
                          created_at: log.created_at,
                          updated_at: log.updated_at,

                        };

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
                              {Object.entries(filteredLog).map(([key, value]) => (
                                <div key={key}>
                                  <b>{key.replace(/_/g, " ")}:</b> {value}
                                </div>
                              ))}
                            </div>
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
