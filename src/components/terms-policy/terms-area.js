import Link from "next/link";
import React from "react";

const TermsArea = () => {
  return (
   <section className="policy__area pb-120">
      <div className="container">
       <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              

              {/* Intro */}
              <div className="mb-4">
                <p className="text-start">
                  <strong>“Discovery Connect - Collection and Distribution of Human Biological Material”</strong><br />
                  The project aims for collection, storage and distribution of Human Biological Materials (Serum, Plasma, Blood, Urine, Sputum, Pus, Body Fluids, Tissues etc.)
                  both specific disease oriented or normal human serum and plasma for the manufacturing of In-Vitro Diagnostic products.
                </p>
                <p className="text-start">
                  Discovery-Connect is the custodian of the HBM and agrees to use this HBM as outlined by the consent. If the HBM is given to another party, it would be through a Material Transfer Agreement (MTA) and appropriate ethical, scientific, and legal approval.
                </p>
              </div>

              {/* Informed Consent */}
              <div className="mb-4">
                <h4 className="fw-bold">Informed Consent</h4>
                <ul className="text-start ps-3">
                  <li>Participation in Discovery Connect is entirely voluntary. Only individuals who provide written informed consent may contribute samples. Participants may withdraw at any time without any impact on their current or future medical care.</li>
                  <li>Participants may withdraw consent at any time by contacting Discovery Connect. Upon withdrawal, no further use of the participant's biological material or data will occur; however, materials or data that have already been distributed or anonymized may continue to be used.</li>
                </ul>
              </div>

              {/* Collection & Use */}
              <div className="mb-4">
                <h4 className="fw-bold">Collection, Storage, and Use of Samples</h4>
                <ul className="text-start ps-3">
                  <li>Samples will be stored securely for a period of analyte stability at the stored temperature.</li>
                  <li>
                    Samples and associated data may be used for:
                    <ul className="ps-4">
                      <li>Development of diagnostics or treatments</li>
                      <li>Research and Development after scientific and ethical approval in addition to IRB.</li>
                    </ul>
                  </li>
                  <li>Samples will not be used for cloning, reproductive research, or any prohibited activities.</li>
                </ul>
              </div>

              {/* Privacy */}
              <div className="mb-4">
                <h4 className="fw-bold">Privacy and Data Protection</h4>
                <ul className="text-start ps-3">
                  <li>Personal identifiers will be removed or pseudonymized where possible.</li>
                  <li>Discovery-Connect will comply with all applicable data protection laws.</li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div className="mb-4">
                <h4 className="fw-bold">Intellectual Property</h4>
                <ul className="text-start ps-3">
                  <li>Research and development outcomes, publications, and intellectual property derived from participants’ samples will not be owned by participants.</li>
                  <li>Participants acknowledge that they will not have any ownership or financial claims over any products, discoveries, or intellectual property that may result from the use of their biological materials.</li>
                </ul>
              </div>

              {/* Liability */}
              <div className="mb-4">
                <h4 className="fw-bold">Limitations of Liability</h4>
                <ul className="text-start ps-3">
                  <li>Discovery-Connect cannot guarantee any personal health benefits from your participation.</li>
                  <li>Discovery-Connect is not responsible for any third-party misuse of shared anonymized data or supplied samples.</li>
                </ul>
              </div>

              {/* Changes */}
              <div className="mb-3">
                <h4 className="fw-bold">Changes to the Terms</h4>
                <ul className="text-start ps-3">
                  <li>Discovery-Connect reserves the right to update these Terms of Service at any time.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsArea;
