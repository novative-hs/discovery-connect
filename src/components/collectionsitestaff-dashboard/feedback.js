import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Yup from "yup";
// internal
import { useChangePasswordMutation } from "src/redux/features/auth/authApi";
import ErrorMessage from "@components/error-message/error";
import { notifyError, notifySuccess } from "@utils/toast";

const schema = Yup.object().shape({
    name: Yup.string().required('Name is required').label('Name'),
    sampleName: Yup.string().required('Sample Name is required').label('Sample Name'),
    rating: Yup.number()
      .required('Rating is required')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5')
      .label('Rating'),
    city: Yup.string().required('City is required').label('City'),
    review: Yup.string().required('Review is required').label('Review'),
  });

const Feedback = () => {
  const { user } = useSelector((state) => state.auth);
  const [changePassword, {}] = useChangePasswordMutation();
  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // on submit
  const onSubmit = (data) => {
    changePassword({
      email: user?.email,
      password: data.password,
      newPassword: data.newPassword,
    }).then((result) => {
      if (result?.error) {
        notifyError(result?.error?.data?.message)
      }
      else {
        notifySuccess(result?.data?.message)
      }
    });
    reset();
  };
  
  return (
    <div className="profile__feedback">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-xxl-12">
            <div className="profile__input-box">
              <h4>Name</h4>
              <div className="profile__input">
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Enter your name"
                />
                <ErrorMessage message={errors.name?.message} />
              </div>
            </div>
          </div>
          <div className="col-xxl-12">
            <div className="profile__input-box">
              <h4>Sample Name</h4>
              <div className="profile__input">
                <input
                  {...register("sampleName")}
                  type="text"
                  placeholder="Enter sample name"
                />
                <ErrorMessage message={errors.sampleName?.message} />
              </div>
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="profile__input-box">
              <h4>Rating</h4>
              <div className="profile__input">
                <input
                  {...register("rating")}
                  type="number"
                  placeholder="Enter rating (1-5)"
                />
                <ErrorMessage message={errors.rating?.message} />
              </div>
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="profile__input-box">
              <h4>City</h4>
              <div className="profile__input">
                <input
                  {...register("city")}
                  type="text"
                  placeholder="Enter city"
                />
                <ErrorMessage message={errors.city?.message} />
              </div>
            </div>
          </div>
          <div className="col-xxl-12">
            <div className="profile__input-box">
              <h4>Review</h4>
              <div className="profile__input">
                <textarea
                  {...register("review")}
                  placeholder="Write your review"
                />
                <ErrorMessage message={errors.review?.message} />
              </div>
            </div>
          </div>
          <div className="col-xxl-6 col-md-6">
            <div className="profile__btn">
              <button type="submit" className="tp-btn-3">
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Feedback;