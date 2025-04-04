import React, { useState, useRef } from "react";
import { notifyError, notifySuccess } from "@utils/toast";

const SampleCopy = ({ setSampleCopyData ,onComplete}) => {
  const [studyCopy, setStudyCopy] = useState(null);
  const [reportingMechanism, setReportingMechanism] = useState("")
  const [irbFile, setIrbFile] = useState(null);
  const [nbcFile, setNbcFile] = useState(null);

  const studyFileRef = useRef(null);
  const irbFileRef = useRef(null);
  const nbcFileRef = useRef(null);

  const handleFileChange = (e, setter, field) => {
    const file = e.target.files[0];

    if (!file) return; // No file selected
    if (file.type !== "application/pdf") {
      notifyError("Only PDF format is allowed.");
      setter(null);
      return;
    }

    setter(file);
    updateParent(field, file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!studyCopy || !irbFile) {
      notifyError("Please upload all required documents in PDF format.");
      return;
    }
    console.log("Sample Copy Data Submitted:", {
      studyCopy,
      reportingMechanism,
      irbFile,
      nbcFile,
    });
  };

  const updateParent = (field, value) => {
    setSampleCopyData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const renderFileUpload = (fileRef, setter, field, file) => (
    <div>
      <button
        type="button"
        className="tp-btn"
        onClick={() => fileRef.current.click()}
      >
        Choose File
      </button>
      <input
        type="file"
        accept="application/pdf"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, setter, field)}
      />
      {file && (
        <p className="mt-2">
          <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className="text-primary underline-link">
            {file.name}
          </a>
        </p>
      )}
    </div>
  );
  const handleNext = () => {
    if (!studyCopy || !irbFile || !reportingMechanism) {
      notifyError("Please upload all required fields before proceeding.");
      return;
    }
    // Call onComplete to open modal in parent component
    onComplete();
  };
  
  return (
    <div className="your-order mb-30">
      <h3>Sample Documents</h3>
      <form onSubmit={handleFormSubmit}>
        {/* Study Copy */}
        <div className="row">
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Upload Copy of the Study
              <strong>
                <span className="text-danger">*</span>
              </strong>
            </p>
            {renderFileUpload(studyFileRef, setStudyCopy, "studyCopy", studyCopy)}
          </div>

         

          {/* IRB Approval */}
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Institutional Review Board (IRB) Approval
              <span className="text-danger">*</span>
            </p>
            {renderFileUpload(irbFileRef, setIrbFile, "irbFile", irbFile)}
          </div>

          {/* NBC Approval (optional) */}
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              NBC Approval Foreign Collaboration
              <strong>
                <span className="text-danger">(optional)</span>
              </strong>
            </p>
            {renderFileUpload(nbcFileRef, setNbcFile, "nbcFile", nbcFile)}
          </div>
           {/* Reporting Mechanism */}
           <div className="col-12 mb-3">
            <p className="text-muted h8">
              Any Additional Mechanism
              <strong>
                <span className="text-danger">*</span>
              </strong>
            </p>
            <textarea
              value={reportingMechanism}
              onChange={(e) => {
                setReportingMechanism(e.target.value);
                updateParent("reportingMechanism", e.target.value);
              }}
            ></textarea>
          </div>
        </div>
      </form>
      <div className="d-flex justify-content-end mt-3">
  <button type="button" className="tp-btn" onClick={handleNext}>
    Next
  </button>
</div>
    </div>
  );
};

export default SampleCopy;
