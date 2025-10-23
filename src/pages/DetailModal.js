import React from "react";
import { Modal } from "react-bootstrap";

const DetailModal = ({
  show,
  onHide,
  title,
  data,
  fieldsToShow,
  tableData,
  tableColumns,
  imageUrl,
  fallbackText = "No image available.",
}) => {
  // 🔹 Filter valid detail fields
  const validFields = fieldsToShow
    ? fieldsToShow.filter(({ key }) => {
        const value = data?.[key];
        if (title === "Patient Details" && key === "MRNumber") return true;
        return value !== undefined && value !== null && value !== "";
      })
    : [];

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-danger">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{ maxHeight: "500px", overflowY: "auto" }}
        className="bg-light rounded"
      >
        {/* 🔹 CASE 1 — Image Preview Mode */}
        {imageUrl ? (
          <div className="text-center">
            <img
              src={imageUrl}
              alt={title}
              style={{
                maxHeight: "400px",
                maxWidth: "100%",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        ) : tableData && Array.isArray(tableData) ? (
          /* 🔹 CASE 2 — Table Mode */
          tableData.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead
                  style={{
                    backgroundColor: "#444",
                    color: "#fff",
                    fontSize: "14px",
                  }}
                >
                  <tr>
                    {tableColumns.map((col, i) => (
                      <th key={i}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                        fontSize: "13px",
                      }}
                    >
                     {tableColumns.map((col, i) => {
                        const val = row[col.key];

                        // 🧠 Custom display logic
                        let displayValue = "—";

                        if (val !== null && val !== undefined && val !== "") {
                            if (col.key === "age") {
                            displayValue = `${val} yrs`;
                            } else if (col.key === "TestResult") {
                            // ✅ Show TestResult + Unit together
                            const unit = row?.TestResultUnit ? ` ${row.TestResultUnit}` : "";
                            displayValue = `${val}${unit}`;
                            }
                            else if (col.key === "volume") {
                            // ✅ Show TestResult + Unit together
                            const unit = row?.VolumeUnit ? ` ${row.VolumeUnit}` : "";
                            displayValue = `${val}${unit}`;
                            }
                            else {
                            displayValue = val.toString();
                            }
                        }

                        return <td key={i}>{displayValue}</td>;
                        })}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                color: "#777",
              }}
            >
              No records found.
            </p>
          )
        ) : data ? (
          /* 🔹 CASE 3 — Detail View */
          validFields.length > 0 ? (
            <div className="p-3">
              <div className="row g-3">
                {validFields.map(({ key, label }) => {
                  const value =
                    title === "Patient Details" && key === "MRNumber"
                      ? data[key] || "----"
                      : data[key];

                  return (
                    <div className="col-md-6" key={key}>
                      <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">
                          {label}
                        </span>
                        <span className="fs-6 text-dark">
                          {value !== null &&
                          value !== undefined &&
                          value !== ""
                            ? value.toString()
                            : "----"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted p-3">
              No details to show
            </div>
          )
        ) : (
          <div className="text-center text-muted p-3">
            {fallbackText}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0" />
    </Modal>
  );
};

export default DetailModal;
