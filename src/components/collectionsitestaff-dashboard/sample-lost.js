import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Modal from "react-bootstrap/Modal";
import { getsessionStorage } from "@utils/sessionStorage";
import Pagination from "@ui/Pagination";


const SampleLost = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Collection site Id on sample page is:", id);
  }

  const tableHeaders = [
    { label: "Sample Name", key: "diseasename" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Volume", key: "volume" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
  ];
  const fieldsToShowInOrder = [
    { label: "Sample Name", key: "diseasename" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
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


  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [filter, setFilter] = useState(""); // State for dropdown selection
  const [filteredSamples, setFilteredSamples] = useState(samples); // State for filtered samples
  const [filtertotal, setfiltertotal] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Fetch samples from backend when component loads
  useEffect(() => {
    const storedUser = getsessionStorage("user");
    fetchSamples(); // Call the function when the component mounts
  }, []);
  // Fetch samples from the backend
  const fetchSamples = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;

      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampledispatch/getlostsample/${id}?page=${page}&pageSize=${pageSize}`;

      if (searchField && searchValue) {
        url += `&searchField=${searchField}&searchValue=${searchValue}`;
      }

      const response = await axios.get(url);

      const { samples, totalCount } = response.data;
      setSamples(samples);
      console.log(samples);
      setFilteredSamples(samples); // Ensure filteredSamples are updated
      setTotalPages(Math.ceil(totalCount / pageSize)); // Update total pages based on the total count
      setfiltertotal(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamples.length / itemsPerPage));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredSamples]);

  // Get the current data for the table
  const currentData = filteredSamples.slice(
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
        const combinedVolume = `${sample.volume ?? ""} ${sample.QuantityUnit ?? ""}`.toLowerCase();
        return combinedVolume.includes(lowerValue);
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

  setFilteredSamples(filtered);
  setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  setCurrentPage(0);
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
    <section className="profile__area pt-30 pb-120">
      <div className="container-fluid px-md-4">
        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-auto border">
            <thead className="table-primary text-dark">
              <tr className="text-center">
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                        placeholder={`Search ${label}`}
                        onChange={(e) =>
                          handleFilterChange(key, e.target.value)
                        }
                        style={{ minWidth: "150px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
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
                            : "text-center text-truncate"
                        }
                        style={{ maxWidth: "150px" }}
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
                            onMouseOver={(e) =>
                              (e.target.style.color = "#0a58ca")
                            }
                            onMouseOut={(e) => (e.target.style.color = "")}
                          >
                            {sample.diseasename || "----"}
                          </span>
                        ) : (
                          sample[key] || "---"
                        )}
                      </td>
                    ))}
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

        {/* Pagination */}
        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage}
          />
        )}
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
      </div>
    </section>
  );
};

export default SampleLost;
