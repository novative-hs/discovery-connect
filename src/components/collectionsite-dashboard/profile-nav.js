import { useRouter } from "next/router";
import React from "react";
import { useDispatch } from "react-redux";
import { userLoggedOut } from "src/redux/features/auth/authSlice";

const ProfileNav = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  // handle logout
  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push('/')
  }
  return (
    <div className="profile__tab mr-40">
      <nav>
        <div
          className="nav nav-tabs tp-tab-menu flex-column"
          id="profile-tab"
          role="tablist"
        >
          <button
            className="nav-link"
            id="nav-sample-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-sample"
            type="button"
            role="tab"
            aria-controls="nav-sample"
            aria-selected="false"
          >
            <span>
              <i className="fa-regular fa-circle-info"></i>
            </span>{" "}
            Samples List
          </button>

          <button
            className="nav-link"
            id="nav-sampledispatch-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-sampledispatch"
            type="button"
            role="tab"
            aria-controls="nav-sampledispatch"
            aria-selected="false"
          >
            <span>
              <i className="fa-regular fa-circle-info"></i>
            </span>{" "}
            Samples Dispatch
          </button>

          <button
            className="nav-link"
            id="nav-information-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-information"
            type="button"
            role="tab"
            aria-controls="nav-information"
            aria-selected="false"
          >
            <span>
              <i className="fa-regular fa-circle-info"></i>
            </span>{" "}
            Update Profile
          </button>

          <button
            className="nav-link"
            id="nav-password-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-password"
            type="button"
            role="tab"
            aria-controls="nav-password"
            aria-selected="false"
          >
            <span>
              <i className="fa-regular fa-lock"></i>
            </span>{" "}
            Change Password
          </button>

          <button onClick={handleLogout} className="nav-link" type="button">
            <span>
              <i className="fa-light fa-arrow-right-from-bracket"></i>
            </span>
            Logout
          </button>
          <span
            id="marker-vertical"
            className="tp-tab-line d-none d-sm-inline-block"
          ></span>
        </div>
      </nav>
    </div>
  );
};

export default ProfileNav;
