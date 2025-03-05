import React from "react";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { NextArrow, PrevArrow } from "@svg/index";
const Pagination = ({ handlePageClick, pageCount, focusPage }) => {
  
  return (
    <div className="d-flex justify-content-end my-4">
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
        pageLinkClassName="page-link"
        previousClassName="page-item mx-1"
        previousLinkClassName="page-link"
        nextClassName="page-item mx-1"
        nextLinkClassName="page-link"
        breakLabel="..."
        breakClassName="page-item mx-1"
        breakLinkClassName="page-link"
        activeClassName="active"
        pageRangeDisplayed={2}
        marginPagesDisplayed={1}
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default Pagination;
