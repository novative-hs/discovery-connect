import React from "react";

const social_links = [
  {
    link: "http://facebook.com",
    target: "_blank",
    icon: "fa-brands fa-facebook-f",
    name: "Facebook",
  },
  {
    link: "http://twitter.com",
    target: "_blank",
    icon: "fa-brands fa-twitter",
    name: "Twitter",
  },
  {
    link: "https://www.linkedin.com/",
    target: "_blank",
    icon: "fa-brands fa-linkedin-in",
    name: "Linkedin",
  },
  {
    link: "https://www.youtube.com/",
    target: "_blank",
    icon: "fa-brands fa-youtube",
    name: "Youtube",
  },
];

const SocialLinks = () => {
  return (
    <div className="d-flex gap-3"> {/* Bootstrap utility class for spacing */}
      {social_links.map((l, i) => (
        <a key={i} href={l.link} target={l.target} className="text-dark fs-4">
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
        <a key={i} href={l.link} target={l.target}>
          <i className={l.icon}></i>
        </a>
      ))}
    </>
  );
}
