import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
const SampleArea = () => {
  const id = localStorage.getItem("userID");
  const tableHeaders = [
    { label: "Sample Name", key: "samplename" },
    // { label: "Age", key: "age" },
    // { label: "Gender", key: "gender" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Price", key: "price" },
    { label: "Quantity", key: "orderquantity" },
    { label: "Total Payment", key: "totalpayment" },
    { label: "Quantity Unit", key: "QuantityUnit" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfCollection" },
    {
      label: "Concurrent Medical Conditions",
      key: "ConcurrentMedicalConditions",
    },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    // { label: "Status", key: "status" },
    {
      label: "Payment Method",
      key: "payment_method",
      render: (value) => (value === "DBT" ? "Bank Transfer" : value),
    },
    {
      label: "Payment status",
      key: "payment_status",
    },
    {
      label: "Order status",
      key: "order_status",
    },
    {
      label: "Registration Admin status",
      key: "registration_admin_status",
    },
    {
      label: "Committee Member Status",
      key: "committee_status",
      render: (value) => (value === null ? "Waiting for admin action" : value),
    },
  ];

  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const fetchSamples = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sample/getResearcherSamples/${id}`
      );
      console.log(response.data);
      setSamples(response.data); // Store fetched samples in state
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };
  // Fetch samples from backend when component loads
  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>;
    } else {
      fetchSamples();
    }
  }, []);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(samples.length / itemsPerPage));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [samples]);
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
  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
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
                              style={{ minWidth: "150px" }}
                            />
                            <span className="fw-bold mt-1 d-block text-nowrap align-items-center fs-10">
                              Price (Currency)
                            </span>
                          </div>
                        </th>
                      );
                    }

                    // Render other columns normally
                    return (
                      <th key={index} className="px-4 text-center">
                        <div className="d-flex flex-column align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                            placeholder={label}
                            onChange={(e) =>
                              handleFilterChange(key, e.target.value)
                            }
                            style={{ minWidth: "150px" }}
                          />
                          <span className="fw-bold mt-1 d-block text-nowrap align-items-center fs-10">
                            {label}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((sample) => (
                    <tr key={sample.id}>
                      {tableHeaders.map(({ key, render }, index) => {
                        // Check if it's the price column and merge currency
                        if (key === "price") {
                          return (
                            <td key={index}>
                              {sample.price
                                ? `${sample.price} ${
                                    sample.SamplePriceCurrency || ""
                                  }`
                                : "N/A"}
                            </td>
                          );
                        }

                        // Check if it's the total payment column and merge currency
                        if (key === "totalpayment") {
                          return (
                            <td key={index}>
                              {sample.totalpayment
                                ? `${sample.totalpayment} ${
                                    sample.SamplePriceCurrency || ""
                                  }`
                                : "N/A"}
                            </td>
                          );
                        }

                        // Default rendering for other columns
                        return (
                          <td key={index}>
                            {render
                              ? render(sample[key])
                              : sample[key] || "N/A"}
                          </td>
                        );
                      })}
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
    </section>
  );
};

export default SampleArea;
