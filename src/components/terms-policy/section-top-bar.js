import React from "react";

const SectionTop = ({ title, subtitle, backgroundImage }) => {
  return (
    <section
      className="tp-section-area p-relative"
      style={{
        backgroundColor: "#EEF1FF",
        padding: "100px 0",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
      }}
    >
      {/* Overlay */}
      {backgroundImage && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)", // dark overlay
            zIndex: 0,
          }}
        />
      )}

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-xl-7 col-lg-8">
            <div className="tp-section-wrapper-2 text-center">
              {/* Title with gradient */}
              <h3
                className="tp-section-title-2 font-70"
                style={{
                  color: "#ffffffff",   // 👈 text color
                  fontWeight: "bold",
                  textDecorationColor: "#ff3535",
                }}
              >
                {title}
              </h3>


              {/* Subtitle with muted gray/soft color */}
              {subtitle && (
                <p
                  style={{
                    color: "#f1f1f1", // light gray for contrast
                    fontSize: "18px",
                    marginTop: "15px",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionTop;
