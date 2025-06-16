import React, { useState, useEffect,useCallback } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
const SampleArea = () => {
  const router = useRouter();
  const id = sessionStorage.getItem("userID");
  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
    { label: "Volume", key: "volume" },
    { label: "Price", key: "price" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Quantity", key: "quantity" },
    { label: "Test Result", key: "TestResult" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },


  ];

  const fieldsToShowInOrder = [
    // { label: "Price", key: "price" },
    // { label: "Quantity", key: "orderquantity" },
    // { label: "Total Payment", key: "totalpayment" },

    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const fetchSamples = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getResearcherSamples/${id}`
    );

    if (response.data.error) {
      setError(response.data.error);
      setSamples([]);
    } else {
      setSamples(response.data);
    }
  } catch (error) {
    console.error("Error fetching samples:", error);
    setError("An error occurred while fetching the samples.");
  } finally {
    setLoading(false);
  }
}, [id]);

  // Fetch samples from backend when component loads
 useEffect(() => {
  if (id !== null) {
    fetchSamples();
    const intervalId = setInterval(fetchSamples, 30000);
    return () => clearInterval(intervalId);
  }
}, [id, fetchSamples]); 


  useEffect(() => {
    const pages = Math.max(1, Math.ceil(samples.length / itemsPerPage));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [samples,currentPage]);
  const currentData = samples.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchSamples(); // Reset to fetch original data
    } else {
      // Filter the sample array based on the field and value
      const filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
      setSamples(filtered); // Update the state with filtered results
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }
  };
  const openModal = (sample) => {

    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };
  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h7 className="text-danger fw-bold mb-3">Click on Sample Name to get detail about sample.</h7>
        <div className="row justify-content-center">
          <div className="table-responsive w-100">
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr>
                  {tableHeaders.map(({ label, key }, index) => {
                    // Check if it's the "Price" column and merge it with "Sample Price Currency"
                    if (key === "price") {
                      return (
                        <th key={index} className="px-4 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <input
                              type="text"
                              className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                              placeholder="Price (Currency)"
                              onChange={(e) =>
                                handleFilterChange("price", e.target.value)
                              }
                              style={{ minWidth: "110px" }}
                            />
                            <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-10">
                              Price (Currency)
                            </span>
                          </div>
                        </th>
                      );
                    }

                    // Render other columns normally
                    return (
                      <th key={index} className="col-md-1 px-2">

                        <div className="d-flex flex-column align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                            placeholder={`Search ${label}`}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                            style={{ minWidth: "100px", maxWidth: "120px", width: "100px" }}
                          />
                          <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
                            {label}
                          </span>

                        </div>
                      </th>
                    );
                  })}
                  <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((sample) => (
                    <tr key={sample.id}>
                      {tableHeaders.map(({ key, render }, index) => {
                        // 🔁 Handle Price column with currency
                        if (key === "price") {
                          return (
                            <td key={index}>
                              {sample.price
                                ? `${sample.price} ${sample.SamplePriceCurrency || ""}`
                                : "----"}
                            </td>
                          );
                        }
                        // 🔁 Handle Total Payment column with currency
                        if (key === "totalpayment") {
                          return (
                            <td key={index}>
                              {sample.totalpayment
                                ? `${sample.totalpayment} ${sample.SamplePriceCurrency || ""}`
                                : "----"}
                            </td>
                          );
                        }
                        // ✅ Custom logic for committee_status
                        if (key === "committee_status") {
                          let displayValue = sample[key];

                          if (
                            sample.technical_admin_status === "Rejected" &&
                            sample.committee_status === "rejected" &&
                            sample.order_status === "Rejected"
                          ) {
                            displayValue = "Rejected";
                          } else if (sample.technical_admin_status === "Rejected") {
                            displayValue = "No further processing";
                          } else if (
                            sample.technical_admin_status === "Accepted" &&
                            (displayValue === null || displayValue === undefined)
                          ) {
                            displayValue = "Awaiting Admin to Forward to Committee";
                          } else if (displayValue === null || displayValue === undefined) {
                            displayValue = "Pending Admin Action";
                          }

                          return <td key={index}>{displayValue}</td>;
                        }

                        // ✅ Custom logic for Analyte with clickable modal
                        if (key === "Analyte") {
                          return (
                            <td key={index}>
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
                            </td>
                          );
                        }
                        // ✅ Custom logic for volume + VolumeUnit
                        if (key === "volume") {
                          return (
                            <td key={index}>
                              {sample.volume
                                ? `${sample.volume} ${sample.VolumeUnit || ""}`
                                : "----"}
                            </td>
                          );
                        }
                        // ✅ Custom logic for age
                        if (key === "age") {
                          return (
                            <td key={index}>
                              {sample.age ? `${sample.age} years` : "----"}
                            </td>
                          );
                        }
                        // ✅ Custom logic for TestResult
                        if (key === "TestResult") {
                          return (
                            <td key={index}>
                              {sample.TestResult
                                ? `${sample.TestResult} ${sample.TestResultUnit || ""}`
                                : "----"}
                            </td>
                          );
                        }
                        // 🔁 Default render for all other fields
                        return (
                          <td key={index}>
                            {render ? render(sample[key]) : sample[key] || "----"}
                          </td>
                        );
                      })}

                      {/* Handle sample name click to open modal */}
                      <td>
                        <button
                          className="btn btn-outline-success btn-l d-flex align-items-center gap-1"
                          onClick={() =>
                            router.push({
                              pathname: "/order-confirmation",
                              query: {
                                id: sample.id,
                                created_at: sample.created_at,
                                orderStatus: sample.order_status || "Placed",
                                technical_admin_status: sample.technical_admin_status,
                                committee_status: sample.committee_status,
                              },
                            })
                          }
                          title="Track Order"
                        >
                          <span>Track Order</span>
                        </button>
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
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}
        </div>
      </div>
      {/* Modal for sample details */}
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

export default SampleArea;
