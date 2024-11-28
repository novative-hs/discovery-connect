import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const CommitteMemberArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommittememberId, setSelectedCommittememberId] = useState(null); // Store ID of Committe Members to delete
  const [formData, setFormData] = useState({
    CommitteMemberName: "",
    email: "",
    phoneNumber: "",
    cnic: "",
    fullAddress: "",
    city: "",
    district: "",
    country: "",
    organization: "",
    created_at: "",  
    status: "",
  });
  const [editCommittemember, setEditCommittemember] = useState(null); // State for selected Committe Members to edit
  const [committemembers, setCommittemembers] = useState([]); // State to hold fetched Committe Members
  const [successMessage, setSuccessMessage] = useState('');


  // Fetch Committe Members from backend when component loads
  useEffect(() => {
    const fetchCommittemembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/committemember/get');
        setCommittemembers(response.data); // Store fetched Committe Members in state
      } catch (error) {
        console.error("Error fetching Committe Members:", error);
      }
    };

    fetchCommittemembers(); // Call the function when the component mounts
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
      const response = await axios.post('http://localhost:5000/api/committeemembers/post', formData);
      console.log("Committe Member added successfully:", response.data);

      // Refresh the committemember list after successful submission
      const newResponse = await axios.get('http://localhost:5000/api/committemember/get');
      setCommittemembers(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        CommitteMemberName: "",
        email: "",
        phoneNumber: "",
        cnic: "",
        fullAddress: "",
        city: "",
        district: "",
        country: "",
        organization: "",
        created_at: "",
        status: "",

      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Committe Member:", error);
    }
  };


  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`http://localhost:5000/api/committemembers/delete/${selectedCommittememberId}`);
      console.log(`Committemember with ID ${selectedCommittememberId} deleted successfully.`);

      // Set success message
      setSuccessMessage('Committemember deleted successfully.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Refresh the committemember list after deletion
      const newResponse = await axios.get('http://localhost:5000/api/committemember/get');
      setCommittemembers(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedCommittememberId(null);
    } catch (error) {
      console.error(`Error deleting Committe Member with ID ${selectedCommittememberId}:`, error);
    }
  };
  const handleEditClick = (committemember) => {
    setSelectedCommittememberId(committemember.id);
    setEditCommittemember(committemember); // Store the Committe Members data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      CommitteMemberName: committemember.CommitteMemberName,
      email: committemember.email,
      phoneNumber: committemember.phoneNumber,
      cnic: committemember.cnic,
      fullAddress: committemember.fullAddress,
      city: committemember.city,
      district: committemember.district,
      country: committemember.country,
      organization: committemember.organization,
      created_at: committemember.created_at,
      status: committemember.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/committemembers/edit/${selectedCommittememberId}`,
        formData
      );
      console.log("Committemember updated successfully:", response.data);

      const newResponse = await axios.get(
        "http://localhost:5000/api/committemember/get"
      );
      setCommittemembers(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Committemember updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Error updating committemember with ID ${selectedCommittememberId}:`, error);
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
              {/* Add Committe Members Button */}
              <div className="d-flex justify-content-end mb-3" style={{ marginTop: '-20px', width: '120%', marginLeft: '-80px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Add committe members
                </button>
              </div>

              {/* Table */}
              <div className="table-responsive" style={{ marginLeft: '-20px', width: '110%' }}>
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>ID</th>
                      <th>Committe Member Name</th>
                      <th>Email</th>
                      <th>Phone Number</th>
                      <th>CNIC</th>
                      <th>Full Address</th>
                      <th>City</th>
                      <th>District</th>
                      <th>Country</th>
                      <th>Organization</th>
                      <th>Registered_at</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committemembers.length > 0 ? (
                      committemembers.map((committemember) => (
                        <tr key={committemember.id}>
                          <td>{committemember.id}</td>
                          <td>{committemember.CommitteMemberName}</td>
                          <td>{committemember.email}</td>
                          <td>{committemember.phoneNumber}</td>
                          <td>{committemember.cnic}</td>
                          <td>{committemember.fullAddress}</td>
                          <td>{committemember.city}</td>
                          <td>{committemember.district}</td>
                          <td>{committemember.country}</td>
                          <td>{committemember.organization}</td>
                          <td>{committemember.created_at}</td>
                          <td>{committemember.status}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(committemember)}>
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>{" "}
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                setSelectedCommittememberId(committemember.id);
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
                          No Committe Members Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal for Adding Committe members */}
              {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Committe Member</h5>
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
                            <label>Committe Member Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="CommitteMemberName"
                              value={formData.CommitteMemberName}
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
                            <label>CNIC</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cnic"
                              value={formData.cnic}
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
                            <label>City</label>
                            <input
                              type="text"
                              className="form-control"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>District</label>
                            <input
                              type="text"
                              className="form-control"
                              name="district"
                              value={formData.district}
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
                          <div className="form-group">
                            <label>Organization</label>
                            <input
                              type="text"
                              className="form-control"
                              name="organization"
                              value={formData.organization}
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

              {/* Edit Committemember Modal */}
              {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Committe Member</h5>
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
                            <label>Committe Member Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="CommitteMemberName"
                              value={formData.CommitteMemberName}
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
                            <label>CNIC</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cnic"
                              value={formData.cnic}
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
                            <label>City</label>
                            <input
                              type="text"
                              className="form-control"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>District</label>
                            <input
                              type="text"
                              className="form-control"
                              name="district"
                              value={formData.district}
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
                          <div className="form-group">
                            <label>Organization</label>
                            <input
                              type="text"
                              className="form-control"
                              name="organization"
                              value={formData.organization}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Status</label>
                            <select
                              className="form-control"
                              name="status"
                              value={formData.status}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Update Committe Member
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal for Deleting Committemembers */}
              {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Delete Committe member</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <p>Are you sure you want to delete this committe member?</p>
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

export default CommitteMemberArea;
