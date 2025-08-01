import React from "react";
import { Home } from "@svg/index";
import Link from "next/link";
const ShopBreadcrumb = () => {
  return (
    <section className="breadcrumb__area breadcrumb__style-9 pt-13 pb-55 include-bg">
      <div className="container">
        <div className="row">
          <div className="col-xxl-7">
            <div className="breadcrumb__content p-relative z-index-1">
              <div className="breadcrumb__list has-icon">
  <span className="breadcrumb-icon">
    <Home />
  </span>
  <span>
    <Link href="/">
      Home
    </Link>
  </span>
  <span className="dvdr">
    <i className="fa-regular fa-angle-right"></i>
  </span>
  <span>Samples</span>
</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopBreadcrumb;
