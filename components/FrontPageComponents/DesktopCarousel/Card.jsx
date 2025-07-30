import React from 'react';

const Card = ({ course }) => {
  return (
    <div className="z-10 bg-white drop-shadow-md overflow-hidden rounded-2xl mr-2 my-4 flex flex-row">
      <div className="w-1/2 h-full">
        <img src={course.linkImg} className="h-full w-full object-cover" alt={course.title} />
      </div>
      <div className="w-1/2 p-5 flex flex-col justify-between">
      <h3 className="text-4xl font-bold text-gray-800 mb-4 mt-6">{course.title} </h3>
      <h3 className="py-2 truncate">{course.category}
      
        </h3>
          <h3 className="text-xl">{course.reason}</h3>
          <div className="w-1/2 h-full"> <h1>{course.reasontwo} </h1> </div>
        
        </div>|
        <div className="absolute top-0 bg-white m-3 px-2 py-[2.5px] rounded font-bold">
        <div className="border-b pb-5">
     
        </div>
      </div>
      
    </div>
    
  );
};

export default Card;
