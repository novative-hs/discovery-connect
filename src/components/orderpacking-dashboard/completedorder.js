import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faCheck,
  faTimes,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";

const CompletedSampleArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Order packaging Id on sample page is:", id);
  }
  const [filteredSamplename, setFilteredSamplename] = useState([]); // Store filtered sample name

  const tableHeaders = [
    { label: "Order ID", key: "cart_id" },
    { label: "User Name", key: "researcher_name" },
    { label: "Sample Name", key: "samplename" },
    { label: "Order Date", key: "created_at" },
    { label: "Status", key: "order_status" },
  ];

  const [samples, setSamples] = useState([]); // State to hold fetched samples

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchSamples(); // Call the function initially when the component mounts

    // Set an interval to refresh data every 5 seconds (5000ms)
    const interval = setInterval(() => {
      fetchSamples();
    }, 5000);

    // Clear the interval when the component unmounts to avoid memory leaks
    return () => clearInterval(interval);
  }, []);

  const fetchSamples = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyOrderPacking`
      );

      // Filter only the samples where order_status is 'Dispatched'
      const shippingSamples = response.data.filter(
        (sample) => sample.order_status === "Completed"
      );

      // Update state
      setSamples(shippingSamples);
      setFilteredSamplename(shippingSamples); // Assuming you want to use the filtered samples
      console.log(shippingSamples);
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
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
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
      filtered = samples; // Show all if filter is empty
    } else {
      filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredSamplename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h4 className="tp-8 fw-bold text-danger text-center pb-2">
          Orders Packaging
        </h4>

        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-auto">
            <thead className="table-dark">
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
                  <tr key={sample.cart_id}>
                    <td>{sample.cart_id || "N/A"}</td>
                    <td>{sample.researcher_name}</td>
                    <td>{sample.samplename}</td>
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

export default CompletedSampleArea;
