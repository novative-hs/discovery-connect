import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

const OrderPage = () => {
  const [orders, setOrders] = useState([]); // Filtered orders
  const [allOrders, setAllOrders] = useState([]); // Original full orders list
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrder`
      );
      setOrders(response.data);
      setAllOrders(response.data); // Save original data
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    if (value.trim() === "") {
      setOrders(allOrders); // Restore original data
    } else {
      const filtered = allOrders.filter((order) =>
        order[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
      setOrders(filtered);
    }
    setCurrentPage(1); // Reset pagination to first page
  };

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="row justify-content-center">
          <h4 className="tp-8 fw-bold text-success text-center pb-2">
            Order Detail
          </h4>

          {/* Table */}
          <div className="table-responsive w-100">
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    { label: "Researcher Name", field: "researcher_name" },
                    { label: "Sample Name", field: "samplename" },
                    { label: "Price", field: "price" },
                    { label: "Quantity", field: "quantity" },
                    { label: "Payment method", field: "payment_method" },
                    { label: "Total Payment", field: "totalpayment" },
                    { label: "Created At", field: "created_at" },
                  ].map(({ label, field }, index) => (
                    <th key={index} className="p-2">
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={label}
                          onChange={(e) =>
                            handleFilterChange(field, e.target.value)
                          }
                          style={{ minWidth: "200px" }}
                        />
                        <span className="fw-bold mt-1">{label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="table-light">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.researcher_name}</td>
                      <td>{order.samplename}</td>
                      <td>
                        {order.SamplePriceCurrency} {order.price}
                      </td>
                      <td>{order.quantity}</td>
                      <td>{order.payment_method}</td>
                      <td>
                        {order.SamplePriceCurrency} {order.totalpayment}
                      </td>
                      <td>
                        {new Date(order.created_at)
                          .toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                          .replace(" ", "-")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-2">
                      No researchers available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {orders.length >=0 && (
            <Pagination
              handlePageClick={(data) => setCurrentPage(data.selected + 1)}
              pageCount={Math.ceil(orders.length / ordersPerPage)}
              focusPage={currentPage - 1}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderPage;
