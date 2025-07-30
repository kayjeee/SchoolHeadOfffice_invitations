import React, { useRef } from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const DesktopCarousel = () => {
  const sliderRef = useRef(null);

  const play = () => {
    sliderRef.current.slickPlay();
  };

  const pause = () => {
    sliderRef.current.slickPause();
  };

  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div className="slider-container max-w-screen-xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-6">Auto Play & Pause with Buttons</h2>
      <Slider ref={sliderRef} {...settings}>
        <div className="relative">
          <img src="/schooladmin.png" alt="Background 1" className="w-full h-screen object-cover" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4 bg-gradient-to-t from-black to-transparent">
            <div className="carousel-content p-6 rounded-lg max-w-xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Searching Past Exams</h2>
              <p className="text-lg mb-6">Learners use past exams and AI exams to easily study and practice from home.</p>
              <button className="carousel-button bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out">More Info</button>
            </div>
          </div>
        </div>
        <div className="relative">
          <img src="/heroImg.png" alt="Background 2" className="w-full h-screen object-cover" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4 bg-gradient-to-t from-black to-transparent">
            <div className="carousel-content p-6 rounded-lg max-w-xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Slide 2</h2>
              <p className="text-lg mb-6">Content for slide 2.</p>
              <button className="carousel-button bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out">More Info</button>
            </div>
          </div>
        </div>
        {/* Add more slides as needed */}
      </Slider>
      <div className="text-center mt-6">
        <button className="button bg-gray-800 text-white py-2 px-4 rounded-lg mx-2 hover:bg-gray-600 transition duration-300 ease-in-out" onClick={play}>Play</button>
        <button className="button bg-gray-800 text-white py-2 px-4 rounded-lg mx-2 hover:bg-gray-600 transition duration-300 ease-in-out" onClick={pause}>Pause</button>
      </div>
    </div>
  );
};

const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} next-arrow`}
      style={{ ...style, display: 'block', right: '10px', zIndex: 1 }}
      onClick={onClick}
    >
      <i className="fas fa-chevron-right text-white text-2xl"></i>
    </div>
  );
};

const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} prev-arrow`}
      style={{ ...style, display: 'block', left: '10px', zIndex: 1 }}
      onClick={onClick}
    >
      <i className="fas fa-chevron-left text-white text-2xl"></i>
    </div>
  );
};

export default DesktopCarousel;
