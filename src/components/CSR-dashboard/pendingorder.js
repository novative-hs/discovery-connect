import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import Pagination from "@ui/Pagination";
import { notifySuccess, notifyError } from "@utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";

const PendingSampleArea = () => {
  const id = sessionStorage.getItem("userID");

  const [staffAction, setStaffAction] = useState(() => sessionStorage.getItem("staffAction") || "");
  const [samples, setSamples] = useState([]);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState("Dispatched");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUserSamples, setSelectedUserSamples] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [showOrderStatusError, setShowOrderStatusError] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchVia, setDispatchVia] = useState("");
  const [dispatchSlip, setDispatchSlip] = useState(null);
  const [currency, setCurrency] = useState(null)
  if (id === null) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "DeliveryDate") setDeliveryDate(value);
    if (name === "DeliveryTime") setDeliveryTime(value);
  };

  const tableHeaders = [
    { label: "Order ID", key: "tracking_id" },
    { label: "Order Date", key: "created_at" },
    { label: "Researcher Name", key: "researcher_name" },
    { label: "Organization Name", key: "organization_name" },
    // { label: "Source Name", key: "source_name" },
    { label: "Order Status", key: "order_status" },
  ];

  const fetchSamples = async (action = staffAction) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCSR`,
        {
          params: {
            csrUserId: id,
            staffAction: action,
          },
        }
      );
      const shippingSamples = response.data.filter(
        (sample) => sample.order_status === "Pending"
      );
      setSamples(shippingSamples);
      setFilteredSamplename(shippingSamples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    if (filteredSamplename.length > 0) {
      setCurrency(filteredSamplename[0].SamplePriceCurrency || "PKR");
    } else {
      setCurrency("PKR");
    }
  }, [filteredSamplename]);
  const groupedSamples = filteredSamplename.reduce((acc, sample) => {
    const key = sample.tracking_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {});

  const groupedList = Object.entries(groupedSamples).slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    if (id) {
      fetchSamples(staffAction);
    }
  }, [staffAction, id]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(Object.keys(groupedSamples).length / itemsPerPage));
    setTotalPages(pages);
    if (currentPage >= pages) setCurrentPage(0);
  }, [filteredSamplename]);

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
    const ids = selectedUserSamples.map((s) => s.id);

    // Validation
    if (!deliveryDate || !deliveryTime || !dispatchVia || !dispatchSlip) {
      notifyError("Please select all the details.");
      return setIsSubmitting(false);
    }

    try {
      const formData = new FormData();
      formData.append("ids", JSON.stringify(ids));
      formData.append("cartStatus", orderStatus);
      formData.append("deliveryDate", deliveryDate);
      formData.append("deliveryTime", deliveryTime);
      formData.append("dispatchVia", dispatchVia);
      if (dispatchSlip) formData.append("dispatchSlip", dispatchSlip);

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/cartstatusbyCSR`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notifySuccess(res.data.message);
      setShowOrderStatusModal(false);
      setShowOrderStatusError(false);
      fetchSamples();
    } catch (error) {
      console.error("Error updating order status:", error);
      notifyError("Failed to update order status.");
    } finally {
      setIsSubmitting(false);
      setOrderStatus("Dispatched");
      setDispatchSlip("");
      setDispatchVia("");
      setDeliveryDate("");
      setDeliveryTime("");
    }
  };

  const handleCancelModal = async () => {
    setShowOrderStatusModal(false)
    setOrderStatus("Dispatched");
    setDispatchSlip("");
    setDispatchVia("");
    setDeliveryDate("");
    setDeliveryTime("");
  }
  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h4 className="text-center text-dark fw-bold mb-4">
          📦 Pending Orders
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
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "150px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-wrap fs-6">
                        {label}
                        {label === "Unit Price" && groupedList.length > 0
                          ? ` (${currency || "PKR"})`
                          : ""}
                        {label === "Total" && groupedList.length > 0
                          ? ` (${currency || "PKR"})`
                          : ""}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-2 text-center" style={{ width: "1%", whiteSpace: "nowrap" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-light">
              {groupedList.length > 0 ? (
                groupedList.map(([researcher, records]) => (
                  <tr key={researcher}>
                    <td>{records[0].tracking_id || "---"}</td>
                    <td>{new Date(records[0].created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit'
                    }).replace(/ /g, '-')}</td>
                    <td>{records[0].researcher_name}</td>
                    <td>{records[0].organization_name}</td>
                    {/* <td>
                      {records[0].BiobankName || records[0].CollectionSiteName || "---"}
                    </td> */}

                    <td>{records[0].order_status}</td>
                    <td>
                      <button
                        className="btn btn-outline-success btn-sm d-flex justify-content-center align-items-center gap-2  rounded-pill shadow"
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

        <Pagination pageCount={totalPages} onPageChange={handlePageChange} />

        {showOrderStatusModal && (
          <Modal
            show
            onHide={() => setShowOrderStatusModal(false)}
            size="lg"
            centered
            scrollable // makes modal body scrollable when content is too tall
          >
            <Modal.Body
              className="p-4 bg-light rounded-3 shadow-sm"
              style={{ maxHeight: "80vh", overflowY: "auto" }} // max height & scroll
            >
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-2">
                    <div>
                      <span className="text-primary"> Name:</span>{" "}
                      {selectedUserSamples[0]?.researcher_name}
                    </div>
                    <span className="text-primary"> Email:</span>{" "}
                    {selectedUserSamples[0]?.user_email}
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
                    <span className="fw-bold">🗓️ Order Date:</span>{" "}
                    {new Date(selectedUserSamples[0]?.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <hr className="mb-4" />

              <div className="table-responsive">
                <table className="table table-bordered table-hover text-center table-sm align-middle bg-white rounded shadow-sm">
                  <thead className="table-success text-dark">
                    <tr>
                      <th>Item</th>
                      <th>Qty X Volume</th>

                      <th>Collection Site Name</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserSamples.map((sample, i) => (
                      <tr key={i}>
                        <td className="text-start">
                          <div>
                            <div className="fw-semibold">{sample.Analyte}</div>
                            <div className="text-muted small">
                              {/* Gender and Age */}
                              {(sample.gender || sample.age) && (
                                <>
                                  {sample.gender}
                                  {sample.age ? `${sample.gender ? ', ' : ''}${sample.age} years` : ''}
                                </>
                              )}

                              {/* Separator + TestResult */}
                              {(sample.TestResult || sample.TestResultUnit) && (sample.gender || sample.age) && ' | '}
                              {(sample.TestResult || sample.TestResultUnit) && (
                                <>
                                  {sample.TestResult ?? ''} {sample.TestResultUnit ?? ''}
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          {sample.quantity || 0} × {sample.volume || 0}{sample.VolumeUnit || ''}
                        </td>
                        <td>{sample.BiobankName || sample.CollectionSiteName || "---"}</td>
                        <td style={{ textAlign: "right" }}>
                          {sample.price
                            ? `${sample.SamplePriceCurrency} ${sample.price.toLocaleString()}`
                            : "-"}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          {sample.totalpayment
                            ? `${sample.SamplePriceCurrency} ${Number(sample.totalpayment).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                            : "-"}
                        </td>



                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="4" className="text-end fw-bold">
                        Total
                      </td>
                      <td
                        className="fw-bold text-success"
                        style={{ textAlign: "right" }}
                      >
                        {`${selectedUserSamples[0]?.SamplePriceCurrency || ""} ${selectedUserSamples
                          .reduce((sum, s) => sum + Number(s.totalpayment || 0), 0)
                          .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>
                    </tr>
                  </tfoot>

                </table>
              </div>

              <Form.Group className="mt-4">
                <Form.Label>Upload Dispatch Slip</Form.Label>
                <Form.Control
                  type="file"
                  name="dispatchSlip"
                  onChange={(e) => setDispatchSlip(e.target.files[0])}
                  accept=".jpg,.jpeg,.png,.pdf"
                />
                <small className="text-muted">Allowed formats: JPG, PNG, PDF</small>
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Dispatch Via</Form.Label>
                <Form.Select
                  name="dispatchVia"
                  value={dispatchVia}
                  onChange={(e) => setDispatchVia(e.target.value)}
                >
                  <option value="">Select Method</option>
                  <option value="Self Collection">Self Collection</option>
                  <option value="Courier">Courier</option>
                  <option value="By Bus">By Bus</option>
                  <option value="By Train Cargo">By Train Cargo</option>
                  <option value="Air Cargo">Air Cargo</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mt-4">
                <Form.Label>Estimate Dispatch Date</Form.Label>
                <Form.Control
                  type="date"
                  name="DeliveryDate"
                  value={deliveryDate}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Estimate Dispatch Time</Form.Label>
                <Form.Control
                  type="time"
                  name="DeliveryTime"
                  value={deliveryTime}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <div className="mt-4 d-flex justify-content-end gap-3">
                <Button variant="secondary"
                  onClick={handleCancelModal}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={handleOrderStatusSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Confirm Dispatched"}
                </Button>
              </div>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </section>
  );
};

export default PendingSampleArea;

