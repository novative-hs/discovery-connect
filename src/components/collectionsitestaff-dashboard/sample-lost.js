import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import { getsessionStorage } from "@utils/sessionStorage";
import Pagination from "@ui/Pagination";

const SampleLost = () => {
  const [id, setId] = useState(null);
  const [samples, setSamples] = useState([]);
  const [filter, setFilter] = useState("");
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [filtertotal, setfiltertotal] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentComment, setCurrentComment] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Open comment modal
  const openCommentModal = (comment) => {
    setCurrentComment(comment || 'No comments available');
    setShowCommentModal(true);
  };

  // Close comment modal
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setCurrentComment('');
  };

  useEffect(() => {
    const storedId = sessionStorage.getItem("userID");
    if (storedId) {
      setId(storedId);
    }
  }, []);

  useEffect(() => {
    const storedUser = getsessionStorage("user");
    if (!id) return;
    fetchSamples(); // Call the function when the component mounts
  }, [id]);

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
      setFilteredSamples(samples);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setfiltertotal(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamples.length / itemsPerPage));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredSamples]);

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
          const combinedVolume = `${sample.volume ?? ""} ${sample.VolumeUnit ?? ""}`.toLowerCase();
          return combinedVolume.includes(lowerValue);
        }
        if (field === "gender" || field === "sample_visibility") {
          return sample[field]?.toLowerCase().startsWith(lowerValue);
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

  const tableHeaders = [
    { label: "Analyte ", key: "Analyte" },
    { label: "Volume", key: "volume" },
    { label: "Gender & Age", key: "gender_age" },
    { label: "Test Result & Unit", key: "TestResult" },

    { label: "Status", key: "status" },

  ];

  const fieldsToShowInOrder = [
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Phone Number", key: "phoneNumber" },
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

  if (!id) {
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

                <th className="px-2" style={{ minWidth: "120px", whiteSpace: "nowrap" }}>
                  <div className="d-flex flex-column align-items-center">
                    <span className="fw-bold mt-1 text-center fs-6" style={{ whiteSpace: "nowrap" }}>
                      Comments
                    </span>
                  </div>
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
                            : "text-center text-truncate"
                        }
                        style={{ maxWidth: "150px" }}
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
                            onMouseOver={(e) =>
                              (e.target.style.color = "#0a58ca")
                            }
                            onMouseOut={(e) => (e.target.style.color = "")}
                          >
                            {sample.Analyte || "----"}
                          </span>
                        ) : key === "volume" ? (
                          `${sample.volume || "----"} ${sample.VolumeUnit || ""}`
                        ) : key === "gender_age" ? (
                          (sample.gender && sample.age ?
                            `${sample.gender} | ${sample.age} years` :
                            sample.gender ?
                              sample.gender :
                              sample.age ?
                                `${sample.age} years` :
                                "----"
                          )
                        ) : key === "TestResult" ? (
                          `${sample.TestResult || "----"} ${sample.TestResultUnit || ""}`
                        ) : (
                          sample[key] || "---"
                        )}
                      </td>
                    ))}
                    <td className="text-center">
                      <button
                        onClick={() => openCommentModal(sample.Reason)}
                        className={`btn btn-sm ${sample.Reason ? "btn-info text-white" : "btn-outline-secondary"}`}
                        disabled={!sample.Reason}
                        style={{
                          minWidth: "120px",
                          fontWeight: "500",
                          backgroundColor: "brown",
                          border: "brown",
                          ...(!sample.Reason && { cursor: "not-allowed" })
                        }}
                      >
                        {sample.Reason ? "View Comments" : "No Comments"}
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
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

          <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }} className="bg-light rounded">
            {selectedSample ? (
              <div className="p-3">
                <div className="row g-3">
                  {fieldsToShowInOrder
                    .filter(({ key }) => {
                      const value = selectedSample[key];
                      return value !== undefined && value !== null && value !== "";
                    })
                    .map(({ key, label }) => (
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
            ) : (
              <div className="text-center text-muted p-3">No details to show</div>
            )}
          </Modal.Body>

          <Modal.Footer className="border-0"></Modal.Footer>
        </Modal>
        <Modal
          show={showCommentModal}
          onHide={closeCommentModal}
          size="md"
          centered
          className="comment-modal"
        >
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">
              <i className="fas fa-comment me-2"></i>
              Sample Comments
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4 bg-light" >
            <div className="p-3 rounded border">
              <p className="mb-0 text-dark" style={{ fontSize: "1.1rem" }}>
                {currentComment}
              </p>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </section>
  );
};

export default SampleLost;