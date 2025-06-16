import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";

const SampleDispatchArea = () => {
  const id = sessionStorage.getItem("userID");

  const [staffAction, setStaffAction] = useState("");
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete
  const [selectedSampleTransfer, setSelectedSampleTransfer] = useState(null); // Store ID of sample to delete
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSample, setSelectedSample] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [transferDetails, setTransferDetails] = useState({
    receiverName: "",
  });
  const [step, setStep] = useState(1);
  const [lostReason, setLostReason] = useState("");
  const [sampleReceive, setSampleReceive] = useState();
  const [formData, setFormData] = useState({
    Analyte: "",
    age: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    Quantity: "",
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
    // logo: ""
  });

  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
    { label: "Volume", key: "volume" },
    { label: "Gender", key: "gender" },
    { label: "Age", key: "age" },
    { label: "Test Result & Unit", key: "TestResult" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
  ];

  const fieldsToShowInOrder = [
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
  ];


  useEffect(() => {
    const action = sessionStorage.getItem("staffAction");
    setStaffAction(action);
  }, []);

  const itemsPerPage = 10;

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

  useEffect(() => {
    if (showReceiveModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showReceiveModal]);

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

  useEffect(() => {
    fetchSamples();
  }, [id]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamplename.length / 10));
    setTotalPages(pages);
    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredSamplename]);

  // Get the current data for the table
  const currentData = filteredSamplename.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples;
    } else {
      const lowerValue = value.toLowerCase();

      filtered = samples.filter((sample) => {
        if (field === "volume") {
          const combinedVolume = `${sample.volume ?? ""} ${sample.VolumeUnit ?? ""}`.toLowerCase();
          return combinedVolume.includes(lowerValue);
        }

        if (field === "TestResult") {
          const combinedPrice = `${sample.TestResult ?? ""} ${sample.TestResultUnit ?? ""}`.toLowerCase();
          return combinedPrice.includes(lowerValue);
        }

        if (field === "gender") {
          return sample.gender?.toLowerCase().startsWith(lowerValue); // safe partial match
        }
        if (field === "sample_visibility") {
          return sample.sample_visibility?.toLowerCase().startsWith(lowerValue); // safe partial match
        }

        return sample[field]?.toString().toLowerCase().includes(lowerValue);
      });
    }

    setFilteredSamplename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update both formData and transferDetails state if applicable
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setTransferDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  const resetAndClose = () => {
    setStep(1);
    setSampleReceive("");
    setTransferDetails({ receiverName: "" });
    setLostReason("");
    setShowReceiveModal(false);
    setSelectedSampleTransfer("");
  };
  const handleTransferClick = (sample) => {
  
    setSelectedSampleTransfer(sample);
    setSelectedSampleId(sample.id); // Assuming `id` is the key for sample ID
    setShowReceiveModal(true); // Show the modal
  };

  const handleTransferSubmit = async () => {
    const userID = sessionStorage.getItem("userID");
    if (!userID) {
      alert("User ID is missing.");
      return;
    }

    try {
      if (sampleReceive === "yes") {
        if (!transferDetails.receiverName?.trim()) {
          alert("Please enter receiver name.");
          return;
        }
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/post/${selectedSampleId}`,
          {
            receiverName: transferDetails.receiverName,
            ReceivedByCollectionSite: userID,
          }
        );
        alert("Sample received successfully.");
      } else if (sampleReceive === "no") {
        if (!lostReason.trim()) {
          alert("Please provide a reason for the lost sample.");
          return;
        }

        // Extract details from selectedSampleTransfer
        const Dispatch_id = selectedSampleTransfer?.Dispatch_id;
        const transferTo = selectedSampleTransfer?.TransferTo;
        const dispatchReceiptNumber =
          selectedSampleTransfer?.dispatchReceiptNumber;
        const dispatchVia = selectedSampleTransfer?.dispatchVia;
        const dispatcherName = selectedSampleTransfer?.dispatcherName;

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampledispatch/post/${selectedSampleId}`,
          {
            TransferFrom: id,
            TransferTo: transferTo,
            dispatchReceiptNumber: dispatchReceiptNumber,
            dispatcherName: dispatcherName,
            dispatchVia: dispatchVia,
            Dispatch_id: Dispatch_id,
            reason: lostReason,
            Quantity: 1,
          }
        );
        alert("Sample marked as lost.");
      }

      fetchSamples();
      resetAndClose();
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Check console for details.");
    }
  };

  const handleModalClose = () => {
    setShowReceiveModal(false); // Close the modal
  };

  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Collection site Id on sample page is:", id);
  }

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
                    <th
                      key={index}
                      className="p-2"
                      style={{ minWidth: "110px" }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={`Search ${label}`}
                          onChange={(e) =>
                            handleFilterChange(key, e.target.value)
                          }
                          style={{
                            minWidth: "100px",
                            maxWidth: "120px",
                            width: "100px",
                          }}
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
                          ) : key === "volume" ? (
                            `${sample.volume || "----"} ${sample.VolumeUnit || ""}`
                          ) : key === "age" ? (
                            `${sample.age || "----"} years`
                          ) : key === "TestResult" ? (
                            `${sample.TestResult || "----"} ${sample.TestResultUnit || ""}`
                          ) : (
                            sample[key] || "----"
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
                    <td colSpan={tableHeaders.length + 1} className="text-center">
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
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h5 style={{ margin: 0 }}>Receive Sample</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleModalClose}
                    style={{
                      fontSize: "1.5rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                    }}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                {step === 1 && (
                  <>
                    <p>Did you receive the sample?</p>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#28a745",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                        }}
                        onClick={() => {
                          setSampleReceive("yes");
                          setStep(2);
                        }}
                      >
                        Yes
                      </button>
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                        }}
                        onClick={() => {
                          setSampleReceive("no");
                          setStep(2);
                        }}
                      >
                        No
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <form>
                    {sampleReceive === "yes" ? (
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
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
                    ) : (
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Reason for Lost Sample
                        </label>
                        <textarea
                          name="lostReason"
                          value={lostReason}
                          onChange={(e) => setLostReason(e.target.value)}
                          placeholder="Enter reason"
                          rows="3"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        type="button"
                        onClick={resetAndClose}
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
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            {" "}
            Sample Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{ maxHeight: "500px", overflowY: "auto" }}
          className="bg-light rounded"
        >
          {selectedSample ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ key, label }) => {
                  const value = selectedSample[key];
                  if (value === undefined) return null;

                  return (
                    <div className="col-md-6" key={key}>
                      <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">
                          {label}
                        </span>
                        <span className="fs-6 text-dark">
                          {value?.toString() || "----"}
                        </span>
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

export default SampleDispatchArea;
