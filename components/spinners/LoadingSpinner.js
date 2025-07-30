import React from 'react';
import Link from 'next/link';

const LoadingSpinner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-white ">
      
      <Link href="/" passHref>
      <img
        src={'/felixwhitbg.png'}
        alt="logo"
        width="370"
        height="370"
        className="md:order-first order-last cursor-pointer"
      />
      <span className="text-gray-800 cursor-pointer hover:underline">Dont panic, We Just Loading</span>
    </Link>
 
    </div>
  );
};

export default LoadingSpinner;
