// import React from "react";

// const TextArea = () => {
//   return (
//     <section className="about-area py-5 bg-light">
//       <div className="container">
//         <div className="row g-4 text-center">

//           {/* Who we are */}
//           <div className="col-md-4">
//             <div className="card shadow h-100 border-0 p-4">
//               <i className="bi bi-people-fill text-primary fs-1 mb-3"></i>
//               <h4 className="text-primary mb-3">Who we are?</h4>
//               <p className="text-dark fs-6 lh-lg">
//                 <strong className="text-primary">
//                   “Discovery Connect - Collection and Distribution of Human Biological Material”
//                 </strong>{" "}
//                 The project aims for collection, storage and distribution of Human Biological
//                 Materials (Serum, Plasma, Blood, Urine, Sputum, Pus, Body Fluids, Tissues etc..)
//                 both specific disease oriented or normal human serum and plasma for the manufacturing
//                 of In-Vitro Diagnostic products.
//                 <br />
//                 <br />
//                 At Discovery-Connect, we are revolutionizing the way researchers access biological
//                 samples for their studies after scientific and etifical board approval. Our platform
//                 also serves as a bridge between researcher, and collection sites, ensuring a seamless,
//                 secure, and efficient process for obtaining high-quality samples essential for
//                 groundbreaking research.
//               </p>
//             </div>
//           </div>

//           {/* Mission */}
//           <div className="col-md-4">
//             <div className="card shadow h-100 border-0 p-4">
//               <i className="bi bi-bullseye text-success fs-1 mb-3"></i>
//               <h4 className="text-success mb-3">Our Mission</h4>
//               <p className="text-dark fs-6 lh-lg">
//                 This initiative aims to enhance the availability of high-quality human biological
//                 samples. Facilitate advancements in diagnostic, therapeutic, and preventive measures
//                 and supply normal Human serum and plasma for the IVD Product manufacturer.
//               </p>
//             </div>
//           </div>

//           {/* Join Us */}
//           <div className="col-md-4">
//             <div className="card shadow h-100 border-0 p-4">
//               <i className="bi bi-star-fill text-warning fs-1 mb-3"></i>
//               <h4 className="text-warning mb-3">Join Us Today!</h4>
//               <p className="text-dark fs-6 lh-lg mb-0">
//                 Be part of a trusted platform dedicated to advancing product development. Sign up now
//                 and start discovering the right samples for your study!
//               </p>
//             </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default TextArea;


import React from "react";
import AboutCard from "./AboutCard";

const TextArea = () => {
  return (
    <section className="about-area py-5" style={{ background: "#f5f8ff" }}>
      <div className="container">

        <AboutCard
          title="Who we are?"
          image="/assets/img/about/aaaa.jpg"
          text={
            <>
              <strong style={{ color: "#2d3958" }}>
                “Discovery Connect - Collection and Distribution of Human Biological Material”
              </strong>{" "}
              The project aims for collection, storage and distribution of Human Biological
              Materials (Serum, Plasma, Blood, Urine, Sputum, Pus, Body Fluids, Tissues etc..)
              both specific disease oriented or normal human serum and plasma for the manufacturing
              of In-Vitro Diagnostic products.
              <br />
              <br />
              At Discovery-Connect, we are revolutionizing the way researchers access biological
              samples for their studies after scientific and ethical board approval. Our platform
              also serves as a bridge between researcher, and collection sites, ensuring a seamless,
              secure, and efficient process for obtaining high-quality samples essential for
              groundbreaking research.
            </>
          }
        />

        <AboutCard
          title="Our Mission"
          image="/assets/img/about/about.jpg"
          text="This initiative aims to enhance the availability of high-quality human biological samples. Facilitate advancements in diagnostic, therapeutic, and preventive measures and supply normal Human serum and plasma for the IVD Product manufacturer."
          reverse
          animation="fade-left"
        />

        <AboutCard
          title="Join Us Today!"
          image="/assets/img/about/sample.jpg"
          text="Be part of a trusted platform dedicated to advancing product development. Sign up now and start discovering the right samples for your study!"
        />

      </div>
    </section>
  );
};

export default TextArea;
