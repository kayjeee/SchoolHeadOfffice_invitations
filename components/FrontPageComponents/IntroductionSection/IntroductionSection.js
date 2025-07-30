import Link from 'next/link';
import { useSpring, animated } from '@react-spring/web';
const IntroductionSection = () => (
  <div className="relative flex flex-col items-center justify-center mt-0 p-8 bg-white shadow-2xl">
    <h3 className="text-4xl font-bold text-gray-800  mt-0">Introducing SchoolHeadOffice</h3>
    <p className="text-lg text-gray-700 mb-4 leading-relaxed">
    School communication made easy.
    </p>
    <Link href="/Personal">
      <button className="bg-blue-500 text-white px-8 py-4 rounded-md shadow-lg hover:bg-blue-600 transition-colors duration-300 text-lg font-bold">
        Get Started 
      </button>
    </Link>
  </div>
);

export default IntroductionSection;
