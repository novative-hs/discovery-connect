import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";

const DispatchSampleArea = () => {
  const [staffAction, setStaffAction] = useState("");
  const [samples, setSamples] = useState([]);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const id = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;

  // Fetch staffAction only once when component mounts
  useEffect(() => {
    const action = sessionStorage.getItem("staffAction") || "";
    setStaffAction(action);
    
  }, []);

  // Fetch samples on first render
  useEffect(() => {
    if (id && staffAction) {
      fetchSamples(staffAction);
    }
  }, [id, staffAction]);

  const fetchSamples = async (staffAction) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyOrderPacking`,
        {
          params: { csrUserId: id, staffAction },
        }
      );

      const shippingSamples = response.data.filter(
        (sample) => sample.order_status === "Shipped"
      );

      setSamples(shippingSamples);
      setFilteredSamplename(shippingSamples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamplename.length / 10));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredSamplename, currentPage]);

  const tableHeaders = [
    { label: "Order ID", key: "id" },
    { label: "User Name", key: "researcher_name" },
    { label: "Sample Name", key: "diseasename" },
    { label: "Order Date", key: "created_at" },
    { label: "Status", key: "order_status" },
  ];

  const itemsPerPage = 10;
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

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h4 className="text-center text-dark fw-bold mb-4">
          🚚 Orders Sample Dispatched
        </h4>

        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle table-sm shadow-sm rounded">
            <thead className="table-primary text-white">
              <tr>
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
                      <span className="fw-bold mt-1 d-block text-wrap fs-6">
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

        {/* Pagination */}
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

export default DispatchSampleArea;
