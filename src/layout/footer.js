import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import SocialLinks from "@components/social";
import useSticky from "@hooks/use-sticky";

const Footer = () => {
  const { sticky } = useSticky();

  return (
    <footer className="footer border-top">
      {/* Widgets Section */}
      <section className="py-1 py-md-2">
        <div className="container overflow-hidden">
          <div className="row gy-1 gy-lg-0 justify-content-between">
            <div className="col-12 col-md-2">
              <div className="widget text-center">
                <Link href="/">
                  <Image
                    src={logo}
                    alt="Discovery Connect Logo"
                    width="120"
                    height="80"
                  />
                </Link>
              </div>
            </div>
            <div className="col-12 col-md-2">
              <div className="widget">
                <h6 className="widget-title mb-1 small">Get in Touch</h6>
                <address className="mb-1 small">
                  Valley Road Westridge, Rawalpindi
                </address>
                <p className="mb-1 small">
                  <a
                    className="link-secondary text-decoration-none"
                    href="tel:+15057922430"
                  >
                    0369-6666665
                  </a>
                </p>
                <p className="mb-0 small text-nowrap">
                  <a
                    className="link-secondary text-decoration-none"
                    href="https://www.discovery-connect.com"
                  >
                    www.discovery-connect.com
                  </a>
                </p>
              </div>
            </div>
            <div className="col-12 col-md-2">
              <div className="widget">
                <h6 className="widget-title mb-1 small">Learn More</h6>
                <ul className="list-unstyled small">
                  <li>
                    <Link
                      href="/about"
                      className="link-secondary text-decoration-none"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="link-secondary text-decoration-none"
                    >
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/advertise"
                      className="link-secondary text-decoration-none"
                    >
                      Advertise
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="link-secondary text-decoration-none"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="link-secondary text-decoration-none"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="widget">
                <h6 className="widget-title mb-1 small">Our Newsletter</h6>
                <p className="mb-1 small">
                  Subscribe to our newsletter for updates.
                </p>
                <form action="#" method="post">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text px-2 py-0">
                      <i className="fa fa-envelope small"></i>{" "}
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-sm fs-7"
                      placeholder="Email Address"
                      required
                    />
                    <button className="btn btn-primary btn-sm" type="submit">
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
      <div className="bg-light py-1">
        <div className="container overflow-hidden p-3">
          <div className="row gy-1 align-items-center">
            <div className="col-md-7 text-center text-md-start small">
              &copy; {new Date().getFullYear()}. All Rights Reserved.
            </div>
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
