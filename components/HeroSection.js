import React from 'react';

export const HeroSection = ({ title, description, buttonText, onButtonClick }) => {
  return (
    <section className="bg-blue-600 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg mb-8">{description}</p>
        <button
          onClick={onButtonClick}  
          className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-100 hover:text-blue-700"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
