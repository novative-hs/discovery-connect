import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

// ✅ Image & Text Data
const slider_data = [
  {
    id: 1,
    pre_title: "Hassle-Free Sample Collection",
    title: "Order. Collect. Analyze.",
    image: "/assets/img/slider/13/slider-10.png",
  },
  {
    id: 2,
    pre_title: "Precision in Every Sample",
    title: "Ensuring Accuracy from Collection to Results",
    image: "/assets/img/slider/13/slider-6.png",
  },
  {
    id: 3,
    pre_title: "Simplifying Sample Orders",
    title: "Fast, Reliable, and Secure",
    image: "/assets/img/slider/13/slider-9.png",
  },
  
  {
    id: 4,
    pre_title: "Trusted by Professionals",
    title: "Seamless Sample Ordering & Collection",
    image: "/assets/img/slider/13/slider-8.png",
  },
];


const HeroBanner = () => {
  // ✅ Create Ref for Swiper Instance
  const swiperRef = useRef(null);

  return (
    <section className="position-relative">
      {/* ✅ Swiper Component */}
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        effect="slide"
        loop
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        modules={[Autoplay, Pagination]}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => (swiperRef.current = swiper)} // Store Swiper instance
      >
        {slider_data.map((item) => (
          <SwiperSlide key={item.id} className="position-relative" style={{ height: "100vh" }}>
            {/* ✅ Background Image */}
            <img
              src={item.image}
              alt={item.title}
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ objectFit: "cover", zIndex: "-1", filter: "blur(3px)" }}
            />

            {/* ✅ Dark Overlay */}
            <div className="position-absolute top-0 start-0 w-100 bg-dark h-100 opacity-50"></div>

            {/* ✅ Text Content */}
            <div className="container position-absolute top-50 start-50 translate-middle text-center text-white">
              <h1 className="fw-bold text-white" style={{ fontFamily: '"Poppins", sans-serif', fontSize: "2.8rem", textShadow: "2px 2px 4px rgba(0,0,0,0.8)"  }}>
                {item.pre_title}
              </h1>
              <h3 className="fw-bold text-white" style={{ fontFamily: '"Playfair Display", serif', fontSize: "2.3rem", fontWeight: "700", textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
                {item.title}
              </h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ✅ Bootstrap Navigation Buttons */}
      <button
        className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-3"
        style={{ zIndex: 10, width: "50px", height: "50px", borderRadius: "50%" }} // ✅ Ensuring visibility
        onClick={() => swiperRef.current?.slidePrev()}
      >
        ❮
      </button>
      <button
        className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-3"
        style={{ zIndex: 10, width: "50px", height: "50px", borderRadius: "50%" }} // ✅ Ensuring visibility
        onClick={() => swiperRef.current?.slideNext()}
      >
        ❯
      </button>
    </section>
  );
};

export default HeroBanner;
