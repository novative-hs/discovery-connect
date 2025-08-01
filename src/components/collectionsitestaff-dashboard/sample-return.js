import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faExchangeAlt,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { getsessionStorage } from "@utils/sessionStorage";
import Pagination from "@ui/Pagination";
import NiceSelect from "@ui/NiceSelect";
import InputMask from "react-input-mask";

const SampleReturn = () => {
  const [id, setId] = useState(null);
  const [samples, setSamples] = useState([]);
  const [filter, setFilter] = useState("");
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [filtertotal, setFilterTotal] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Sample Price Currency", key: "SamplePriceCurrency" },
    { label: "Quantity", key: "Quantity" },
    { label: "Volume Unit", key: "VolumeUnit" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Status", key: "status" },
  ];

  // Set user ID on mount
  useEffect(() => {
    const storedId = sessionStorage.getItem("userID");
    setId(storedId);
  }, []);

  // Fetch samples when ID is available
  useEffect(() => {
    if (!id) return;
    const storedUser = getsessionStorage("user");
    fetchSamples();
  }, [id]);

  const fetchSamples = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;

      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereturn/getsamples/${id}?page=${page}&pageSize=${pageSize}`;

      if (searchField && searchValue) {
        url += `&searchField=${searchField}&searchValue=${searchValue}`;
      }

      const response = await axios.get(url);
      const { samples, totalCount } = response.data;

      setSamples(samples);
      setFilteredSamples(samples);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setFilterTotal(Math.ceil(totalCount / pageSize));
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
      filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredSamples(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  };

  // Show loader while ID is not loaded yet
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
                        {sample[key] || "---"}
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


      </div>
    </section>
  );
};

export default SampleReturn;
