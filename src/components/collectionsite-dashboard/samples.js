import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const SampleArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete
  const [formData, setFormData] = useState({
    title: "",
    age: "",
    gender: "",
    price: "",
    quantity: "",
    endTime: "",
    // logo: ""
  });
  const [editSample, setEditSample] = useState(null); // State for selected sample to edit
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState('');


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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        title: "",
        age: "",
        gender: "",
        price: "",
        quantity: "",
        endTime: "",
      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding sample:", error);
    }
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
      title: sample.title,
      age: sample.age,
      gender: sample.gender,
      price: sample.price,
      quantity: sample.quantity,
      endTime: sample.endTime,
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
              {/* Add Samples Button */}
              <div className="d-flex justify-content-end mb-3" style={{ marginTop: '-20px', width: '120%', marginLeft: '-80px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Add Samples
                </button>
              </div>

              {/* Table */}
              <div className="table-responsive" style={{ marginLeft: '-20px', width: '110%' }}>
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>End Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.length > 0 ? (
                      samples.map((sample) => (
                        <tr key={sample.id}>
                          <td>{sample.id}</td>
                          <td>{sample.title}</td>
                          <td>{sample.age}</td>
                          <td>{sample.gender}</td>
                          <td>{sample.price}</td>
                          <td>{sample.quantity}</td>
                          <td>{sample.endTime}</td>
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
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
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
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Age</label>
                            <input
                              type="text"
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
                              <option value="" disabled>Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
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
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Sample</h5>
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
                            <label>Title</label>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Age</label>
                            <input
                              type="text"
                              className="form-control"
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Gender</label>
                            <input
                              type="text"
                              className="form-control"
                              name="gender"
                              value={formData.gender}
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
