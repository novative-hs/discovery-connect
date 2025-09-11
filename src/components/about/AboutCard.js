import React from "react";

const AboutCard = ({ title, text, image, reverse, animation }) => {
    return (
        <div
            className={`row align-items-center mb-5 ${reverse ? "flex-md-row-reverse" : ""}`}
            data-aos={animation || "fade-right"}
        >
            {/* Image */}
            <div className="col-md-4 text-center mb-4 mb-md-0">
                <img
                    src={image}
                    alt={title}
                    className="img-fluid rounded shadow"
                    style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "auto",
                    }}
                />
            </div>

            {/* Content */}
            <div className="col-md-8">
                <div className="card border-0 shadow-sm p-4 h-100">
                    <h3 className="mb-3" style={{ color: "#2d3958" }}>
                        {title}
                    </h3>
                    <p
                        className="text-dark fs-6 lh-lg mb-0"
                        style={{ color: "#5c6a7c" }}
                    >
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutCard;