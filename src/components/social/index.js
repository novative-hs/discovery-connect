import React from "react";

const social_links = [
  {
    link: "http://facebook.com",
    target: "_blank",
    icon: "fa-brands fa-facebook-f",
    name: "Facebook",
    color: "#1877F2", // Facebook blue
  },
  {
    link: "http://twitter.com",
    target: "_blank",
    icon: "fa-brands fa-twitter",
    name: "Twitter",
    color: "#1DA1F2", // Twitter blue
  },
  {
    link: "https://www.linkedin.com/",
    target: "_blank",
    icon: "fa-brands fa-linkedin-in",
    name: "LinkedIn",
    color: "#0077B5", // LinkedIn blue
  },
  {
    link: "https://www.youtube.com/",
    target: "_blank",
    icon: "fa-brands fa-youtube",
    name: "YouTube",
    color: "#FF0000", // YouTube red
  },
];

const SocialLinks = () => {
  return (
    <div className="d-flex gap-3"> {/* Bootstrap utility class for spacing */}
      {social_links.map((l, i) => (
        <a
          key={i}
          href={l.link}
          target={l.target}
          className="fs-5"
          style={{ color: l.color }} // Apply brand color
        >
          <i className={l.icon}></i>
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;

export function SocialShare() {
  return (
    <>
      {social_links.slice(0, 3).map((l, i) => (
        <a key={i} href={l.link} target={l.target} style={{ color: l.color }}>
          <i className={l.icon}></i>
        </a>
      ))}
    </>
  );
}
