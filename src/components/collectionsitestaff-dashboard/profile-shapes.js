import React from "react";
import Image from "next/image";
// internal
import laptop from "@assets/img/login/laptop.png";
import man from "@assets/img/login/man.png";
import shape_1 from "@assets/img/login/shape-1.png";
import shape_2 from "@assets/img/login/shape-2.png";
import shape_3 from "@assets/img/login/sample1.png";
import shape_4 from "@assets/img/login/injection.png";

const ProfileShapes = () => {
  return (
    <div className="profile__shape">
      <Image className="profile__shape-1" src={laptop} alt="profile__shape" />
      <Image className="profile__shape-2" src={man} alt="profile__shape" />
      <Image className="profile__shape-3" src={shape_1} alt="profile__shape" />
      <Image className="profile__shape-4" src={shape_2} alt="profile__shape" />
      <Image
        className="profile__shape-5"
        src={shape_3}
        alt="profile__shape"
        style={{
          transform: "translateX(50px)", // Move right
          width: "170px", 
          height: "120px"
        }}
      />
      <Image className="profile__shape-6" 
      src={shape_4} 
      alt="profile__shape" 
      style={{
        transform: "translateX(30px)", // Move right
        width: "65px", 
        height: "80px"
      }}
      />
    </div>
  );
};

export default ProfileShapes;
