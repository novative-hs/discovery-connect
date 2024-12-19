import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

const SampleArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete
  const [formData, setFormData] = useState({
    masterID: "",
    donorID: "",
    samplename: "",
    age: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    storagetempUnit: "",
    ContainerType: "",
    CountryOfCollection: "",
    price: "",
    SamplePriceCurrency: "",
    quantity: "",
    QuantityUnit: "",
    labname: "",
    SampleTypeMatrix: "",
    TypeMatrixSubtype: "",
    ProcurementType: "",
    endTime: "",
    SmokingStatus: "",
    TestMethod: "",
    TestResult: "",
    TestResultUnit: "",
    InfectiousDiseaseTesting: "",
    InfectiousDiseaseResult: "",
    // CutOffRange: "",
    // CutOffRangeunit: "",
    status: "",
    // logo: ""
  });
  const [editSample, setEditSample] = useState(null); // State for selected sample to edit
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState('');

  // Stock Transfer modal fields names
  const [transferDetails, setTransferDetails] = useState({
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
  });

  const handleTransferClick = (sample) => {
    console.log("Transfer action for:", sample);
    setSelectedSampleId(sample.id);
    setShowTransferModal(true); // Show the modal
  };

  // Fetch samples from backend when component loads
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sample/get');
        setSamples(response.data); // Store fetched samples in state
      } catch (error) {
        console.error("Error fetching samples:", error);
      }
    };

    fetchSamples(); // Call the function when the component mounts
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Update both formData and transferDetails state if applicable
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    setTransferDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post('http://localhost:5000/api/samples/post', formData);
      console.log("Sample added successfully:", response.data);

      // Refresh the sample list after successful submission
      const newResponse = await axios.get('http://localhost:5000/api/sample/get');
      setSamples(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        masterID: "",
        donorID: "",
        samplename: "",
        age: "",
        gender: "",
        ethnicity: "",
        samplecondition: "",
        storagetemp: "",
        storagetempUnit: "",
        ContainerType: "",
        CountryOfCollection: "",
        price: "",
        SamplePriceCurrency: "",
        quantity: "",
        QuantityUnit: "",
        labname: "",
        SampleTypeMatrix: "",
        TypeMatrixSubtype: "",
        ProcurementType: "",
        endTime: "",
        SmokingStatus: "",
        TestMethod: "",
        TestResult: "",
        TestResultUnit: "",
        InfectiousDiseaseTesting: "",
        InfectiousDiseaseResult: "",
        // CutOffRange: "",
        // CutOffRangeunit: "",
        status: "",
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };


  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    const { dispatchVia, dispatcherName, dispatchReceiptNumber } = transferDetails;

    // Validate input before making the API call
    if (!dispatchVia || !dispatcherName || !dispatchReceiptNumber) {
      alert('All fields are required.');
      return;
    }

    try {
      // POST request to your backend API
      const response = await axios.post(`http://localhost:5000/api/sampledispatch/post/${selectedSampleId}`, {
        dispatchVia,
        dispatcherName,
        dispatchReceiptNumber,
      });
      console.log("Sample dispatched successfully:", response.data);

      alert('Sample dispatched successfully!');
      setShowTransferModal(false); // Close the modal after submission
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200
        console.error("Error response:", error.response.data);
        alert(`Error: ${error.response.data.error}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        alert("No response received from server.");
      } else {
        // Something else happened
        console.error("Error dispatching sample:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };


  const handleModalClose = () => {
    setShowTransferModal(false); // Close the modal
  };

  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`http://localhost:5000/api/samples/delete/${selectedSampleId}`);
      console.log(`Sample with ID ${selectedSampleId} deleted successfully.`);

      // Set success message
      setSuccessMessage('Sample deleted successfully.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Refresh the sample list after deletion
      const newResponse = await axios.get('http://localhost:5000/api/sample/get');
      setSamples(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedSampleId(null);
    } catch (error) {
      console.error(`Error deleting sample with ID ${selectedSampleId}:`, error);
    }
  };
  const handleEditClick = (sample) => {
    setSelectedSampleId(sample.id);
    setEditSample(sample); // Store the sample data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      masterID: sample.masterID,
      donorID: sample.donorID,
      samplename: sample.samplename,
      age: sample.age,
      gender: sample.gender,
      ethnicity: sample.ethnicity,
      samplecondition: sample.samplecondition,
      storagetemp: sample.storagetemp,
      storagetempUnit: sample.storagetempUnit,
      ContainerType: sample.ContainerType,
      CountryOfCollection: sample.CountryOfCollection,
      price: sample.price,
      SamplePriceCurrency: sample.SamplePriceCurrency,
      quantity: sample.quantity,
      QuantityUnit: sample.QuantityUnit,
      labname: sample.labname,
      SampleTypeMatrix: sample.SampleTypeMatrix,
      TypeMatrixSubtype: sample.TypeMatrixSubtype,
      ProcurementType: sample.ProcurementType,
      endTime: sample.endTime,
      SmokingStatus: sample.SmokingStatus,
      TestMethod: sample.TestMethod,
      TestResult: sample.TestResult,
      TestResultUnit: sample.TestResultUnit,
      InfectiousDiseaseTesting: sample.InfectiousDiseaseTesting,
      InfectiousDiseaseResult: sample.InfectiousDiseaseResult,
      status: sample.status
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/samples/edit/${selectedSampleId}`,
        formData
      );
      console.log("Sample updated successfully:", response.data);

      const newResponse = await axios.get(
        "http://localhost:5000/api/sample/get"
      );
      setSamples(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Sample updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Error updating sample with ID ${selectedSampleId}:`, error);
    }
  };

  return (
    <section className="policy__area pb-120">
      <div className="container" style={{ marginTop: '-20px', width: '120%', marginLeft: '-90px' }}>

        <div className="row justify-content-center" style={{ marginTop: '290px', width: '110%' }}>
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              {/* Add Samples Button */}
              <div className="d-flex justify-content-end mb-3" style={{ marginTop: '-20px', width: '120%', marginLeft: '-150px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Add Samples
                </button>
              </div>

              {/* Table */}
              <div className="table-responsive" style={{ marginLeft: '-50px', width: '110%' }}>
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>ID</th>
                      <th>Master ID</th>
                      <th>Donor ID</th>
                      <th>Sample Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Ethnicity</th>
                      <th>Sample Condition</th>
                      <th>Storage Temperature</th>
                      <th>Storage Temperature Unit</th>
                      <th>Container Type</th>
                      <th>Country Of Collection</th>
                      <th>Price</th>
                      <th>Sample Price Currency</th>
                      <th>Quantity</th>
                      <th>Quantity Unit</th>
                      <th>Lab Name</th>
                      <th>Sample Type Matrix</th>
                      <th>Type Matrix Subtype</th>
                      <th>Procurement Type</th>
                      <th>End Time</th>
                      <th>Smoking Status</th>
                      <th>Test Method</th>
                      <th>Test Result</th>
                      <th>Test Result Unit</th>
                      <th>Infectious Disease Testing</th>
                      <th>Infectious Disease Result</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.length > 0 ? (
                      samples.map((sample) => (
                        <tr key={sample.id}>
                          <td>{sample.id}</td>
                          <td>{sample.masterID}</td>
                          <td>{sample.donorID}</td>
                          <td>{sample.samplename}</td>
                          <td>{sample.age}</td>
                          <td>{sample.gender}</td>
                          <td>{sample.ethnicity}</td>
                          <td>{sample.samplecondition}</td>
                          <td>{sample.storagetemp}</td>
                          <td>{sample.storagetempUnit}</td>
                          <td>{sample.ContainerType}</td>
                          <td>{sample.CountryOfCollection}</td>
                          <td>{sample.price}</td>
                          <td>{sample.SamplePriceCurrency}</td>
                          <td>{sample.quantity}</td>
                          <td>{sample.QuantityUnit}</td>
                          <td>{sample.labname}</td>
                          <td>{sample.SampleTypeMatrix}</td>
                          <td>{sample.TypeMatrixSubtype}</td>
                          <td>{sample.ProcurementType}</td>
                          <td>{sample.endTime}</td>
                          <td>{sample.SmokingStatus}</td>
                          <td>{sample.TestMethod}</td>
                          <td>{sample.TestResult}</td>
                          <td>{sample.TestResultUnit}</td>
                          <td>{sample.InfectiousDiseaseTesting}</td>
                          <td>{sample.InfectiousDiseaseResult}</td>
                          <td>{sample.status}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(sample)}>
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>{" "}
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedSampleId(sample.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTransferClick(sample)}
                            >
                              <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No samples available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal for Adding Samples */}
              {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{
                  zIndex: 1050, // Ensure it's above the header
                  position: 'fixed',
                  top: '120px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'auto', // Optional: Customize if needed
                }}>
                  <div className="modal-dialog" role="document" style={{ maxWidth: '100%', width: '90vw' }}>
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Sample</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowAddModal(false)}
                          style={{
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          {/* Parallel Columns - 4 columns */}
                          <div className="row">
                            {/* Column 1 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Master ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="masterID"
                                  value={formData.masterID}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Donor ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="donorID"
                                  value={formData.donorID}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="samplename"
                                  value={formData.samplename}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Age</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="age"
                                  value={formData.age}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Gender</label>
                                <select
                                  className="form-control"
                                  name="gender"
                                  value={formData.gender}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                            </div>
                            {/* Column 2 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Ethnicity</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ethnicity"
                                  value={formData.ethnicity}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Condition</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="samplecondition"
                                  value={formData.samplecondition}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Storage Temperature</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="storagetemp"
                                  value={formData.storagetemp}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Storage Temperature Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="storagetempUnit"
                                  value={formData.storagetempUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Container Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ContainerType"
                                  value={formData.ContainerType}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            {/* Column 3 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Country Of Collection</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CountryOfCollection"
                                  value={formData.CountryOfCollection}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Price</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Price Currency</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SamplePriceCurrency"
                                  value={formData.SamplePriceCurrency}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Quantity</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="quantity"
                                  value={formData.quantity}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Quantity Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="QuantityUnit"
                                  value={formData.QuantityUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            {/* Column 4 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Lab Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="labname"
                                  value={formData.labname}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Type Matrix</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SampleTypeMatrix"
                                  value={formData.SampleTypeMatrix}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Type Matrix Subtype</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TypeMatrixSubtype"
                                  value={formData.TypeMatrixSubtype}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Procurement Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ProcurementType"
                                  value={formData.ProcurementType}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>End Time</label>
                                <input
                                  type="datetime-local"
                                  className="form-control"
                                  name="endTime"
                                  value={formData.endTime}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            {/* Column 5 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Smoking Status</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SmokingStatus"
                                  value={formData.SmokingStatus}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Method</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestMethod"
                                  value={formData.TestMethod}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestResult"
                                  value={formData.TestResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Result Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestResultUnit"
                                  value={formData.TestResultUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Infectious Disease Testing</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseTesting"
                                  value={formData.InfectiousDiseaseTesting}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                             {/* Column 6 */}
                             <div className="col-md-2">
                              <div className="form-group">
                                <label>Infectious Disease Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseResult"
                                  value={formData.InfectiousDiseaseResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Sample Modal */}
              {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog" style={{
                  zIndex: 1050, // Ensure it's above the header
                  position: 'fixed',
                  top: '120px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'auto', // Optional: Customize if needed
                }}>
                  <div className="modal-dialog" role="document" style={{ maxWidth: '100%', width: '70vw' }}>
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Sample</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowEditModal(false)}
                          style={{
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleUpdate}>
                        <div className="modal-body">
                          {/* Parallel Columns - 4 columns */}
                          <div className="row">
                            {/* Column 1 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Master ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="masterID"
                                  value={formData.masterID}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Donor ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="donorID"
                                  value={formData.donorID}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="samplename"
                                  value={formData.samplename}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Age</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="age"
                                  value={formData.age}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Gender</label>
                                <select
                                  className="form-control"
                                  name="gender"
                                  value={formData.gender}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Select Gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                            </div>

                            {/* Column 2 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Ethnicity</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ethnicity"
                                  value={formData.ethnicity}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Condition</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="samplecondition"
                                  value={formData.samplecondition}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Storage Temperature</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="storagetemp"
                                  value={formData.storagetemp}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Storage Temperature Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="storagetempUnit"
                                  value={formData.storagetempUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Container Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ContainerType"
                                  value={formData.ContainerType}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* Column 3 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Country Of Collection</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CountryOfCollection"
                                  value={formData.CountryOfCollection}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Price</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Price Currency</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SamplePriceCurrency"
                                  value={formData.SamplePriceCurrency}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Quantity</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="quantity"
                                  value={formData.quantity}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Quantity Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="QuantityUnit"
                                  value={formData.QuantityUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* Column 4 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Lab Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="labname"
                                  value={formData.labname}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Type Matrix</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SampleTypeMatrix"
                                  value={formData.SampleTypeMatrix}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Type Matrix Subtype</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TypeMatrixSubtype"
                                  value={formData.TypeMatrixSubtype}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Procurement Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ProcurementType"
                                  value={formData.ProcurementType}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>End Time</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="endTime"
                                  value={formData.endTime}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* Column 5 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Smoking Status</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SmokingStatus"
                                  value={formData.SmokingStatus}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Method</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestMethod"
                                  value={formData.TestMethod}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestResult"
                                  value={formData.TestResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Result Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestResultUnit"
                                  value={formData.TestResultUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Infectious Disease Testing</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseTesting"
                                  value={formData.InfectiousDiseaseTesting}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* Column 6 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Infectious Disease Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseResult"
                                  value={formData.InfectiousDiseaseResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Update Sample
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}


              {/* Modal for transfreing Samples */}
              {showTransferModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1050,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                      width: "90%",
                      maxWidth: "400px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      zIndex: 1100,
                    }}
                  >
                    <h5 style={{ marginBottom: "20px", textAlign: "center" }}>Transfer to Collection Site</h5>
                    <form>
                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Dispatch Via</label>
                        <select
                          name="dispatchVia"
                          value={transferDetails.dispatchVia}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        >
                          <option value="">Select</option>
                          <option value="Courier">Courier</option>
                          <option value="By Hand">By Hand</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Dispatcher Name</label>
                        <input
                          type="text"
                          name="dispatcherName"
                          value={transferDetails.dispatcherName}
                          onChange={handleInputChange}
                          placeholder="Enter Dispatcher Name"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Dispatch Receipt Number</label>
                        <input
                          type="text"
                          name="dispatchReceiptNumber"
                          value={transferDetails.dispatchReceiptNumber}
                          onChange={handleInputChange}
                          placeholder="Enter Receipt Number"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <button
                          type="button"
                          onClick={handleModalClose}
                          style={{
                            padding: "10px 15px",
                            backgroundColor: "#ccc",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleTransferSubmit}
                          style={{
                            padding: "10px 15px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer",
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}


              {/* Modal for Deleting Samples */}
              {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Delete Sample</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <p>Are you sure you want to delete this sample?</p>
                      </div>
                      <div className="modal-footer">
                        <button
                          className="btn btn-danger"
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleArea;
