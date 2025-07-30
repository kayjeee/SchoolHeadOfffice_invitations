import React from 'react';
import Slider from 'react-slick';
import Card from './Card';
import { courses } from '../../data/Courses';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Courses = () => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1, // Show one slide at a time
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: false,
          dots: true,
        },
      },
    ],
  };

  return (
    <div className="w-full bg-[#E9F8F3B2] py-32">
      <div className="md:max-w-[1480px] m-auto max-w-[600px] px-4 md:px-0">
        <div className="py-4">
        </div>
        <Slider {...settings} className="px-5">
          {courses.map((course, i) => (
            <div key={i} className="p-2 h-full">
              <Card course={course} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Courses;
