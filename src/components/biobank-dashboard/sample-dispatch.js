import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";

const BioBankSampleDispatchArea = () => {
  const id = sessionStorage.getItem("userID");
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [samples, setSamples] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [formData, setFormData] = useState({
    Analyte: "",
    age: "",
    gender: "",
    ethnicity: "",
    volume: 0,
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    Quantity: 1,
    VolumeUnit: "",
    SampleTypeMatrix: "",
    SmokingStatus: "",
    AlcoholOrDrugAbuse: "",
    InfectiousDiseaseTesting: "",
    InfectiousDiseaseResult: "",
    FreezeThawCycles: "",
    DateOfSampling: "",
    ConcurrentMedicalConditions: "",
    ConcurrentMedications: "",
    Analyte: "",
    TestResult: "",
    TestResultUnit: "",
    TestMethod: "",
    TestKitManufacturer: "",
    TestSystem: "",
    TestSystemManufacturer: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [transferDetails, setTransferDetails] = useState({
    receiverName: "",
  });

  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
    { label: "Volume", key: "volume" },
    { label: "Price", key: "price" },
    { label: "Currency", key: "SamplePriceCurrency" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Test Result", key: "TestResult" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
  ];

  const fieldsToShowInOrder = [
    { label: "Analyte", key: "Analyte" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
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
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
  ];

  useEffect(() => {
    if (!id) return;

    const fetchSamples = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampledispatch/get/${id}`
        );
        const apiData = response.data;

        if (apiData.data && Array.isArray(apiData.data)) {
          setFilteredSamplename(apiData.data);
          setSamples(apiData.data);
        } else {
          console.warn("Invalid response structure:", apiData);
          setSamples([]);
        }
      } catch (error) {
        console.error("Error fetching samples:", error);
        setSamples([]);
      }
    };

    fetchSamples();
  }, [id]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamplename.length / itemsPerPage));
    setTotalPages(pages);
    if (currentPage >= pages) setCurrentPage(0);
  }, [filteredSamplename, currentPage]);

  const currentData = filteredSamplename.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => setCurrentPage(event.selected);

  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples;
    } else {
      const lowerValue = value.toLowerCase();
      filtered = samples.filter((sample) => {
        if (field === "volume") {
          const combined = `${sample.volume ?? ""} ${sample.VolumeUnit ?? ""}`.toLowerCase();
          return combined.includes(lowerValue);
        }
        if (field === "TestResult") {
          const combined = `${sample.TestResult ?? ""} ${sample.TestResultUnit ?? ""}`.toLowerCase();
          return combined.includes(lowerValue);
        }
        if (field === "price") {
          const combined = `${sample.price ?? ""} ${sample.SamplePriceCurrency ?? ""}`.toLowerCase();
          return combined.includes(lowerValue);
        }
        if (field === "gender") {
          return sample.gender?.toLowerCase().startsWith(lowerValue);
        }
        return sample[field]?.toString().toLowerCase().includes(lowerValue);
      });
    }

    setFilteredSamplename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setTransferDetails({ ...transferDetails, [e.target.name]: e.target.value });
  };

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

  const handleTransferClick = (sample) => {
    setSelectedSampleId(sample.id);
    setShowReceiveModal(true);
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    const { receiverName } = transferDetails;
    const userID = sessionStorage.getItem("userID");

    if (!receiverName || !userID) {
      alert("All fields are required.");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/post/${selectedSampleId}`,
        { receiverName, ReceivedByCollectionSite: userID }
      );

      setSuccessMessage("Sample received successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchSamples();
      setShowReceiveModal(false);
    } catch (error) {
      if (error.response) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error.request) {
        alert("No response received from server.");
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleModalClose = () => setShowReceiveModal(false);

  useEffect(() => {
    document.body.style.overflow = showReceiveModal ? "hidden" : "auto";
    document.body.classList.toggle("modal-open", showReceiveModal);
  }, [showReceiveModal]);

  if (!id) return <div>Loading...</div>;

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="row justify-content-center">
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success w-100 text-start mb-2 small">
              {successMessage}
            </div>
          )}

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
              <tbody>
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
                          style={{ maxWidth: "150px", wordWrap: "break-word", whiteSpace: "normal" }}
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
                          ) : (
                            (() => {
                              if (key === "volume") {
                                return `${sample.volume || "----"} ${sample.VolumeUnit || ""}`;
                              } else {
                                return sample[key] || "----";
                              }
                            })()
                          )}
                        </td>
                      ))}

                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-around",
                            gap: "3px",
                          }}
                        >
                          {/* <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditClick(sample)}
                              >
                                <FontAwesomeIcon icon={faEdit} size="sm" />
                              </button>{" "} */}

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleTransferClick(sample)}
                          >
                            <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={tableHeaders.length + 1}
                      className="text-center"
                    >
                      No samples available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}
          {/* Modal for receiving Samples */}
          {showReceiveModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1050,
              }}
            >
              <div
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "8px",
                  width: "90%",
                  maxWidth: "400px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  zIndex: 1100,
                }}
              >
                <h5 style={{ marginBottom: "20px", textAlign: "center" }}>
                  Receive Stock
                </h5>
                <form>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px" }}>
                      Receiver Name
                    </label>
                    <input
                      type="text"
                      name="receiverName"
                      value={transferDetails.receiverName}
                      onChange={handleInputChange}
                      placeholder="Enter Receiver Name"
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleModalClose}
                      style={{
                        padding: "10px 15px",
                        backgroundColor: "#ccc",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleTransferSubmit}
                      style={{
                        padding: "10px 15px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
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

export default BioBankSampleDispatchArea;
