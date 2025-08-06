import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@layout/footer";
import moment from "moment";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useRouter } from "next/router";
import Link from "next/link";

const OrderConfirmation = () => {
  const router = useRouter();
  const { id, created_at, orderStatus, technical_admin_status, committee_status } = router.query;

  const [progressWidth, setProgressWidth] = useState("10%");
  const [steps, setSteps] = useState(Array(7).fill("secondary"));

  useEffect(() => {
    let width = "10%";
    let stepColors = Array(6).fill("secondary");

    // Step 0: Placed
    stepColors[0] = "success";
    width = "10%";

    // Step 1: Committee
    if (committee_status === "Pending") {
      stepColors[1] = "warning";
      width = "20%";
    } else if (committee_status === "rejected") {
      stepColors[1] = "danger";
      width = "20%";
    } else if (committee_status === "Accepted") {
      stepColors[1] = "success";
      width = "30%";
    }

    // Step 2: Admin
    if (committee_status === "Accepted") {
      if (technical_admin_status === "Pending") {
        stepColors[2] = "warning";
        width = "40%";
      } else if (technical_admin_status === "Rejected") {
        stepColors[2] = "danger";
        width = "40%";
      } else if (technical_admin_status === "Accepted") {
        stepColors[2] = "success";
        width = "50%";
      }
    }

    // Step 3–5: Further progress only if admin accepted
    if (technical_admin_status === "Accepted") {
      if (orderStatus === "Dispatched") {
        stepColors[3] = "success";
        width = "65%";
      }
      if (orderStatus === "Shipped") {
        stepColors[3] = "success";
        stepColors[4] = "success";
        width = "85%";
      }
      if (orderStatus === "Completed") {
        stepColors[3] = "success";
        stepColors[4] = "success";
        stepColors[5] = "success";
        width = "100%";
      }
    }

    setProgressWidth(width);
    setSteps(stepColors);
  }, [orderStatus, technical_admin_status, committee_status]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "----";
    const formattedDate = moment(dateString).format("MMMM Do YYYY, h:mm:ss a");
    return moment(formattedDate).isValid() ? formattedDate : "Invalid Date";
  };

  const handleTrack = () => {
    router.push(`/dashboardheader?tab=my-samples`);
  };

  return (
    <>
      <Container className="text-center mt-5">
        <Card className="p-4 text-white shadow-lg rounded-4" style={{ backgroundColor: "#0a1d4e" }}>
          <Card.Body>
            <h3 className="text-info">
              <i className="bi bi-check-circle-fill"></i> THANK YOU
            </h3>
            <h2 className="fw-bold text-light">
              YOUR ORDER IS {orderStatus?.toUpperCase() || "PLACED"}
            </h2>
            <p className="text-white">We will be sending you an email confirmation shortly.</p>
          </Card.Body>
        </Card>

        <Card className="mt-4 p-4 shadow-lg rounded-4 border-0 bg-light">
          <p className="text-dark fs-6">
            Order <strong>#{id || "----"}</strong> was placed on{" "}
            <strong>
              {new Date(created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              }).replace(/ /g, '-')}{" "}
              {new Date(created_at).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true, // Show AM/PM
              })}
            </strong>{" "}
            and is currently in progress.
          </p>



          {/* Progress Bar */}
          <div
            className="position-relative d-flex align-items-center justify-content-between px-4"
            style={{ width: "100%", maxWidth: "1150px", margin: "auto" }}
          >
            <div
              className="position-absolute w-100 bg-white border progress"
              style={{
                height: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: "0",
              }}
            >
              <div
                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                style={{ width: progressWidth }}
              ></div>
            </div>

            {/* Step Circles */}
            <div className="position-relative d-flex w-100 justify-content-between">
              {steps.map((stepColor, idx) => {
                let icon = <i className="bi bi-check-lg"></i>;

                if (idx === 1) {
                  if (committee_status === "Pending") {
                    icon = <i className="bi bi-hourglass-split"></i>;
                  } else if (committee_status === "rejected") {
                    icon = <i className="bi bi-x-lg"></i>;
                  }
                }

                if (idx === 2 && committee_status === "Accepted") {
                  if (technical_admin_status === "Pending") {
                    icon = <i className="bi bi-hourglass-split"></i>;
                  } else if (technical_admin_status === "Rejected") {
                    icon = <i className="bi bi-x-lg"></i>;
                  }
                }

                return (
                  <div
                    key={idx}
                    className={`rounded-circle bg-${stepColor} text-white d-flex align-items-center justify-content-center fw-bold shadow`}
                    style={{ width: "40px", height: "40px", zIndex: "1" }}
                  >
                    {icon}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Step Labels */}
          <Row className="text-center py-3">
            {[
              "Placed Order",
              "Committee Approval",
              "Admin Approval",
              "Dispatched",
              "Shipped",
              "Completed",
            ].map((label, idx) => (
              <Col key={idx} className={`fw-bold text-${steps[idx]} w-100`}>
                <div className="fs-3">
                  {idx === 0 && <i className="fa fa-shopping-cart"></i>}
                  {idx === 1 && <i className="bi bi-person-badge"></i>}
                  {idx === 2 && <i className="bi bi-clipboard-check"></i>}
                  {idx === 3 && <i className="bi bi-box-arrow-up"></i>}
                  {idx === 4 && <i className="bi bi-truck"></i>}
                  {idx === 5 && <i className="bi bi-check2-circle"></i>}
                </div>
                <div>{label}</div>
              </Col>
            ))}
          </Row>

          {/* Button */}
          <div className="d-flex justify-content-center">
            <button className="tp-btn mt-3 shadow" onClick={handleTrack}>
              <i className="bi bi-arrow-right-circle"></i> Orders List
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
      </Container>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
