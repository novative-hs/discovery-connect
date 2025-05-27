import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import Pagination from "@ui/Pagination";
import { notifySuccess, notifyError } from "@utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFileInvoice } from "@fortawesome/free-solid-svg-icons";
const ShippingSampleArea = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) return <div>Loading...</div>;

  const [samples, setSamples] = useState([]);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);

  const [selectedUserSamples, setSelectedUserSamples] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [showOrderStatusError, setShowOrderStatusError] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "DeliveryDate") {
      setDeliveryDate(value);
    }
    if (name === "DeliveryTime") {
      setDeliveryTime(value);
    }
  };
  const tableHeaders = [
    { label: "Order ID", key: "id" },
    { label: "Researcher Name", key: "researcher_name" },
    { label: "Sample Name", key: "diseasename" },
    { label: "Order Date", key: "created_at" },
    { label: "Status", key: "order_status" },
  ];

  useEffect(() => {
    fetchSamples();
    
  }, []);

  const fetchSamples = async () => {
  try {
    console.log("Sending csrUserId:", id); // Confirm value exists

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyOrderPacking`,
      {
        params: { csrUserId: id }
      }
    );

    const shippingSamples = response.data.filter(
      (sample) => sample.order_status === "Dispatched"
    );

    setSamples(shippingSamples);
    setFilteredSamplename(shippingSamples);
  } catch (error) {
    console.error("Error fetching samples:", error);
  }
};


  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(Object.keys(groupedSamples).length / itemsPerPage)
    );
    setTotalPages(pages);
    if (currentPage >= pages) setCurrentPage(0);
  }, [filteredSamplename]);

  const groupedSamples = filteredSamplename.reduce((acc, sample) => {
    const key = sample.researcher_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {});

  const groupedList = Object.entries(groupedSamples).slice(
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
    setCurrentPage(0);
  };

  const handleOrderStatusSubmit = async () => {
    setIsSubmitting(true);
    const id = selectedUserSamples.map((s) => s.id);
  
    if (!id.length) {
      notifyError("No items selected.");
      return;
    }
  
    if (orderStatus !== "Shipped") {
      setShowOrderStatusError(true);
      return;
    }
  
    if (!deliveryDate || !deliveryTime) {
      notifyError("Please select both delivery date and time.");
      return;
    }
  
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/cartstatusbyCSR`,
        {
          ids: id, // send the array properly
          cartStatus: orderStatus,
          deliveryDate,
          deliveryTime,
        }
      );
  
     
      notifySuccess(res.data.message)
      setShowOrderStatusModal(false);
      setIsSubmitting(false);
      setShowOrderStatusError(false);
      setOrderStatus("");
      setDeliveryDate("");
      setDeliveryTime("");
      fetchSamples();
    } catch (error) {
      console.error("Error updating order status:", error);
      notifyError("Failed to update order status.");
    }
  };
  
  
  

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h4 className="text-center text-dark fw-bold mb-4">
          📦 Orders Ready for Packaging
        </h4>
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
                      <span className="fw-bold mt-1 d-block text-nowrap fs-6">
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
            <tbody className="bg-light">
              {groupedList.length > 0 ? (
                groupedList.map(([researcher, records]) => (
                  <tr key={researcher}>
                    <td>{records[0].id}</td>
                    <td>{researcher}</td>
                    <td>{records.map((r) => r.diseasename).join(", ")}</td>
                    <td>{new Date(records[0].created_at).toLocaleString()}</td>
                    <td>{records[0].order_status}</td>
                    <td>
                      <button
                        className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 px-3 py-1 rounded-pill shadow"
                        onClick={() => {
                          setSelectedUserSamples(records);
                          setSelectedUserName(researcher);
                          setShowOrderStatusModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faFileInvoice} />
                        View
                      </button>
                    </td>
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

        { showOrderStatusModal && (
      <Modal
        show
        onHide={() => setShowOrderStatusModal(false)}
        size="lg"
        centered
      >
        <Modal.Body className="p-4 bg-light rounded-3 shadow-sm">
          {/* Header: Name & Address */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-2">
                <span className="text-primary">👤 Name:</span>{" "}
                {selectedUserSamples[0]?.researcher_name}
              </h5>
            </div>
            <div className="text-end small text-secondary">
              <div>
                <span className="fw-bold text-primary">📍 Address:</span>
                <br />
                {selectedUserSamples[0]?.fullAddress},<br />
                {selectedUserSamples[0]?.district_name},{" "}
                {selectedUserSamples[0]?.city_name},{" "}
                {selectedUserSamples[0]?.country_name}
              </div>
              <div className="mt-2">
                <span className="fw-bold">🗓️ Created:</span>{" "}
                {new Date(
                  selectedUserSamples[0]?.created_at
                ).toLocaleDateString()}
              </div>
            </div>
          </div>

          <hr className="mb-4" />

          {/* Table of Items */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center table-sm align-middle bg-white rounded shadow-sm">
              <thead className="table-success text-dark">
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedUserSamples.map((sample, i) => (
                  <tr key={i}>
                    <td>{sample.diseasename}</td>
                    <td>{sample.quantity || "-"}</td>
                    <td>{sample.price || "-"}</td>
                    <td>{sample.totalpayment || "-"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-light">
                <tr>
                  <td colSpan="3" className="text-end fw-bold">
                    Total
                  </td>
                  <td className="fw-bold text-success">
                    {selectedUserSamples
                      .reduce(
                        (sum, s) => sum + Number(s.totalpayment || 0),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>


          {/* Delivery Date Input */}
          <Form.Group className="mt-4">
  <Form.Label>Delivery Date</Form.Label>
  <input
    type="date"
    className="form-control"
    name="DeliveryDate"
    value={deliveryDate}
    onChange={handleInputChange}
    min={new Date().toISOString().split("T")[0]} // ✅ Disable past dates
    required
    style={{
      fontSize: "14px",
      height: "45px",
      backgroundColor: "#f0f0f0",
      color: "black",
    }}
  />
</Form.Group>


          {/* Delivery Time Input */}
          <Form.Group className="mt-4">
            <Form.Label>Delivery Time</Form.Label>
            <input
              type="time"
              className="form-control"
              name="DeliveryTime"
              value={deliveryTime}
              onChange={handleInputChange}
              required
              style={{
                fontSize: "14px",
                height: "45px",
                backgroundColor: "#f0f0f0",
                color: "black",
              }}
            />
          </Form.Group>

                    {/* Status Selection */}
                    <Form.Group className="mt-4">
            <Form.Check
              type="checkbox"
              label=" Mark all items as Shipped"
              onChange={(e) => {
                setOrderStatus(e.target.checked ? "Shipped" : "");
                if (e.target.checked) setShowOrderStatusError(false); // hide error if checked
              }}
              checked={orderStatus === "Shipped"}
              className="fw-semibold"
            />
            {showOrderStatusError && (
              <div className="text-danger mt-2 small">
                Please check the box to mark items as Shipped.
              </div>
            )}
          </Form.Group>

        </Modal.Body>

        {/* Footer Buttons */}
        <Modal.Footer className="bg-white border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowOrderStatusModal(false)}
            className="rounded-pill px-4"
          >
            ❌ Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => {
              handleOrderStatusSubmit(deliveryDate, deliveryTime); // Pass the date and time to the submit function
            }}
            disabled={isSubmitting} 
            className="rounded-pill px-4"
          >
            {isSubmitting ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Processing...
    </>
  ) : (
    "🚚 Save & Dispatch"
  )}
          </Button>
        </Modal.Footer>
      </Modal>
    )}

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

export default ShippingSampleArea;
