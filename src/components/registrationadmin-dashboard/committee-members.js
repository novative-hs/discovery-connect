import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faQuestionCircle, faPlus } from '@fortawesome/free-solid-svg-icons';

const CommitteeMemberArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // const [showCommitteTypeOptions, setshowCommitteeTypeOptions] = useState(false);
  const [showCommitteeTypeOptions, setShowCommitteeTypeOptions] = useState({});
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommitteememberId, setSelectedCommitteememberId] = useState(null); // Store ID of Committee Members to delete
  const [formData, setFormData] = useState({
    CommitteeMemberName: "",
    email: "",
    phoneNumber: "",
    cnic: "",
    fullAddress: "",
    city: "",
    district: "",
    country: "",
    organization: "",
    committeetype: "",
    created_at: "",
    status: "",
  });
  const [editCommitteemember, setEditCommitteemember] = useState(null); // State for selected Committee Members to edit
  const [committeemembers, setCommitteemembers] = useState([]); // State to hold fetched Committee Members
  const [successMessage, setSuccessMessage] = useState('');


  // Fetch Committee Members from backend when component loads
  useEffect(() => {
    const fetchCommitteemembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/committeemember/get');
        setCommitteemembers(response.data); // Store fetched Committee Members in state
      } catch (error) {
        console.error("Error fetching Committee Members:", error);
      }
    };

    fetchCommitteemembers(); // Call the function when the component mounts
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
      const response = await axios.post('http://localhost:5000/api/committeemember/post', formData);
      console.log("Committee Member added successfully:", response.data);

      // Refresh the committeemember list after successful submission
      const newResponse = await axios.get('http://localhost:5000/api/committeemember/get');
      setCommitteemembers(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        CommitteeMemberName: "",
        email: "",
        phoneNumber: "",
        cnic: "",
        fullAddress: "",
        city: "",
        district: "",
        country: "",
        organization: "",
        committeetype: "",
        created_at: "",
        status: "",

      });
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Committee Member:", error);
    }
  };


  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(`http://localhost:5000/api/committeemember/delete/${selectedCommitteememberId}`);
      console.log(`Committeemember with ID ${selectedCommitteememberId} deleted successfully.`);

      // Set success message
      setSuccessMessage('Committeemember deleted successfully.');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Refresh the committeemember list after deletion
      const newResponse = await axios.get('http://localhost:5000/api/committeemember/get');
      setCommitteemembers(newResponse.data);

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedCommitteememberId(null);
    } catch (error) {
      console.error(`Error deleting Committee Member with ID ${selectedCommitteememberId}:`, error);
    }
  };
  const handleEditClick = (committeemember) => {
    setSelectedCommitteememberId(committeemember.id);
    setEditCommitteemember(committeemember); // Store the Committee Members data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      CommitteeMemberName: committeemember.CommitteeMemberName,
      email: committeemember.email,
      phoneNumber: committeemember.phoneNumber,
      cnic: committeemember.cnic,
      fullAddress: committeemember.fullAddress,
      city: committeemember.city,
      district: committeemember.district,
      country: committeemember.country,
      organization: committeemember.organization,
      committetype: committeemember.committetype,
      created_at: committeemember.created_at,
      status: committeemember.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/committeemember/edit/${selectedCommitteememberId}`,
        formData
      );
      console.log("Committeemember updated successfully:", response.data);

      const newResponse = await axios.get(
        "http://localhost:5000/api/committeemember/get"
      );
      setCommitteemembers(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Committeemember updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Error updating committeemember with ID ${selectedCommitteememberId}:`, error);
    }
  };

  const handleCommitteeTypeClick = async (committeememberId, option) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/committeemember/committeetype/edit/${committeememberId}`,
        { committeetype: option }, // Only send the selected `committeetype`
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('Update successful:', response.data.message);
      // Update the committeemembers state to reflect the change
      setCommitteemembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === committeememberId ? { ...member, committeetype: option } : member
        )
      );
      // Hide the options after the update
      setShowCommitteeTypeOptions((prev) => ({ ...prev, [committeememberId]: false }));
    } catch (error) {
      console.error('Error updating committee member:', error.response?.data?.error || error.message);
    }
  };

  const handleToggleCommitteeTypeOptions = (committeememberId) => {
    setShowCommitteeTypeOptions((prev) => ({
      ...prev,
      [committeememberId]: !prev[committeememberId]
    }));
  };


  const handleStatusClick = async (committeememberId, option) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/committeemember/status/edit/${committeememberId}`,
        { status: option }, // Only send the selected `status`
        { headers: { "Content-Type": "application/json" } }
      );
      console.log('Update successful:', response.data.message);
      // Update the committeemembers state to reflect the change
      setCommitteemembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === committeememberId ? { ...member, status: option } : member
        )
      );
      // Hide the options after the update
      setStatusOptionsVisibility((prev) => ({ ...prev, [committeememberId]: false }));
    } catch (error) {
      console.error('Error updating status:', error.response?.data?.error || error.message);
    }
  };

  const handleToggleStatusOptions = (committeememberId) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [committeememberId]: !prev[committeememberId]
    }));
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
              {/* Add Committee Members Button */}
              <div className="d-flex justify-content-end mb-3" style={{ marginTop: '-20px', width: '120%', marginLeft: '-80px' }}>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  Add committee members
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
                      <th>Contact</th>
                      <th>CNIC</th>
                      <th>Full Address</th>
                      <th>City</th>
                      <th>District</th>
                      <th>Country</th>
                      <th>Organization</th>
                      <th>Committee Type</th>
                      <th>Registered_at</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {committeemembers.length > 0 ? (
                      committeemembers.map((committeemember) => (
                        <tr key={committeemember.id}>
                          <td>{committeemember.id}</td>
                          <td>{committeemember.CommitteeMemberName}</td>
                          <td>{committeemember.email}</td>
                          <td>{committeemember.phoneNumber}</td>
                          <td>{committeemember.cnic}</td>
                          <td>{committeemember.fullAddress}</td>
                          <td>{committeemember.city}</td>
                          <td>{committeemember.district}</td>
                          <td>{committeemember.country}</td>
                          <td>{committeemember.organization}</td>
                          <td>{committeemember.committeetype}</td>
                          <td>{committeemember.created_at}</td>
                          <td>{committeemember.status}</td>
                          <td>
                            <button
                              className="btn btn-success btn-sm py-0 px-1"
                              onClick={() => handleEditClick(committeemember)}>
                              <FontAwesomeIcon icon={faEdit} size="xs" />
                            </button>{" "}
                            <div className="btn-group">
                              <button
                                className="btn btn-warning btn-sm py-0 px-1"
                                onClick={() => handleToggleCommitteeTypeOptions(committeemember.id)}
                              >
                                <FontAwesomeIcon icon={faPlus} size="xs" />
                              </button>
                              {showCommitteeTypeOptions[committeemember.id] && (
                                <div className="dropdown-menu show">
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleCommitteeTypeClick(committeemember.id, "Scientific");
                                    }}
                                  >
                                    Scientific
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleCommitteeTypeClick(committeemember.id, "Ethical");
                                    }}
                                  >
                                    Ethical
                                  </button>
                                </div>
                              )}
                            </div>{""}
                            <div className="btn-group">
                              <button
                                className="btn btn-primary btn-sm py-0 px-1"
                                onClick={() => handleToggleStatusOptions(committeemember.id)}
                              >
                                <FontAwesomeIcon icon={faQuestionCircle} size="xs" />
                              </button>
                              {statusOptionsVisibility[committeemember.id] && (
                                <div className="dropdown-menu show">
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleStatusClick(committeemember.id, "Active");
                                    }}
                                  >
                                    Active
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleStatusClick(committeemember.id, "Inactive");
                                    }}
                                  >
                                    Inactive
                                  </button>
                                </div>
                              )}
                            </div>{""}
                            <button
                              className="btn btn-danger btn-sm py-0 px-1"
                              onClick={() => {
                                setSelectedCommitteememberId(committeemember.id);
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
                          No Committee Members Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal for Adding Committee members */}
              {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Committee Member</h5>
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
                              name="CommitteeMemberName"
                              value={formData.CommitteeMemberName}
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
                            <label>Contact</label>
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
                        <h5 className="modal-title">Edit Committee Member</h5>
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
                            <label>Committee Member Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="CommitteeMemberName"
                              value={formData.CommitteeMemberName}
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

                          {/* <div className="form-group">
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
                          </div> */}
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Update Committee Member
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal for Deleting Committeemembers */}
              {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Delete Committee member</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <div className="modal-body">
                        <p>Are you sure you want to delete this committee member?</p>
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

export default CommitteeMemberArea;
