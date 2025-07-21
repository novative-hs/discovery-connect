import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import SocialLinks from "@components/social";
import useSticky from "@hooks/use-sticky";

const DashboardFooter = () => {
    const { sticky } = useSticky();

    return (
        <footer className="footer border-top bg-light text-dark"> {/* Light background */}
            {/* Widgets Section */}
            <section className="py-2">
                <div className="container overflow-hidden">
                    <div className="row gy-3 gy-lg-0 justify-content-between">
                        {/* Get in Touch */}
                        <div className="col-12 col-md-4">
                            <div className="widget">
                            <h6 className="widget-title mb-2 fs-6 fw-bold text-uppercase text-danger">Get in Touch</h6>
                                <p className="small d-flex align-items-center gap-5"> {/* General gap for icons */}
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="bi bi-envelope text-danger"></i>
                                        <span className="text-nowrap">support@discoveryconnect.com</span>
                                    </span>
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="bi bi-telephone text-danger"></i>
                                        <a className="text-dark text-decoration-none text-nowrap" href="tel:+15057922430">
                                            0300-5079709
                                        </a>
                                    </span>
                                    {/* Added mx-3 to increase space before website */}
                                    <span className="d-flex align-items-center gap-2 mx-6">
                                        <i className="bi bi-globe text-danger"></i>
                                        <a className="text-danger text-decoration-underline text-nowrap" href="https://www.discovery-connect.com">
                                            www.discovery-connect.com
                                        </a>
                                    </span>
                                </p>
                            </div>
                        </div>
                        {/* Social Links */}
                        <div className="col-md-5 d-flex justify-content-md-end mt-4">
                            <SocialLinks />
                        </div>
                    </div>
                </div>
            </section>

            {/* Copyright Section */}
            <div className="bg-black py-1"> {/* Reduced padding for less height */}
                <div className="container w-75 mx-auto overflow-hidden p-2 text-center"> {/* Center-align text */}
                    <div className="row gy-1 align-items-center">
                        <div className="col-12 small text-light"> {/* Centered text */}
                            &copy; {new Date().getFullYear()} Discovery Connect. All Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default DashboardFooter;
