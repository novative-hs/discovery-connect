import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const ResearcherArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of researcher to delete
  const [formData, setFormData] = useState({
    ResearcherName: "",
    email: "",
    gender: "",
    phoneNumber: "",
    nameofOrganization: "",
    fullAddress: "",
    country: "",
    // logo: ""
  });
  const [editSample, setEditSample] = useState(null); // State for selected researcher to edit
  const [researchers, setSamples] = useState([]); // State to hold fetched researchers
  const [successMessage, setSuccessMessage] = useState('');


  // Fetch researchers from backend when component loads
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/researcher/get');
        setSamples(response.data); // Store fetched researchers in state
      } catch (error) {
        console.error("Error fetching researchers:", error);
      }
    };

    fetchSamples(); // Call the function when the component mounts
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post('http://localhost:5000/api/researchers/post', formData);
      console.log("Researcher added successfully:", response.data);

      // Refresh the researcher list after successful submission
      const newResponse = await axios.get('http://localhost:5000/api/researcher/get');
      setSamples(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        ResearcherName: "",
        email: "",
        gender: "",
        phoneNumber: "",
        nameofOrganization: "",
        fullAddress: "",
        country: "",
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding researcher:", error);
    }
  };


  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`http://localhost:5000/api/researchers/delete/${selectedSampleId}`);
      console.log(`Researcher with ID ${selectedSampleId} deleted successfully.`);

      // Set success message
      setSuccessMessage('Researcher deleted successfully.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Refresh the researcher list after deletion
      const newResponse = await axios.get('http://localhost:5000/api/researcher/get');
      setSamples(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedSampleId(null);
    } catch (error) {
      console.error(`Error deleting researcher with ID ${selectedSampleId}:`, error);
    }
  };
  const handleEditClick = (researcher) => {
    setSelectedSampleId(researcher.id);
    setEditSample(researcher); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      ResearcherName: researcher.ResearcherName,
      email: researcher.email,
      gender: researcher.gender,
      phoneNumber: researcher.phoneNumber,
      nameofOrganization: researcher.nameofOrganization,
      fullAddress: researcher.fullAddress,
      country: researcher.country,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/researchers/edit/${selectedSampleId}`,
        formData
      );
      console.log("Researcher updated successfully:", response.data);

      const newResponse = await axios.get(
        "http://localhost:5000/api/researcher/get"
      );
      setSamples(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Researcher updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Error updating researcher with ID ${selectedSampleId}:`, error);
    }
  };

  return (
    <section className="policy__area pb-120">
      <div className="container" style={{ marginTop: '-20px', width: '120%', marginLeft: '-80px' }}>

        <div className="row justify-content-center" style={{ marginTop: '290px' }}>
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              {/* Add Researchers Button */}
              <div className="d-flex justify-content-end mb-3" style={{ marginTop: '-20px', width: '120%', marginLeft: '-80px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Add Researchers
                </button>
              </div>

              {/* Table */}
              <div className="table-responsive" style={{ marginLeft: '-20px', width: '110%' }}>
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Phone Number</th>
                      <th>Organization</th>
                      <th>Full Address</th>
                      <th>Country</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {researchers.length > 0 ? (
                      researchers.map((researcher) => (
                        <tr key={researcher.id}>
                          <td>{researcher.id}</td>
                          <td>{researcher.ResearcherName}</td>
                          <td>{researcher.email}</td>
                          <td>{researcher.gender}</td>
                          <td>{researcher.phoneNumber}</td>
                          <td>{researcher.nameofOrganization}</td>
                          <td>{researcher.fullAddress}</td>
                          <td>{researcher.country}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(researcher)}>
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>{" "}
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedSampleId(researcher.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} size="sm" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No researchers available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal for Adding Researchers */}
              {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Researcher</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowAddModal(false)}
                          style={{
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          {/* Form Fields */}
                          <div className="form-group">
                            <label>Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="ResearcherName"
                              value={formData.ResearcherName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="text"
                              className="form-control"
                              name="email"
                              value={formData.email}
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
                              <option value="" disabled>Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="text"
                              className="form-control"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Organization</label>
                            <input
                              type="text"
                              className="form-control"
                              name="nameofOrganization"
                              value={formData.nameofOrganization}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Full Address</label>
                            <input
                              type="text"
                              className="form-control"
                              name="fullAddress"
                              value={formData.fullAddress}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Country</label>
                            <input
                              type="text"
                              className="form-control"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              required
                            />
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

              {/* Edit Researcher Modal */}
              {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Researcher</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowEditModal(false)}
                          style={{
                            // background: 'none',
                            // border: 'none',
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleUpdate}>
                        <div className="modal-body">
                          {/* Form Fields */}
                          <div className="form-group">
                            <label>Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="ResearcherName"
                              value={formData.ResearcherName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="text"
                              className="form-control"
                              name="email"
                              value={formData.email}
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
                          <div className="form-group">
                            <label>Phone Number</label>
                            <input
                              type="text"
                              className="form-control"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Organization</label>
                            <input
                              type="text"
                              className="form-control"
                              name="nameofOrganization"
                              value={formData.nameofOrganization}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Full Address</label>
                            <input
                              type="text"
                              className="form-control"
                              name="fullAddress"
                              value={formData.fullAddress}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Country</label>
                            <input
                              type="text"
                              className="form-control"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="modal-footer">

                          <button type="submit" className="btn btn-primary">
                            Update Researcher
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal for Deleting Researchers */}
              {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Delete Researcher</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <p>Are you sure you want to delete this researcher?</p>
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

export default ResearcherArea;
