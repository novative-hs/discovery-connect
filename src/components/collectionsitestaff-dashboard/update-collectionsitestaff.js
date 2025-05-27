import React, { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import { notifyError, notifySuccess } from "@utils/toast";
import ErrorMessage from "@components/error-message/error";
import axios from "axios";
// Validation schema
const schema = Yup.object().shape({
  useraccount_email: Yup.string().required("Email is required").label("Email"),
 
  staffName: Yup.string()
    .required("staff Name is required")
    .label("Staff Name"),
  
});

const UpdateCollectionSiteStaff = () => {
  const id = sessionStorage.getItem("userID");
  const { user } = useSelector((state) => state.auth);
  const [collectionsitestaff, setCollectionSiteStaff] = useState([]);
 
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Reset form with new data
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: collectionsitestaff || {}, // Wait until organization is available
  });

  useEffect(() => {    
    fetchcollectionsite();
  }, []);

  const fetchcollectionsite = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsitestaff/get/${id}`
      );
      setCollectionSiteStaff(response.data);
    } catch (error) {
      console.error("Error fetching collectionsitestaff:", error);
    }
  };
 
  useEffect(() => {
    if (collectionsitestaff) {
      
      reset(collectionsitestaff); // Reset form with the organization data when available
    }
  }, [collectionsitestaff, reset]);

 
  const onSubmit = async (data) => {
    let formData = new FormData();

    // Add all the regular fields to the FormData
    for (let key in data) {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/updatedetail/${id}`,
        formData, // Sending the FormData object with both fields and the file
       
      );
      notifySuccess("Collection site staff updated successfully!");
    } catch (error) {
      notifyError("An error occurred while updating the collection site.");
    }
  };
 

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Profile Picture Section */}

        {/* Form Section */}
        <div className="col-lg-9 col-md-8">
          <h4 className="mb-3">Update Profile</h4>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className=" pb-1">Email</label>
                <input
                  {...register("useraccount_email")}
                  type="email"
                  className="form-control"
                  placeholder="Enter Email"
                />
                <ErrorMessage message={errors.useraccount_email?.message} />
              </div>
              
            </div>
          
            <div className="mb-3">
              <label className="pb-1">Staff Name</label>
              <textarea
                {...register("staffName")}
                className="form-control"
                rows="3"
                placeholder="Enter Satff Name"
              ></textarea>
              <ErrorMessage message={errors.staffName?.message} />
            </div>

            <div className="text-end">
              <button type="submit" className="tp-btn-3">
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCollectionSiteStaff;
