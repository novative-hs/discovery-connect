import React from "react";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { NextArrow, PrevArrow } from "@svg/index";
const Pagination = ({ handlePageClick, pageCount, focusPage }) => {
  return (
    <div className="d-flex justify-content-end my-1 ">
      <ReactPaginate
        nextLabel={
          <span className="next page-numbers">
            <NextArrow />
          </span>
        }
        previousLabel={
          <span className="tp-pagination-prev prev page-numbers">
            <PrevArrow />
          </span>
        }
        onPageChange={handlePageClick}
        pageCount={pageCount}
        forcePage={focusPage}
        containerClassName="pagination flex-wrap"
        pageClassName="page-item mx-1"
        pageLinkClassName="page-link rounded-pill"
        previousClassName="page-item mx-1"
        previousLinkClassName="page-link rounded-pill"
        nextClassName="page-item mx-1"
        nextLinkClassName="page-link rounded-pill"
        breakLabel="..."
        breakClassName="page-item mx-1"
        breakLinkClassName="page-link rounded-pill"
        activeClassName="active bg-primary text-white rounded-pill" 
        pageRangeDisplayed={2}
        marginPagesDisplayed={1}
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default Pagination;
