import React from 'react';
import Image from 'next/image';
// internal
import man from "@assets/img/login/shape-1.png";
import sample1 from "@assets/img/login/sample1.png";
import shape_2 from "@assets/img/login/shape-2.png";
// import sample3 from "@assets/img/login/sample3.png";

const Shapes = () => {
  return (
    <div className="login__shape">
      <Image
        className="login__shape-2"
        src={man}
        alt="man"
        width={250} 
        height={350}
        style={{ transform: "translate(-50px, 190px)" }} // Move right (60px) and down (30px)
      />
      <Image
        className="login__shape-3 absolute"
        src={sample1}
        alt="shape"
        width={230} // Smaller size
        height={150}
        style={{ left: '-20px' }} // Move left
      />
      <Image className="login__shape-4" src={shape_2} alt="shape" />
      {/* <Image className="login__shape-6" src={sample3} alt="shape" /> */}
    </div>
  );
};

export default Shapes;