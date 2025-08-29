import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import SocialLinks from "@components/social";
import { useRouter } from "next/router";
const Footer = () => {

  const router = useRouter();

  const handleSubscribe = () => {
    router.push("/contact"); // Navigate to Contact Us page
  };

  return (
    <footer className="footer border-top bg-light text-dark"> {/* Light background */}
      {/* Widgets Section */}
      <section className="py-4">
        <div className="container overflow-hidden">
          <div className="row gy-3 gy-lg-0 justify-content-between">
            <div className="col-12 col-md-2">
              <Link href="/">
                <Image src={logo} alt="Discovery Connect Logo" width="147" height="75" />
              </Link>
              {/* </div> */}
            </div>

            {/* Learn More */}

            <div className="col-12 col-md-2">
              <div className="widget">
                <h6 className="widget-title mb-2 fs-6 fw-bold text-uppercase text-danger">Learn More</h6>
                <ul className="list-unstyled small">
                  <li><Link href="/about" className="text-dark text-decoration-none">About Us</Link></li>
                  <li><Link href="/contact" className="text-dark text-decoration-none">Contact Us</Link></li>
                  <li><Link href="/terms" className="text-dark text-decoration-none">Terms of Service</Link></li>
                  <li><Link href="/policy" className="text-dark text-decoration-none">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            {/* Quick Links */}

            <div className="col-12 col-md-2">
              <div className="widget">
                <h6 className="widget-title mb-2 fs-6 fw-bold text-uppercase text-danger">Quick Links</h6>
                <ul className="list-unstyled small">
                  <li><Link href="/shop" className="text-dark text-decoration-none">Discover Samples</Link></li>
                  <li><Link href="/register" className="text-dark text-decoration-none">Get Registered</Link></li>
                </ul>
              </div>
            </div>

            {/* Get in Touch */}

            <div className="col-12 col-md-2">
              <div className="widget">
                <h6 className="widget-title mb-2 fs-6 fw-bold text-uppercase text-danger">Get in Touch</h6>
                <p className="small d-flex align-items-center">
                  <i className="bi bi-envelope me-2 text-danger"></i>
                  support@discoveryconnect.com
                </p>
                <p className="small d-flex align-items-center">
                  <i className="bi bi-telephone me-2 text-danger"></i>
                  0300-5079709
                </p>
                <p className="small d-flex align-items-center text-nowrap">
                  <i className="bi bi-globe me-2 text-danger"></i>
                  <a className="text-danger text-decoration-underline" href="https://www.discovery-connect.com">www.discovery-connect.com</a>
                </p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-12 col-md-3 offset-md-1">
              <div className="widget">
                <h6 className="widget-title mb-2 fs-6 fw-bold text-uppercase text-danger">Newsletter</h6>
                <p className="small">Subscribe to our newsletter for updates.</p>
                <form action="#" method="post">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-danger text-white px-2 py-0">
                      <i className="fa fa-envelope small"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-sm fs-7"
                      placeholder="Email Address"
                      required
                      readOnly // optional, since we won't actually submit
                    />

                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={handleSubscribe}
                    >
                      Subscribe
                    </button>

                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Section */}
      <div className="bg-black py-1"> {/* Dark background for copyright section */}
        <div className="container w-75 mx-auto overflow-hidden p-2">
          <div className="row gy-1 align-items-center">
            {/* Left-aligned copyright text */}
            <div className="col-md-7 text-light small text-md-start text-center">
              &copy; {new Date().getFullYear()} Discovery Connect. All Rights Reserved.
            </div>
            {/* Right-aligned social links */}
            <div className="col-md-5 d-flex justify-content-md-end">
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;