import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const MobileCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000, // 3 seconds
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div className="carousel-container w-full h-screen relative">
      <Slider {...settings}>
        <div className="carousel-slide relative flex items-center justify-center h-screen">
          <div className="absolute inset-0 border-2 border-gray-300 shadow-lg overflow-hidden">
            <img src="/schooladmin.png" alt="Background 1" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end items-center text-white text-center bg-black bg-opacity-30 p-4">
              <div className="carousel-content bg-gray-800 bg-opacity-50 p-4 rounded w-full">
                <h2 className="text-2xl font-bold mb-2">Searching Past exams</h2>
                <p className="text-lg mb-5">Learners use past exams and AI exams to easily study and practice from home.</p>
                <button className="carousel-button bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out">More info</button>
              </div>
            </div>
          </div>
        </div>
        <div className="carousel-slide relative flex items-center justify-center h-screen">
          <div className="absolute inset-0 border-2 border-gray-300 shadow-lg overflow-hidden">
            <img src="/heroImg.png" alt="Background 2" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end items-center text-white text-center bg-black bg-opacity-30 p-4">
              <div className="carousel-content bg-gray-800 bg-opacity-50 p-4 rounded w-full">
                <h2 className="text-2xl font-bold mb-2">Slide 2</h2>
                <p className="text-lg mb-5">Content for slide 2.</p>
                <button className="carousel-button bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out">More info</button>
              </div>
            </div>
          </div>
        </div>
        {/* Add more slides as needed */}
      </Slider>
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

export default MobileCarousel;
