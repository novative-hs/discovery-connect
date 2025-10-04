import React from "react";
import { Modal } from "react-bootstrap";

const DetailModal = ({ show, onHide, title, data, fieldsToShow }) => {
  // filter out empty fields
 const validFields = fieldsToShow.filter(({ key }) => {
  const value = data?.[key];
  if (title === "Patient Details" && key === "MRNumber") return true;
  return value !== undefined && value !== null && value !== "";
});


  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-danger">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body
        style={{ maxHeight: "500px", overflowY: "auto" }}
        className="bg-light rounded"
      >
        {data ? (
          validFields.length > 0 ? (
            <div className="p-3">
              <div className="row g-3">
                {validFields.map(({ key, label }) => {
                  // 👇 Only for Patient Details, show "----" if MR Number is null
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
          <div className="text-center text-muted p-3">No details to show</div>
        )}
      </Modal.Body>


      <Modal.Footer className="border-0" />
    </Modal>
  );
};

export default DetailModal;
