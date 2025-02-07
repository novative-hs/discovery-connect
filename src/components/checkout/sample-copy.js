import React, { useState } from "react";

const SampleCopy = () => {
  const [studyCopy, setStudyCopy] = useState(null);
  const [reportingMechanism, setReportingMechanism] = useState("");
  const [irbApproval, setIrbApproval] = useState("");
  const [nbcApproval, setNbcApproval] = useState("");
  const [irbFile, setIrbFile] = useState(null);
  const [nbcFile, setNbcFile] = useState(null);

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    setter(file); // This will update the state for the specific file input
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., save data, upload files)
  };

  const renderFilePreview = (file) => {
    if (!file) return null;
    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type.split("/")[0];

    if (fileType === "image") {
      return <img src={fileUrl} alt="Preview" className="img-fluid mt-2" />;
    } else if (file.type === "application/pdf") {
      return (
        <embed
          src={fileUrl}
          type="application/pdf"
          width="100%"
          height="400px"
          className="mt-2"
        />
      );
    } else {
      return <p className="mt-2">Uploaded File: {file.name}</p>;
    }
  };

  return (
    <div className="container mt-4">
      {/* Form Section */}
      <form onSubmit={handleFormSubmit}>
        <div className="row">
          {/* Study Copy Upload Section */}
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Upload Copy of the Study
              <strong>
                <span className="text-danger">*</span>
              </strong>
            </p>
            <input
              type="file"
              className="form-control"
              accept=".pdf,.docx"
              onChange={(e) => {
                setStudyCopy(e.target.files[0]); // Only update studyCopy
              }}
            />
            {studyCopy && renderFilePreview(studyCopy)}
          </div>

          {/* Reporting Mechanism */}
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Reporting Mechanism
              <strong>
                <span className="text-danger">*</span>
              </strong>
            </p>
            <textarea
              className="form-control"
              value={reportingMechanism}
              onChange={(e) => setReportingMechanism(e.target.value)}
              placeholder="Enter reporting mechanism details"
            ></textarea>
          </div>

          {/* IRB Approval Section */}
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Institutional Review Board (IRB) Approval
              <span className="text-danger">*</span>
            </p>
            <input
              type="file"
              className="form-control mt-2"
              accept=".pdf,.docx"
              onChange={(e) => {
                handleFileChange(e, setIrbFile); // Only update irbFile
              }}
            />
            {irbFile && renderFilePreview(irbFile)}
          </div>

          {/* NBC Approval Section */}
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              NBC Approval Foreign Collaboration
              <strong>
                <span className="text-danger">(optional)</span>
              </strong>
            </p>
            <input
              type="file"
              className="form-control mt-2"
              accept=".pdf,.docx"
              onChange={(e) => {
                handleFileChange(e, setNbcFile); // Only update nbcFile
              }}
            />
            {nbcFile && renderFilePreview(nbcFile)}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary mt-3 w-100 py-2 fs-5 rounded-pill shadow-sm hover:shadow-lg"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SampleCopy;
