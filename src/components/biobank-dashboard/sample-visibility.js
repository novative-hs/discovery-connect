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
    const [selectedSampleName,setSelectedSampleName]=useState('')
  const [selectedSampleVolumn,setSelectedSampleVolumn]=useState('')
  const [selectedSampleUnit,setSelectedSampleUnit]=useState('')
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSample, setEditSample] = useState(null);
  const fieldsToShowInOrder = [
    { label: "Disease Name", key: "diseasename" },
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
    { label: "Date Of Collection", key: "DateOfCollection" },
    {
      label: "Concurrent Medical Conditions",
      key: "ConcurrentMedicalConditions",
    },

  ];
  const tableHeaders = [
    { label: "Disease Name", key: "diseasename" },
    { label: "Volumn", key: "packsize" },
    { label: "Sample Price Currency", key: "SamplePriceCurrency" },
    { label: "Price", key: "price" },
    { label: "Date Of Collection", key: "DateOfCollection" },
    { label: "Test Result", key: "TestResult" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
  ];
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState(samples);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const [totalPages, setTotalPages] = useState(0);

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getsamples/${id}`
      );

      const ownSamples = response.data.samples.map((sample) => ({
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
    const pages = Math.max(
      1,
      Math.ceil(filteredSamples.length / itemsPerPage)
    );
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
      filtered = samples; // Show all if filter is empty
    } else {
      filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredSamples(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
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
      setSamples(updatedSamples);
      setFilteredSamples(updatedSamples);
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
    setSelectedSampleVolumn(sample.packsize)
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
          style={{ marginTop: "-40px" }}>
          <h6>Note: Click the Edit Icon to public and private the samples.</h6>

        </div>
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
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "100px", maxWidth: "120px", width: "100px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-nowrap align-items-center fs-6">
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
                : key === "diseasename"
                ? ""
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
                onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                onMouseOut={(e) => (e.target.style.color = "")}
              >
                {sample.diseasename || "----"}
              </span>
            ) : key === "packsize" ? (
              `${sample.packsize || "----"} ${sample.QuantityUnit || ""}`
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
                       <h5 className="modal-title">{selectedSampleName} -{selectedSampleVolumn}{selectedSampleUnit}</h5>
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
