import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@assets/img/logo/discoveryconnectlogo.png";
import SocialLinks from "@components/social";
import useSticky from "@hooks/use-sticky";

function SingleWidget({ col, col_2, col_3, title, contents }) {
  return (
    <div className={`col-12 col-md-${col_2} col-lg-${col} col-sm-6`}>
      <div className={`footer__widget mb-50 footer-col-11-${col_3}`}>
        <h3 className="footer__widget-title">{title}</h3>
        <div className="footer__widget-content">
          <ul>
            {contents.map((l, i) => (
              <li key={i}>
                <Link href={`/${l.url}`}>{l.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const Footer = () => {
  const { sticky } = useSticky();

  return (
    <footer className="footer">
      {/* Widgets Section */}
      <section className="py-4 py-md-5 py-xl-8">
        <div className="container overflow-hidden">
          <div className="row gy-4 gy-lg-0 justify-content-xl-between">
            <div className="col-12 col-md-4 col-lg-3 col-xl-2">
              <div className="widget">
                <Link href="/">
                  <Image src={logo} alt="Discovery Connect Logo" width="110" height="60" />
                </Link>
              </div>
            </div>
            <div className="col-12 col-md-4 col-lg-3 col-xl-2">
              <div className="widget">
                <h4 className="widget-title mb-4">Get in Touch</h4>
                <address className="mb-4">
                  8014 Edith Blvd NE, Albuquerque, New York, United States
                </address>
                <p className="mb-1">
                  <a className="link-secondary text-decoration-none" href="tel:+15057922430">
                    (505) 792-2430
                  </a>
                </p>
                <p className="mb-0">
                  <a className="link-secondary text-decoration-none" href="mailto:demo@yourdomain.com">
                    demo@yourdomain.com
                  </a>
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4 col-lg-3 col-xl-2">
              <div className="widget">
                <h4 className="widget-title mb-4">Learn More</h4>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <Link href="/about" className="link-secondary text-decoration-none">
                      About
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/contact" className="link-secondary text-decoration-none">
                      Contact
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/advertise" className="link-secondary text-decoration-none">
                      Advertise
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/terms" className="link-secondary text-decoration-none">
                      Terms of Service
                    </Link>
                  </li>
                  <li className="mb-0">
                    <Link href="/privacy" className="link-secondary text-decoration-none">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-lg-3 col-xl-4">
              <div className="widget">
                <h4 className="widget-title mb-4">Our Newsletter</h4>
                <p className="mb-4">
                  Subscribe to our newsletter to get our news & discounts delivered to you.
                </p>
                <form action="#!" method="post">
                  <div className="row gy-4">
                    <div className="col-12">
                      <div className="input-group">
                        <span className="input-group-text" id="email-newsletter-addon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-envelope"
                            viewBox="0 0 16 16"
                          >
                            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                          </svg>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          id="email-newsletter"
                          placeholder="Email Address"
                          aria-label="email-newsletter"
                          aria-describedby="email-newsletter-addon"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-grid">
                        <button className="btn btn-primary" type="submit">
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Section */}
      <div className="bg-light py-4 py-md-5 py-xl-8">
        <div className="container overflow-hidden">
          <div className="row gy-4 gy-md-0 align-items-md-center">
            <div className="col-xs-12 col-md-7 order-1 order-md-0">
              <div className="copyright text-center text-md-start">
                &copy; {new Date().getFullYear()}. All Rights Reserved.
              </div>
            </div>
            <div className="col-xs-12 col-md-5 order-0 order-md-1 d-flex justify-content-md-end">
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
