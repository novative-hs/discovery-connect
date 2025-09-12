// import React from "react";

// const boardMembers = [
//   {
//     name: "Dr. Shahid Baig",
//     designation: "Professor / Head of Life Sciences Department",
//     university: "Standing Committee for Scientific and Technological Cooperation (COMSTECH/HSA)",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "shahidbaig@hsa.edu.pk",
//     contact: "0300-973-0304",
//     comments: "He specializes in human genomics, disease gene discovery, health biotechnology, and the application of science and technology for healthcare innovation.",
//     picture: "/assets/img/board-advisory/Dr Shahid Mehmood.jpg"
//   },
//   {
//     name: "Dr. Mattiurrehman",
//     designation: "Instructor - Patient Safety And Quality of Care (DPSQOC)",
//     university: "Health Services Academy (HSA)",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "matiurrahman@hsa.edu.pk",
//     contact: "0321-5216312",
//     comments: "He specializes in Healthcare Consulting, Leadership Development, Public Speaking, Management Consulting, Life Coaching, and Educational Consulting.",
//     picture: "/assets/img/board-advisory/Dr-Matiur-Rahman.jpeg"
//   },
//   {
//     name: "Dr. S. Marriam Bakhtiar",
//     designation: "Associate Professor / HoD BI & BS",
//     university: "Capital University of Science and Technology (CUST)",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "marriam@cust.edu.pk",
//     contact: "051-111-555-666",
//     comments: "She specializes in Human Molecular Genetics with research focused on inherited and infectious diseases prevalent in Pakistan.",
//     picture: "/assets/img/board-advisory/Marriam.png"
//   },
//   {
//     name: "Dr. Ambrin Fatima",
//     designation: "Assistant Professor, Department of Biological and Biomedical Sciences",
//     university: "The Aga Khan University Medical College",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "ambrin.fatima@aku.edu",
//     contact: "021-348-64145",
//     comments: "Dr. Ambrin Fatima holds a PhD in Human Molecular Genetics and completed her postdoctoral research at Uppsala University. She specializes in iPSC-based disease modeling.",
//     picture: "/assets/img/board-advisory/dr ambrin.jpg"
//   },
//   {
//     name: "Dr. Afsar Mian",
//     designation: "Team Lead, Associate Professor",
//     university: "The Aga Khan University Medical College",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "afsar.mian@aku.edu",
//     contact: "021-348-65542",
//     comments: "Dr. Afsar Mian specializes in targeted therapies for treatment-resistant leukemia and developed PF-114, now in phase III trials.",
//     picture: "/assets/img/board-advisory/Afsar-Mian.jpg"
//   },
//   {
//     name: "Dr. Moazur Rahman",
//     designation: "Director",
//     university: "Centre of Excellence in Molecular Biology (CEMB)",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "moaz@cemb.edu.pk",
//     contact: "042-352-93127",
//     comments: "Specializes in novel drug development and translational research, including therapies for treatment-resistant leukemia, gene-editing treatments for beta-thalassemia, and sickle cell anemia.",
//     picture: "/assets/img/board-advisory/dr moazur.jpg"
//   },
//   {
//     name: "Dr. Muhammad Farooq",
//     designation: "Professor Bioinformatics & Biotechnology",
//     university: "Government College University Faisalabad (GCUF)",
//     city: "Faisalabad",
//     country: "Pakistan",
//     email: "mfarooq@gcuf.edu.pk",
//     contact: "-",
//     comments: "Research expertise in bioinformatics and biotechnology.",
//     picture: "/assets/img/board-advisory/dr muhammad farooq.jpg"
//   },
//   {
//     name: "Dr. Asad Hussain Shah",
//     designation: "Head, Dept. of Biotechnology / Director, ORIC (Administration)",
//     university: "University of Kotli, Azad Jammu and Kashmir",
//     city: "Azad Jammu and Kashmir",
//     country: "Pakistan",
//     email: "syedasadhamdani@gmail.com",
//     contact: "058-269-60057",
//     comments: "Research focuses on molecular biology, plant biotechnology, and biodiversity, with emphasis on genomics and plant breeding.",
//     picture: "/assets/img/board-advisory/dr asad hussain.jpg"
//   },
//   {
//     name: "Dr. Nazeer Ahmed",
//     designation: "Professor Faculty of Life Sciences and Informatics",
//     university: "Balochistan University of Information Technology, Engineering and Management Sciences (BUITEMS), Quetta",
//     city: "Quetta",
//     country: "Pakistan",
//     email: "nazeer.ahmedbuitms.edu.pk",
//     contact: "-",
//     comments: "Research focuses on DNA-based biodiversity inventories.",
//     picture: "/assets/img/board-advisory/dr Nazeer.png"
//   },
//   {
//     name: "Dr. Uzma Abdullah",
//     designation: "Assistant Professor (TTS) (HEC Approved Supervisor)",
//     university: "Pir Mehr Ali Shah-Arid Agriculture University Rawalpindi",
//     city: "Rawalpindi",
//     country: "Pakistan",
//     email: "uzma.abdullah@uaar.edu.pk",
//     contact: "-",
//     comments: "Research interests include human molecular genetics with a focus on Mendelian disorders.",
//     picture: "/assets/img/board-advisory/userimage.png"
//   },
//   {
//     name: "Dr. Muhammad Ansar",
//     designation: "Professor-Biochemistry (BMB)",
//     university: "Quaid-i-Azam University, Islamabad",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "ansar@qau.edu.pk",
//     contact: "051-906-43146",
//     comments:
//       "Research focuses on genes linked to retinal and neurological disorders, methylation, glycosylation, and genomic studies related to cancer and copy number variations.",
//     picture: "/assets/img/board-advisory/dr muhammad ansar.jpg",
//   },
//   {
//     name: "Dr. Iram Anjum",
//     designation: "Principal",
//     university: "Kinnaird College Lahore",
//     city: "Lahore",
//     country: "Pakistan",
//     email: "iram.anjum@kinnaird.edu.pk",
//     contact: "042-992-037-814",
//     comments:
//       "Expertise in DNA extraction, PCR, genetic analysis, sequencing, and other molecular biology techniques.",
//     picture: "/assets/img/board-advisory/dr iram anjum.jpg",
//   },
//   {
//     name: "Dr. Muhammad Ilyas",
//     designation: "Professor (Assistant) at Islamia College University",
//     university: "Islamia College University Peshawar",
//     city: "Peshawar",
//     country: "Pakistan",
//     email: "milyas@icp.edu.pk",
//     contact: "0300-5740568",
//     comments:
//       "Focuses on translational genomics, biomedical informatics, and personalized genomics with training experience at Harvard Medical School, UCL, CEMB, and South Korea.",
//     picture: "/assets/img/board-advisory/userimage.png",
//   },
//   {
//     name: "Dr. Hamid Mukhtar",
//     designation:
//       "Professor of Biotechnology and former Director at Institute of Industrial Biotechnology",
//     university: "Government College University, Lahore",
//     city: "Lahore",
//     country: "Pakistan",
//     email: "hamidmukhtar@gcu.edu.pk",
//     contact: "0009-921-3602",
//     comments:
//       "Specializes in Bioprocess Technology, Stem Cell Research, Molecular Biology, and nanomaterials with 200+ research publications.",
//     picture: "/assets/img/board-advisory/Hamid_Mukhtar.jpg",
//   },
//   {
//     name: "Dr. Amjad Ali",
//     designation: "Associate Professor, ASAB",
//     university: "National University of Sciences and Technology (NUST)",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "amjad.ali@asab.nust.edu.pk",
//     contact: "0333-9191903",
//     comments:
//       "Recipient of PAS Gold Medal 2020, specializes in bacterial diagnostics, vaccine design tools, and advancing genomic sciences in Pakistan.",
//     picture: "/assets/img/board-advisory/amjad ali.png",
//   },
//   {
//     name: "Dr. Bilal Haider Abbasi",
//     designation: "Associate Professor and Chairperson-Biotechnology",
//     university: "Quaid-i-Azam University, Islamabad",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "bhabbasi@qau.edu.pk",
//     contact: "051-906-44121",
//     comments:
//       "Specializes in medicinal plant biotechnology, secondary metabolite enhancement, and conservation with extensive publications and research grants.",
//     picture: "/assets/img/board-advisory/bilal haider.jpg",
//   },
//   {
//     name: "Dr. Asma Gul",
//     designation: "Professor (Tenured)",
//     university: "International Islamic University Islamabad",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "gulasma@iiu.edu.pk",
//     contact: "051-901-9837",
//     comments:
//       "Specializes in biochemistry, molecular biology, and next-generation DNA sequencing.",
//     picture: "/assets/img/board-advisory/asma gul.png",
//   },
//   {
//     name: "Dr. Ghulam Hussain",
//     designation: "Associate Professor / Chairperson-Physiology",
//     university: "Government College University Faisalabad (GCUF)",
//     city: "Faisalabad",
//     country: "Pakistan",
//     email: "gh_azer@hotmail.com",
//     contact: "-",
//     comments: "Expertise in physiology and related life sciences research.",
//     picture: "/assets/img/board-advisory/gulam hussain.jpg",
//   },
//   {
//     name: "Dr. Zaheer Hussain",
//     designation: "Joint Scientific Advisor (P&C)",
//     university: "Ministry of Science & Technology, Government of Pakistan",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "asa-pc@most.gov.pk",
//     contact: "051-920-7276",
//     comments: "Advisor in science and technology policy and development.",
//     picture: "/assets/img/board-advisory/userimage.png",
//   },
//   {
//     name: "Dr. Najeeb Ullah",
//     designation: "Member Science & Technology / ICT",
//     university: "Planning Commission of Pakistan",
//     city: "Islamabad",
//     country: "Pakistan",
//     email: "-",
//     contact: "0000-920-6241",
//     comments:
//       "Over 17 years of experience in academia, policy, and innovation leadership, previously served as Interim Minister for Science & Technology.",
//     picture: "/assets/img/board-advisory/dr_najeeb.jpg",
//   },
//   {
//     name: "Dr. Muhammad Aamer Mehmood",
//     designation: "Professor-Bioinformatics & Biotechnology",
//     university: "Government College University Faisalabad (GCUF)",
//     city: "Faisalabad",
//     country: "Pakistan",
//     email: "draamer@gcuf.edu.pk",
//     contact: "",
//     comments:
//       "Research focuses on algae-based innovations for net-zero emissions, biorefinery, sustainable biomanufacturing, CO₂ capture, bioproducts, and bioremediation.",
//     picture: "/assets/img/board-advisory/aamer.jpg",
//   },
//   {
//     name: "Dr. Irshad Hussain",
//     designation: "Professor, Department of Chemistry & Chemical Engineering",
//     university: "Lahore University of Management Sciences (LUMS)",
//     city: "Lahore",
//     country: "Pakistan",
//     email: "ihussain@lums.edu.pk",
//     contact: "",
//     comments:
//       "Founding member of SBASSE at LUMS, pioneer of nanobiotech research in Pakistan with 150+ publications in top-tier journals.",
//     picture: "/assets/img/board-advisory/irshad hussain.jpg",
//   },
//   {
//     name: "Dr. Munir Iqbal",
//     designation: "Professor at The Pirbright Institute",
//     university: "The Pirbright Institute, United Kingdom",
//     city: "Pirbright",
//     country: "Surrey, England, United Kingdom",
//     email: "munir.iqbal@pirbright.ac.uk",
//     contact: "",
//     comments:
//       "Leads Avian Influenza and Newcastle Disease group, develops multivalent vaccines and rapid diagnostics for poultry health.",
//     picture: "/assets/img/board-advisory/Munir Iqbal.jpg",
//   },
//   {
//     name: "Dr. Isaac John",
//     designation:
//       "Managing Director at Ashford and St. Peter’s Hospitals NHS Trust",
//     university:
//       "Ashford and St. Peter's Hospitals NHS Foundation Trust",
//     city: "Ashford",
//     country: "United Kingdom",
//     email: "isaac.john@nhs.net",
//     contact: "01932 722901",
//     comments:
//       "Deputy Director of R&D, Honorary Lecturer, with 10+ years of molecular genetics research and GCP training platform development.",
//     picture: "/assets/img/board-advisory/isaac john.jpg",
//   },
//   {
//     name: "Dr. Javed Ahmad Bhalli",
//     designation: "Managing Director at BioReliance, Rockville, MD, USA",
//     university: "Frontage Laboratories, Inc",
//     city: "Greater Cleveland",
//     country: "USA",
//     email: "jbhalli@frontagelab.com",
//     contact: "1501-319-2453",
//     comments:
//       "Expert in Safety Assessment, Toxicology, Mutagenesis, Genetic & Molecular Toxicology, Drug Development, and Regulatory Affairs.",
//     picture: "/assets/img/board-advisory/javed ahmed.jpg",
//   },
//   // {
//   //   name: "Dr. Saif Ur Rehman",
//   //   designation: "",
//   //   university: "",
//   //   city: "",
//   //   country: "",
//   //   email: "",
//   //   contact: "",
//   //   comments: "",
//   //   picture: "/assets/img/board-advisory/userimage.png",
//   // },
//   {
//     name: "Dr. Muhammad Sajid Hussain",
//     designation:
//       "Group leader, Institute of Biochemistry I, Medical Faculty",
//     university: "University of Cologne, Germany",
//     city: "Cologne",
//     country: "Germany",
//     email: "mhussain@uni-koeln.de",
//     contact: "-",
//     comments:
//       "Research on molecular pathogenesis of inherited neurological disorders including microcephaly, Filippi syndrome, and essential tremor.",
//     picture: "/assets/img/board-advisory/muhammad sajid.jpg",
//   },
//   {
//     name: "Dr. Lars Allan Larsen",
//     designation: "Professor of Developmental Genetics",
//     university: "Copenhagen University",
//     city: "Copenhagen",
//     country: "Denmark",
//     email: "larsal@sund.ku.dk",
//     contact: "(+45) 35 32 78 27",
//     comments:
//       "Experienced research leader with expertise in developmental genetics, academic supervision, and interdisciplinary projects.",
//     picture: "/assets/img/board-advisory/lars allan.jpg",
//   },
//   {
//     name: "Dr. Muhammad Kamal Khan",
//     designation:
//       "Associate Professor at University of Maryland, College Park, USA",
//     university: "University of Maryland, College Park, USA",
//     city: "Maryland",
//     country: "USA",
//     email: "mkkamazai@hotmail.com",
//     contact: "051-905-7656",
//     comments:
//       "PhD in English, specializes in TESOL, language policy, multilingual education, and phonetics with multiple international fellowships.",
//     picture: "/assets/img/board-advisory/muhammad kamal khan.jpg",
//   },
//   {
//     name: "Dr. Erica Davis",
//     designation:
//       "Professor, Pediatrics, Cell and Developmental Biology",
//     university: "Northwestern University Feinberg School of Medicine",
//     city: "Chicago, Illinois",
//     country: "United States",
//     email: "eridavis@luriechildrens.org",
//     contact: "-",
//     comments:
//       "Research focuses on rare pediatric genetic diseases through Diversity, Discovery, and Development (3D).",
//     picture: "/assets/img/board-advisory/erica e.jpg",
//   },
// ];

// const BoardAdvisoryArea = () => {
//   const chairman = boardMembers.find((m) => m.name === "Dr. Shahid Baig");
//   const otherMembers = boardMembers.filter((m) => m.name !== "Dr. Shahid Baig");

//   const renderCard = (member, large = false) => (
//     <div className="col-md-6 col-lg-4 mb-4" key={member.name}>
//       <div
//         className={`card shadow-sm border h-100 text-center p-4 hover-scale`}
//       >

//         {/* Profile Image */}
//         <div className="mb-3">
//           <img
//             src={member.picture}
//             alt={member.name}
//             className={`rounded-circle border border-3 border-primary ${large ? "chairman-img" : ""}`}
//             style={{
//               width: large ? "160px" : "120px",
//               height: large ? "160px" : "120px",
//               objectFit: "cover",
//             }}
//           />
//         </div>

//         {/* Name & Designation */}
//         <div className="mb-2">
//           <h4 className="fw-bold text-dark mb-1">{member.name}</h4>
//           <small className="text-primary fw-semibold">{member.designation}</small>
//         </div>

//         {/* University & Location */}
//         {(member.university || member.city || member.country) && (
//           <div className="mb-2 text-muted">
//             {member.university && <p className="mb-0">{member.university}</p>}
//             {(member.city || member.country) && (
//               <p className="mb-0">
//                 {member.city}
//                 {member.city && member.country ? ", " : ""}
//                 {member.country}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Contact Info */}
//         {(member.contact && member.contact !== "-") || (member.email && member.email !== "-") ? (
//           <div className="mb-3 text-secondary">
//             {member.contact && member.contact !== "-" && (
//               <p className="mb-1">
//                 <i className="fas fa-phone-alt me-2"></i>
//                 {member.contact}
//               </p>
//             )}
//             {member.email && member.email !== "-" && (
//               <p className="mb-0">
//                 <i className="fas fa-envelope me-2"></i>
//                 {member.email}
//               </p>
//             )}
//           </div>
//         ) : null}

//         {/* Comments */}
//         {member.comments && member.comments !== "-" && (
//           <div className="card-body bg-light rounded">
//             <p className="fst-italic text-muted mb-0">
//               <i className="fas fa-quote-left text-warning me-1"></i>
//               {member.comments}
//               <i className="fas fa-quote-right text-warning ms-1"></i>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <section className="board-advisory py-5 bg-light">
//       <div className="container">
//         {/* Main Heading */}
//         <h2
//           className="text-start text-uppercase fw-bold text-primary"
//           style={{ marginBottom: "3rem" }}
//         >
//           Board of Advisor (BOA)
//         </h2>

//         {/* Chairman Section */}
//         <h3
//           className="text-success fw-bold"
//           style={{ marginBottom: "3rem" }}
//         >
//           Chairman
//         </h3>
//         <div className="row justify-content-center">
//           {chairman && renderCard(chairman, true)}
//         </div>

//         {/* Nominee Members Section */}
//         <h3
//           className="text-success fw-bold"
//           style={{ marginBottom: "4rem", marginTop: "4rem" }}
//         >
//           Nominee Members of BOA
//         </h3>
//         <div className="row g-4">{otherMembers.map((m) => renderCard(m))}</div>
//       </div>




//       {/* Extra CSS */}
//       <style jsx>{`
//         .hover-scale {
//           transition: transform 0.3s;
//         }
//         .hover-scale:hover {
//           transform: translateY(-5px) scale(1.03);
//         }
//         .highlight-chairman {
//           border: 2px solid #0d6efd;
//           background: #f8f9fa;
//         }
//         .chairman-img {
//           box-shadow: 0 0 15px rgba(13, 110, 253, 0.5);
//         }
//       `}</style>
//     </section>
//   );
// };

// export default BoardAdvisoryArea;




import React from "react";

const boardMembers = [
  {
    name: "Dr. Shahid Baig",
    designation: "Professor / Head of Life Sciences Department",
    university:
      "Standing Committee for Scientific and Technological Cooperation (COMSTECH/HSA)",
    city: "Islamabad",
    country: "Pakistan",
    email: "shahidbaig@hsa.edu.pk",
    contact: "0300-973-0304",
    comments:
      "He specializes in human genomics, disease gene discovery, health biotechnology, and the application of science and technology for healthcare innovation.",
    picture: "/assets/img/board-advisory/Dr Shahid Mehmood.jpg",
  },
  {
    name: "Dr. Mattiurrehman",
    designation: "Instructor - Patient Safety And Quality of Care (DPSQOC)",
    university: "Health Services Academy (HSA)",
    city: "Islamabad",
    country: "Pakistan",
    email: "matiurrahman@hsa.edu.pk",
    contact: "0321-5216312",
    comments:
      "He specializes in Healthcare Consulting, Leadership Development, Public Speaking, Management Consulting, Life Coaching, and Educational Consulting.",
    picture: "/assets/img/board-advisory/Dr-Matiur-Rahman.jpeg",
  },
  {
    name: "Dr. S. Marriam Bakhtiar",
    designation: "Associate Professor / HoD BI & BS",
    university: "Capital University of Science and Technology (CUST)",
    city: "Islamabad",
    country: "Pakistan",
    email: "marriam@cust.edu.pk",
    contact: "051-111-555-666",
    comments: "She specializes in Human Molecular Genetics with research focused on inherited and infectious diseases prevalent in Pakistan.",
    picture: "/assets/img/board-advisory/Marriam.png"
  },
  {
    name: "Dr. Ambrin Fatima",
    designation: "Assistant Professor, Department of Biological and Biomedical Sciences",
    university: "The Aga Khan University Medical College",
    city: "Islamabad",
    country: "Pakistan",
    email: "ambrin.fatima@aku.edu",
    contact: "021-348-64145",
    comments: "Dr. Ambrin Fatima holds a PhD in Human Molecular Genetics and completed her postdoctoral research at Uppsala University. She specializes in iPSC-based disease modeling.",
    picture: "/assets/img/board-advisory/dr ambrin.jpg"
  },
  {
    name: "Dr. Afsar Mian",
    designation: "Team Lead, Associate Professor",
    university: "The Aga Khan University Medical College",
    city: "Islamabad",
    country: "Pakistan",
    email: "afsar.mian@aku.edu",
    contact: "021-348-65542",
    comments: "Dr. Afsar Mian specializes in targeted therapies for treatment-resistant leukemia and developed PF-114, now in phase III trials.",
    picture: "/assets/img/board-advisory/Afsar-Mian.jpg"
  },
  {
    name: "Dr. Moazur Rahman",
    designation: "Director",
    university: "Centre of Excellence in Molecular Biology (CEMB)",
    city: "Islamabad",
    country: "Pakistan",
    email: "moaz@cemb.edu.pk",
    contact: "042-352-93127",
    comments: "Specializes in novel drug development and translational research, including therapies for treatment-resistant leukemia, gene-editing treatments for beta-thalassemia, and sickle cell anemia.",
    picture: "/assets/img/board-advisory/dr moazur.jpg"
  },
  {
    name: "Dr. Muhammad Farooq",
    designation: "Professor Bioinformatics & Biotechnology",
    university: "Government College University Faisalabad (GCUF)",
    city: "Faisalabad",
    country: "Pakistan",
    email: "mfarooq@gcuf.edu.pk",
    contact: "-",
    comments: "Research expertise in bioinformatics and biotechnology.",
    picture: "/assets/img/board-advisory/dr muhammad farooq.jpg"
  },
  {
    name: "Dr. Asad Hussain Shah",
    designation: "Head, Dept. of Biotechnology / Director, ORIC (Administration)",
    university: "University of Kotli, Azad Jammu and Kashmir",
    city: "Azad Jammu and Kashmir",
    country: "Pakistan",
    email: "syedasadhamdani@gmail.com",
    contact: "058-269-60057",
    comments: "Research focuses on molecular biology, plant biotechnology, and biodiversity, with emphasis on genomics and plant breeding.",
    picture: "/assets/img/board-advisory/dr asad hussain.jpg"
  },
  {
    name: "Dr. Nazeer Ahmed",
    designation: "Professor Faculty of Life Sciences and Informatics",
    university: "Balochistan University of Information Technology, Engineering and Management Sciences (BUITEMS), Quetta",
    city: "Quetta",
    country: "Pakistan",
    email: "nazeer.ahmedbuitms.edu.pk",
    contact: "-",
    comments: "Research focuses on DNA-based biodiversity inventories.",
    picture: "/assets/img/board-advisory/dr Nazeer.png"
  },
  {
    name: "Dr. Uzma Abdullah",
    designation: "Assistant Professor (TTS) (HEC Approved Supervisor)",
    university: "Pir Mehr Ali Shah-Arid Agriculture University Rawalpindi",
    city: "Rawalpindi",
    country: "Pakistan",
    email: "uzma.abdullah@uaar.edu.pk",
    contact: "-",
    comments: "Research interests include human molecular genetics with a focus on Mendelian disorders.",
    picture: "/assets/img/board-advisory/userimage.png"
  },
  {
    name: "Dr. Muhammad Ansar",
    designation: "Professor-Biochemistry (BMB)",
    university: "Quaid-i-Azam University, Islamabad",
    city: "Islamabad",
    country: "Pakistan",
    email: "ansar@qau.edu.pk",
    contact: "051-906-43146",
    comments:
      "Research focuses on genes linked to retinal and neurological disorders, methylation, glycosylation, and genomic studies related to cancer and copy number variations.",
    picture: "/assets/img/board-advisory/dr muhammad ansar.jpg",
  },
  {
    name: "Dr. Iram Anjum",
    designation: "Principal",
    university: "Kinnaird College Lahore",
    city: "Lahore",
    country: "Pakistan",
    email: "iram.anjum@kinnaird.edu.pk",
    contact: "042-992-037-814",
    comments:
      "Expertise in DNA extraction, PCR, genetic analysis, sequencing, and other molecular biology techniques.",
    picture: "/assets/img/board-advisory/dr iram anjum.jpg",
  },
  {
    name: "Dr. Muhammad Ilyas",
    designation: "Professor (Assistant) at Islamia College University",
    university: "Islamia College University Peshawar",
    city: "Peshawar",
    country: "Pakistan",
    email: "milyas@icp.edu.pk",
    contact: "0300-5740568",
    comments:
      "Focuses on translational genomics, biomedical informatics, and personalized genomics with training experience at Harvard Medical School, UCL, CEMB, and South Korea.",
    picture: "/assets/img/board-advisory/userimage.png",
  },
  {
    name: "Dr. Hamid Mukhtar",
    designation:
      "Professor of Biotechnology and former Director at Institute of Industrial Biotechnology",
    university: "Government College University, Lahore",
    city: "Lahore",
    country: "Pakistan",
    email: "hamidmukhtar@gcu.edu.pk",
    contact: "0009-921-3602",
    comments:
      "Specializes in Bioprocess Technology, Stem Cell Research, Molecular Biology, and nanomaterials with 200+ research publications.",
    picture: "/assets/img/board-advisory/Hamid_Mukhtar.jpg",
  },
  {
    name: "Dr. Amjad Ali",
    designation: "Associate Professor, ASAB",
    university: "National University of Sciences and Technology (NUST)",
    city: "Islamabad",
    country: "Pakistan",
    email: "amjad.ali@asab.nust.edu.pk",
    contact: "0333-9191903",
    comments:
      "Recipient of PAS Gold Medal 2020, specializes in bacterial diagnostics, vaccine design tools, and advancing genomic sciences in Pakistan.",
    picture: "/assets/img/board-advisory/amjad ali.png",
  },
  {
    name: "Dr. Bilal Haider Abbasi",
    designation: "Associate Professor and Chairperson-Biotechnology",
    university: "Quaid-i-Azam University, Islamabad",
    city: "Islamabad",
    country: "Pakistan",
    email: "bhabbasi@qau.edu.pk",
    contact: "051-906-44121",
    comments:
      "Specializes in medicinal plant biotechnology, secondary metabolite enhancement, and conservation with extensive publications and research grants.",
    picture: "/assets/img/board-advisory/bilal haider.jpg",
  },
  {
    name: "Dr. Asma Gul",
    designation: "Professor (Tenured)",
    university: "International Islamic University Islamabad",
    city: "Islamabad",
    country: "Pakistan",
    email: "gulasma@iiu.edu.pk",
    contact: "051-901-9837",
    comments:
      "Specializes in biochemistry, molecular biology, and next-generation DNA sequencing.",
    picture: "/assets/img/board-advisory/asma gul.png",
  },
  {
    name: "Dr. Ghulam Hussain",
    designation: "Associate Professor / Chairperson-Physiology",
    university: "Government College University Faisalabad (GCUF)",
    city: "Faisalabad",
    country: "Pakistan",
    email: "gh_azer@hotmail.com",
    contact: "-",
    comments: "Expertise in physiology and related life sciences research.",
    picture: "/assets/img/board-advisory/gulam hussain.jpg",
  },
  {
    name: "Dr. Zaheer Hussain",
    designation: "Joint Scientific Advisor (P&C)",
    university: "Ministry of Science & Technology, Government of Pakistan",
    city: "Islamabad",
    country: "Pakistan",
    email: "asa-pc@most.gov.pk",
    contact: "051-920-7276",
    comments: "Advisor in science and technology policy and development.",
    picture: "/assets/img/board-advisory/userimage.png",
  },
  {
    name: "Dr. Najeeb Ullah",
    designation: "Member Science & Technology / ICT",
    university: "Planning Commission of Pakistan",
    city: "Islamabad",
    country: "Pakistan",
    email: "-",
    contact: "0000-920-6241",
    comments:
      "Over 17 years of experience in academia, policy, and innovation leadership, previously served as Interim Minister for Science & Technology.",
    picture: "/assets/img/board-advisory/dr_najeeb.jpg",
  },
  {
    name: "Dr. Muhammad Aamer Mehmood",
    designation: "Professor-Bioinformatics & Biotechnology",
    university: "Government College University Faisalabad (GCUF)",
    city: "Faisalabad",
    country: "Pakistan",
    email: "draamer@gcuf.edu.pk",
    contact: "",
    comments:
      "Research focuses on algae-based innovations for net-zero emissions, biorefinery, sustainable biomanufacturing, CO₂ capture, bioproducts, and bioremediation.",
    picture: "/assets/img/board-advisory/aamer.jpg",
  },
  {
    name: "Dr. Irshad Hussain",
    designation: "Professor, Department of Chemistry & Chemical Engineering",
    university: "Lahore University of Management Sciences (LUMS)",
    city: "Lahore",
    country: "Pakistan",
    email: "ihussain@lums.edu.pk",
    contact: "",
    comments:
      "Founding member of SBASSE at LUMS, pioneer of nanobiotech research in Pakistan with 150+ publications in top-tier journals.",
    picture: "/assets/img/board-advisory/irshad hussain.jpg",
  },
  {
    name: "Dr. Munir Iqbal",
    designation: "Professor at The Pirbright Institute",
    university: "The Pirbright Institute, United Kingdom",
    city: "Pirbright",
    country: "Surrey, England, United Kingdom",
    email: "munir.iqbal@pirbright.ac.uk",
    contact: "",
    comments:
      "Leads Avian Influenza and Newcastle Disease group, develops multivalent vaccines and rapid diagnostics for poultry health.",
    picture: "/assets/img/board-advisory/Munir Iqbal.jpg",
  },
  {
    name: "Dr. Isaac John",
    designation:
      "Managing Director at Ashford and St. Peter’s Hospitals NHS Trust",
    university:
      "Ashford and St. Peter's Hospitals NHS Foundation Trust",
    city: "Ashford",
    country: "United Kingdom",
    email: "isaac.john@nhs.net",
    contact: "01932 722901",
    comments:
      "Deputy Director of R&D, Honorary Lecturer, with 10+ years of molecular genetics research and GCP training platform development.",
    picture: "/assets/img/board-advisory/isaac john.jpg",
  },
  {
    name: "Dr. Javed Ahmad Bhalli",
    designation: "Managing Director at BioReliance, Rockville, MD, USA",
    university: "Frontage Laboratories, Inc",
    city: "Greater Cleveland",
    country: "USA",
    email: "jbhalli@frontagelab.com",
    contact: "1501-319-2453",
    comments:
      "Expert in Safety Assessment, Toxicology, Mutagenesis, Genetic & Molecular Toxicology, Drug Development, and Regulatory Affairs.",
    picture: "/assets/img/board-advisory/javed ahmed.jpg",
  },
  // {
  //   name: "Dr. Saif Ur Rehman",
  //   designation: "",
  //   university: "",
  //   city: "",
  //   country: "",
  //   email: "",
  //   contact: "",
  //   comments: "",
  //   picture: "/assets/img/board-advisory/userimage.png",
  // },
  {
    name: "Dr. Muhammad Sajid Hussain",
    designation:
      "Group leader, Institute of Biochemistry I, Medical Faculty",
    university: "University of Cologne, Germany",
    city: "Cologne",
    country: "Germany",
    email: "mhussain@uni-koeln.de",
    contact: "-",
    comments:
      "Research on molecular pathogenesis of inherited neurological disorders including microcephaly, Filippi syndrome, and essential tremor.",
    picture: "/assets/img/board-advisory/muhammad sajid.jpg",
  },
  {
    name: "Dr. Lars Allan Larsen",
    designation: "Professor of Developmental Genetics",
    university: "Copenhagen University",
    city: "Copenhagen",
    country: "Denmark",
    email: "larsal@sund.ku.dk",
    contact: "(+45) 35 32 78 27",
    comments:
      "Experienced research leader with expertise in developmental genetics, academic supervision, and interdisciplinary projects.",
    picture: "/assets/img/board-advisory/lars allan.jpg",
  },
  {
    name: "Dr. Muhammad Kamal Khan",
    designation:
      "Associate Professor at University of Maryland, College Park, USA",
    university: "University of Maryland, College Park, USA",
    city: "Maryland",
    country: "USA",
    email: "mkkamazai@hotmail.com",
    contact: "051-905-7656",
    comments:
      "PhD in English, specializes in TESOL, language policy, multilingual education, and phonetics with multiple international fellowships.",
    picture: "/assets/img/board-advisory/muhammad kamal khan.jpg",
  },
  {
    name: "Dr. Erica Davis",
    designation:
      "Professor, Pediatrics, Cell and Developmental Biology",
    university: "Northwestern University Feinberg School of Medicine",
    city: "Chicago, Illinois",
    country: "United States",
    email: "eridavis@luriechildrens.org",
    contact: "-",
    comments:
      "Research focuses on rare pediatric genetic diseases through Diversity, Discovery, and Development (3D).",
    picture: "/assets/img/board-advisory/erica e.jpg",
  },
];

const BoardAdvisoryArea = () => {
  const chairman = boardMembers.find((m) => m.name === "Dr. Shahid Baig");
  const otherMembers = boardMembers.filter(
    (m) => m.name !== "Dr. Shahid Baig"
  );

  const renderCard = (member, large = false) => (
    <div className="col-md-6 col-lg-4 mb-4" key={member.name}>
      <div
        className={`card h-100 text-center border-0 shadow-lg p-4 rounded-4 hover-card ${large ? "chairman-card" : ""
          }`}
      >
        {/* Profile Image */}
        <div className="mb-3">
          <img
            src={member.picture}
            alt={member.name}
            className="rounded-circle border border-4 border-primary"
            style={{
              width: large ? "170px" : "120px",
              height: large ? "170px" : "120px",
              objectFit: "cover",
              boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
            }}
          />
        </div>

        {/* Name & Designation */}
        <h4 className="fw-bold text-dark">{member.name}</h4>
        <p className="text-primary fw-semibold mb-2">{member.designation}</p>

        {/* University & Location */}
        {(member.university || member.city || member.country) && (
          <div className="text-muted small mb-3">
            {member.university && (
              <p className="mb-1">
                <i className="fas fa-university me-2 text-secondary"></i>
                {member.university}
              </p>
            )}
            {(member.city || member.country) && (
              <p className="mb-0">
                <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                {member.city}
                {member.city && member.country ? ", " : ""}
                {member.country}
              </p>
            )}
          </div>
        )}

        {/* Contact Info */}
        {(member.contact && member.contact !== "-") ||
          (member.email && member.email !== "-") ? (
          <div className="mb-3 text-secondary small">
            {member.contact && member.contact !== "-" && (
              <p className="mb-1">
                <i className="fas fa-phone-alt me-2 text-success"></i>
                {member.contact}
              </p>
            )}
            {member.email && member.email !== "-" && (
              <p className="mb-0">
                <i className="fas fa-envelope me-2 text-info"></i>
                {member.email}
              </p>
            )}
          </div>
        ) : null}

        {/* Comments */}
        {member.comments && member.comments !== "-" && (
          <blockquote className="blockquote mt-3 p-3 bg-light border-start border-4 border-primary rounded">
            <p className="mb-0 text-muted fst-italic">{member.comments}</p>
          </blockquote>
        )}
      </div>
    </div>
  );

  return (
    <section
      className="board-advisory py-5"
      style={{ background: "linear-gradient(135deg, #f9fafb, #eef1ff)" }}
    >
      <div className="container">
        {/* Main Heading */}
        <h2 className="text-center text-uppercase fw-bold text-primary mb-5">
          Board of Advisor (BOA)
        </h2>

        {/* Chairman Section */}
        <h3 className="text-success fw-bold text-center mb-4">Chairman</h3>
        <div className="row justify-content-center mb-5">
          {chairman && renderCard(chairman, true)}
        </div>

        {/* Members Section */}
        <h3 className="text-success fw-bold text-center mb-5">
          Nominee Members of BOA
        </h3>
        <div className="row g-4">{otherMembers.map((m) => renderCard(m))}</div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .hover-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
        }
        .chairman-card {
          border: 2px solid #0d6efd;
          background: #fdfdfd;
        }
      `}</style>
    </section>
  );
};

export default BoardAdvisoryArea;
