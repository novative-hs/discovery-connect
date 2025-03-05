import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper";
// internal
import slider_img_1 from "@assets/img/slider/13/slider-1.png";
import slider_img_2 from "@assets/img/slider/13/slider-1.png";
import slider_img_3 from "@assets/img/slider/13/slider-4.png";
import { RightArrow } from "@svg/index";

const slider_data = [
  {
    id: 1,
    pre_title: (
      <>
        Discover the <br /> Best Samples
      </>
    ), // Updated pre-title
    title: (
      <>
        Find High-Quality <br /> Biological Samples
      </>
    ), // Updated title
    img: slider_img_1,
  },
  {
    id: 2,
    pre_title: (
      <>
        Browse & Select <br /> Your Sample
      </>
    ), // Updated pre-title
    title: (
      <>
        Find the Right <br /> Sample for Research
      </>
    ), // Updated title
    img: slider_img_2,
  },
  {
    id: 3,
    pre_title: (
      <>
        A Platform where <br /> You Can Get
      </>
    ),
    title: <>Samples</>,
    img: slider_img_3,
  },
];

const HeroBanner = () => {
  const [loop, setLoop] = useState(false);
  useEffect(() => setLoop(true), []);

  return (
    <section className="slider__area pt-0 mt-0">
      {" "}
      {/* Removed extra top margin */}
      <Swiper
        className="slider__active slider__active-13 swiper-container"
        slidesPerView={1}
        spaceBetween={0}
        effect="fade"
        loop={loop}
        modules={[EffectFade]}
      >
        {slider_data.map((item) => (
          <SwiperSlide
            key={item.id}
            className="slider__item-13 slider__height-13 grey-bg-17 d-flex align-items-center" // Changed from 'align-items-end' to 'align-items-center'
          >
            <div className="container">
              <div className="row align-self-center">
                {" "}
                {/* Changed 'align-self-end' to 'align-self-center' */}
                <div className="col-xl-6 col-lg-6">
                  <div className="slider__content-13">
                    <span className="slider__title-pre-13 fs-6 md-5">
                      {item.pre_title}
                    </span>
                    <p className="slider__title-13 text-black" style={{ fontSize: "3rem" }}>
  {item.title}
</p>



                    <div className="slider__btn-13">
                      <Link
                        href="/shop"
                        className="tp-btn-border btn-sm fs-7 justify-content-between gap-3"
                      >
                        Available Samples
                        <span>
                          <RightArrow />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 text-center">
                  <div className="slider__thumb-13">
                    <span className="slider__thumb-13-circle-1"></span>
                    <span className="slider__thumb-13-circle-2"></span>
                    <Image
                      src={item.img}
                      alt="slider img"
                      className="w-75 mx-auto"
                      priority
                      style={{ maxHeight: "600px", objectFit: "contain" }} // Adjust height if needed
                    />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroBanner;
