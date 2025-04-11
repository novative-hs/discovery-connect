import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@layout/footer";
import moment from "moment";
import {
  ProgressBar,
  Container,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

const OrderConfirmation = () => {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [created_at, setCreated_at] = useState("");
  const [orderStatus, setOrderStatus] = useState("Placed"); // Default to "Placed", change as required


  useEffect(() => {
    const storedOrderId = localStorage.getItem("cartIDs");
    const storedCreatedAt = localStorage.getItem("created_at");
    
    setOrderId(storedOrderId);
    setCreated_at(storedCreatedAt);
    
  }, []);
  
  
  const handleOrder = () => {
    setTimeout(() => {
      router.push(`/dashboardheader?tab=my-samples`);
    }, 500);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
  
    // Try parsing without .utc() first
    const formattedDate = moment(dateString).format("MMMM Do YYYY, h:mm:ss a");
  
    // Check if the date is valid
    if (moment(formattedDate).isValid()) {
      return formattedDate;
    } else {
      console.error("Invalid date:", dateString);
      return "Invalid Date";  // Return a fallback message if the date is invalid
    }
  };
  
  
  return (
    <>
      <Container className="text-center mt-5">
        {/* Confirmation Card */}
        <Card className="p-4 text-white shadow-lg rounded-4" style={{ backgroundColor: "#0a1d4e"}}>
          <Card.Body>
            <h3 className="text-info">
              <i className="bi bi-check-circle-fill"></i> THANK YOU
            </h3>
            {/* Conditionally Render Message Based on Order Status */}
            {orderStatus === "Placed" ? (
              <h2 className="fw-bold text-light">YOUR ORDER IS PLACED</h2>
            ) : (
              <h2 className="fw-bold text-light">YOUR ORDER IS {orderStatus}</h2>
            )}
            <p className="text-white">
              We will be sending you an email confirmation shortly.
            </p>
          </Card.Body>
        </Card>

        {/* Order Progress Card */}
        <Card className="mt-4 p-4 shadow-lg rounded-4 border-0 bg-light">
          <p className="text-dark fs-6">
            Order <strong>#{orderId || "N/A"}</strong> was placed on{" "}
            <strong>{created_at}</strong> and is currently in
            progress.
          </p>

          {/* Circles with Check Marks */}
          <div
            className="position-relative d-flex align-items-center justify-content-between px-4"
            style={{ width: "100%", maxWidth: "1100px", margin: "auto" }}
          >
            {/* Progress Line */}
            <div
              className="position-absolute w-100 bg-white border progress"
              style={{
                height: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: "0",
              }}
            >
              {/* Green Completed Progress */}
              <div
                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                style={{ width: "15%" }} // Adjust based on progress
              ></div>
            </div>

            {/* Circles with Check Marks */}
            <div className="position-relative d-flex w-100 justify-content-between">
              <div
                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold shadow"
                style={{ width: "40px", height: "40px", zIndex: "1" }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <div
                className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center fw-bold shadow"
                style={{ width: "40px", height: "40px", zIndex: "1" }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold shadow"
                style={{ width: "40px", height: "40px", zIndex: "1" }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold shadow"
                style={{ width: "40px", height: "40px", zIndex: "1" }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
              <div
                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold shadow"
                style={{ width: "40px", height: "40px", zIndex: "1" }}
              >
                <i className="bi bi-check-lg"></i>
              </div>
            </div>
          </div>

          {/* Order Steps */}
          <Row className="text-center py-3">
            <Col className="fw-bold text-success">
              <i className="fa fa-shopping-cart fs-3"></i>
              <br />
              Placed Order
            </Col>
            <Col className="text-secondary">
              <i className="bi bi-person-badge fs-3"></i>
              <br />
              Admin Approval
            </Col>
            <Col className="text-secondary">
              <i className="bi bi-clipboard-check fs-3"></i>
              <br />
              Committee Approval
            </Col>
            <Col className="text-secondary">
              <i className="bi bi-truck fs-3"></i>
              <br />
              Dispatched / Shipped
            </Col>
            <Col className="text-secondary">
              <i className="bi bi-box-seam fs-3"></i>
              <br />
              Product Delivered
            </Col>
          </Row>

          <div className="d-flex justify-content-center ">
            <button
              size="md"
              className="tp-btn mt-3 shadow"
              onClick={handleOrder}
            >
              <i className="bi bi-arrow-right-circle"></i> Track Your Order
            </button>
          </div>

          <p className="mt-3 text-muted fs-6">
            If you have any questions, need further assistance, or require changes
            to your order, please{" "}
            <strong>
              <Link href="/contact" className="text-primary">
                contact our support team
              </Link>
            </strong>
            . We’re here to help and ensure you have the best shopping experience.
          </p>
        </Card>

        {/* Custom CSS for better UI */}
        <style jsx>{`
        .custom-progress .progress-bar {
          background: linear-gradient(90deg, #17a2b8, #007bff);
          font-weight: bold;
        }
      `}</style>
      </Container>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
