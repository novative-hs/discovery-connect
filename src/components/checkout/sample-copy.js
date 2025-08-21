import React, { useState, useRef } from "react";
import { notifyError, notifySuccess } from "@utils/toast";
import { useRouter } from "next/router";

const SampleCopy = ({ setSampleCopyData, onComplete }) => {
  const [studyCopy, setStudyCopy] = useState(null);
  const [reportingMechanism, setReportingMechanism] = useState("");
  const [irbFile, setIrbFile] = useState(null);
  const [nbcFile, setNbcFile] = useState(null);
  const router = useRouter();
  const studyFileRef = useRef(null);
  const irbFileRef = useRef(null);
  const nbcFileRef = useRef(null);

  const handleInvoice = () => {
    router.push("/dashboardheader?tab=invoice-area");
  };

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
    // No validation needed as all fields are optional
  };

  const updateParent = (field, value) => {
    setSampleCopyData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const renderFileUpload = (fileRef, setter, field, file) => (
    <div style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "5px" }}>
      <button
        type="button"
        className="tp-btn"
        style={{
          backgroundColor: "#0a1d4e",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer"
        }}
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
    // No validation needed as all fields are optional
    onComplete();
  };

  return (
    <div className="your-order mb-30">
      <h3>Upload Documents</h3>
      <form onSubmit={handleFormSubmit}>
        <div className="row">
          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Upload Copy of the Study
              <strong>
                <span className="text-danger">(optional)</span>
              </strong>
            </p>
            {renderFileUpload(studyFileRef, setStudyCopy, "studyCopy", studyCopy)}
          </div>

          <div className="col-12 mb-3">
            <p className="text-muted h8">
              Institutional Review Board (IRB) Approval
              <strong>
                <span className="text-danger">(optional)</span>
              </strong>
            </p>
            {renderFileUpload(irbFileRef, setIrbFile, "irbFile", irbFile)}
          </div>

          <div className="col-12 mb-3">
            <p className="text-muted h8">
              NBC Approval Foreign Collaboration
              <strong>
                <span className="text-danger">(optional)</span>
              </strong>
            </p>
            {renderFileUpload(nbcFileRef, setNbcFile, "nbcFile", nbcFile)}
          </div>

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
        <button
          type="button"
          className="tp-btn me-2"
          onClick={handleInvoice}
        >
          View Invoice
        </button>
        <button type="button" className="tp-btn" onClick={handleNext}>
          Make Payment
        </button>
      </div>
    </div>
  );
};

export default SampleCopy;



// import React, { useState, useRef, useEffect } from "react";
// import { notifyError, notifySuccess } from "@utils/toast";
// import { useRouter } from "next/router";

// const SampleCopy = ({ setSampleCopyData, onComplete }) => {
//   const [studyCopy, setStudyCopy] = useState(null);
//   const [reportingMechanism, setReportingMechanism] = useState("");
//   const [irbFile, setIrbFile] = useState(null);
//   const [nbcFile, setNbcFile] = useState(null);
//   const router = useRouter();
//   const studyFileRef = useRef(null);
//   const irbFileRef = useRef(null);
//   const nbcFileRef = useRef(null);

//   // Convert stored file data back to File object
//   const parseStoredFile = (storedData) => {
//     if (!storedData) return null;
//     try {
//       const parsed = JSON.parse(storedData);
//       return new File([], parsed.name, {
//         type: parsed.type,
//         lastModified: parsed.lastModified || Date.now()
//       });
//     } catch (error) {
//       console.error("Error parsing stored file:", error);
//       return null;
//     }
//   };

//   useEffect(() => {
//     // Only load saved files if they exist
//     const savedStudyCopy = sessionStorage.getItem('studyCopy');
//     const savedIrbFile = sessionStorage.getItem('irbFile');
//     const savedNbcFile = sessionStorage.getItem('nbcFile');
//     const savedReportingMechanism = sessionStorage.getItem('reportingMechanism');

//     if (savedStudyCopy) {
//       const file = parseStoredFile(savedStudyCopy);
//       if (file) {
//         setStudyCopy(file);
//         updateParent("studyCopy", file);
//       }
//     }
//     if (savedIrbFile) {
//       const file = parseStoredFile(savedIrbFile);
//       if (file) {
//         setIrbFile(file);
//         updateParent("irbFile", file);
//       }
//     }
//     if (savedNbcFile) {
//       const file = parseStoredFile(savedNbcFile);
//       if (file) {
//         setNbcFile(file);
//         updateParent("nbcFile", file);
//       }
//     }
//     if (savedReportingMechanism) {
//       setReportingMechanism(savedReportingMechanism);
//       updateParent("reportingMechanism", savedReportingMechanism);
//     }
//   }, []);

//   const startNewOrder = () => {
//     clearUploadedFiles();
//   };

//   const clearUploadedFiles = () => {
//     setStudyCopy(null);
//     setIrbFile(null);
//     setNbcFile(null);
//     setReportingMechanism("");

//     sessionStorage.removeItem('studyCopy');
//     sessionStorage.removeItem('irbFile');
//     sessionStorage.removeItem('nbcFile');
//     sessionStorage.removeItem('reportingMechanism');

//     // Clear file inputs
//     if (studyFileRef.current) studyFileRef.current.value = '';
//     if (irbFileRef.current) irbFileRef.current.value = '';
//     if (nbcFileRef.current) nbcFileRef.current.value = '';
//   };

//   const handleInvoice = () => {
//     // Save files to sessionStorage before navigating
//     if (studyCopy) {
//       sessionStorage.setItem('studyCopy', JSON.stringify({
//         name: studyCopy.name,
//         type: studyCopy.type,
//         lastModified: studyCopy.lastModified
//       }));
//     }
//     if (irbFile) {
//       sessionStorage.setItem('irbFile', JSON.stringify({
//         name: irbFile.name,
//         type: irbFile.type,
//         lastModified: irbFile.lastModified
//       }));
//     }
//     if (nbcFile) {
//       sessionStorage.setItem('nbcFile', JSON.stringify({
//         name: nbcFile.name,
//         type: nbcFile.type,
//         lastModified: nbcFile.lastModified
//       }));
//     }
//     if (reportingMechanism) {
//       sessionStorage.setItem('reportingMechanism', reportingMechanism);
//     }

//     router.push("/dashboardheader?tab=invoice-area");
//   };

//   const handleFileChange = (e, setter, field) => {
//     const file = e.target.files[0];

//     if (!file) return;
//     if (file.type !== "application/pdf") {
//       notifyError("Only PDF format is allowed.");
//       setter(null);
//       return;
//     }

//     setter(file);
//     updateParent(field, file);
//     sessionStorage.setItem(field, JSON.stringify({
//       name: file.name,
//       type: file.type,
//       lastModified: file.lastModified
//     }));
//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     // No validation needed since all fields are optional
//   };

//   const updateParent = (field, value) => {
//     setSampleCopyData((prevData) => ({
//       ...prevData,
//       [field]: value,
//     }));
//   };

//   const renderFileUpload = (fileRef, setter, field, file) => (
//     <div style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "5px" }}>
//       <button
//         type="button"
//         className="tp-btn"
//         style={{
//           backgroundColor: "#0a1d4e",
//           color: "white",
//           border: "none",
//           padding: "8px 16px",
//           borderRadius: "4px",
//           cursor: "pointer"
//         }}
//         onClick={() => fileRef.current.click()}
//       >
//         Choose File
//       </button>
//       <input
//         type="file"
//         accept="application/pdf"
//         ref={fileRef}
//         style={{ display: "none" }}
//         onChange={(e) => handleFileChange(e, setter, field)}
//       />
//       {file && (
//         <p className="mt-2">
//           <span className="text-primary">
//             {file.name}
//           </span>
//         </p>
//       )}
//     </div>
//   );

//   const handleNext = () => {
//     // No validation needed since all fields are optional

//     // Save files to sessionStorage before proceeding
//     if (studyCopy) {
//       sessionStorage.setItem('studyCopy', JSON.stringify({
//         name: studyCopy.name,
//         type: studyCopy.type,
//         lastModified: studyCopy.lastModified
//       }));
//     }
//     if (irbFile) {
//       sessionStorage.setItem('irbFile', JSON.stringify({
//         name: irbFile.name,
//         type: irbFile.type,
//         lastModified: irbFile.lastModified
//       }));
//     }
//     if (nbcFile) {
//       sessionStorage.setItem('nbcFile', JSON.stringify({
//         name: nbcFile.name,
//         type: nbcFile.type,
//         lastModified: nbcFile.lastModified
//       }));
//     }
//     if (reportingMechanism) {
//       sessionStorage.setItem('reportingMechanism', reportingMechanism);
//     }

//     onComplete();
//   };

//   return (
//     <div className="your-order mb-30">
//       <h3>Upload Documents</h3>
//       <form onSubmit={handleFormSubmit}>
//         <div className="row">
//           <div className="col-12 mb-3">
//             <p className="text-muted h8">
//               Upload Copy of the Study
//               <strong><span className="text-danger">(optional)</span></strong>
//             </p>
//             {renderFileUpload(studyFileRef, setStudyCopy, "studyCopy", studyCopy)}
//           </div>

//           <div className="col-12 mb-3">
//             <p className="text-muted h8">
//               Institutional Review Board (IRB) Approval
//               <strong><span className="text-danger">(optional)</span></strong>
//             </p>
//             {renderFileUpload(irbFileRef, setIrbFile, "irbFile", irbFile)}
//           </div>

//           <div className="col-12 mb-3">
//             <p className="text-muted h8">
//               NBC Approval Foreign Collaboration
//               <strong><span className="text-danger">(optional)</span></strong>
//             </p>
//             {renderFileUpload(nbcFileRef, setNbcFile, "nbcFile", nbcFile)}
//           </div>

//           <div className="col-12 mb-3">
//             <p className="text-muted h8">
//               Any Additional Mechanism
//               <strong><span className="text-danger">(optional)</span></strong>
//             </p>
//             <textarea
//               value={reportingMechanism}
//               onChange={(e) => {
//                 setReportingMechanism(e.target.value);
//                 updateParent("reportingMechanism", e.target.value);
//                 sessionStorage.setItem('reportingMechanism', e.target.value);
//               }}
//               style={{ width: "100%", minHeight: "100px", padding: "8px" }}
//             ></textarea>
//           </div>
//         </div>
//       </form>
//       <div className="d-flex justify-content-end mt-3">
//         <button
//           type="button"
//           className="tp-btn me-2"
//           onClick={handleInvoice}
//         >
//           View Invoice
//         </button>
//         <button type="button" className="tp-btn" onClick={handleNext}>
//           Make Payment
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SampleCopy;
