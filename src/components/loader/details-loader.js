import React from "react";

const PrdDetailsLoader = ({ loading }) => (
  <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 200 }}>
    {loading ? <span>Loading...</span> : null}
  </div>
);

export default PrdDetailsLoader;
