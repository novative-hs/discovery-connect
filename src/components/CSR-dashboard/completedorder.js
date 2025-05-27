import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import Pagination from "@ui/Pagination";

const CompletedSampleArea = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Order packaging Id on sample page is:", id);
  }
  const [filteredSamplename, setFilteredSamplename] = useState([]); // Store filtered sample name

  const tableHeaders = [
    { label: "Order ID", key: "id" },
    { label: "User Name", key: "researcher_name" },
    { label: "Sample Name", key: "diseasename" },
    { label: "Order Date", key: "created_at" },
    { label: "Status", key: "order_status" },
  ];

  const [samples, setSamples] = useState([]); // State to hold fetched samples

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  const id = sessionStorage.getItem("userID");

  useEffect(() => {
    if (id !== null) {
      const action = sessionStorage.getItem("staffAction") || "";
      setStaffAction(action);
      fetchSamples(action); // Fetch once on load
    }
  }, [id]);

  const fetchSamples = async (staffActionParam) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyOrderPacking`,
        {
          params: { csrUserId: id, staffAction: staffActionParam },
        }
      );

      const completedSamples = response.data.filter(
        (sample) => sample.order_status === "Completed"
      );

      setSamples(completedSamples);
      setFilteredSamplename(completedSamples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredSamplename.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredSamplename]);

  const currentData = filteredSamplename.slice(
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

    setFilteredSamplename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(0);
  };

  if (!id) return <div>Loading...</div>;

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="d-flex justify-content-center align-items-center mb-3">
          <h4 className="text-dark fw-bold">
           Orders Sample Completed
          </h4>
          
        </div>

        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle table-sm shadow-sm rounded">
            <thead className="table-primary text-white">
              <tr>
                {[
                  { label: "Order ID", key: "id" },
                  { label: "User Name", key: "researcher_name" },
                  { label: "Sample Name", key: "samplename" },
                  { label: "Order Date", key: "created_at" },
                  { label: "Status", key: "order_status" },
                ].map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                        placeholder={`Search ${label}`}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "150px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-nowrap fs-6">
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
                    <td>{sample.id || "----"}</td>
                    <td>{sample.researcher_name}</td>
                    <td>{sample.diseasename}</td>
                    <td>{new Date(sample.created_at).toLocaleString()}</td>
                    <td>{sample.order_status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No samples available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
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

export default CompletedSampleArea;
