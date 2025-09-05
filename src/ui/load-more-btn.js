import React from "react";

const LoadMoreBtn = ({ handleLoadMore }) => (
  <div className="text-center pt-20 pb-20">
    <button className="tp-btn tp-btn-black" onClick={handleLoadMore}>Load More</button>
  </div>
);

export default LoadMoreBtn;
