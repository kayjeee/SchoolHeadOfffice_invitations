import Link from 'next/link';

const MenuReflectionTab: React.FC = () => {
  return (
    <div className="max-w-full mx-auto h-12 bg-white flex justify-between items-center px-4 border-b border-gray-200 shadow-lg">
      <Link href="/Careers" passHref>
        <span className="bg-white text-gray-800 cursor-pointer hover:underline py-2 px-4 border-b border-gray-300">
          Careers
        </span>
      </Link>
      <Link href="/Branches" passHref>
        <span className="bg-white text-gray-800 cursor-pointer hover:underline py-2 px-4 border-b border-gray-300">
          Branches
        </span>
      </Link>
      <Link href="/Call-center" passHref>
        <span className="bg-white text-gray-800 cursor-pointer hover:underline py-2 px-4 border-b border-gray-300">
          Call Center
        </span>
      </Link>
      <Link href="/Contact-us" passHref>
        <span className="bg-white text-gray-800 cursor-pointer hover:underline py-2 px-4 border-b border-gray-300">
          Contact Us
        </span>
      </Link>
      <Link href="/privacy-policy" passHref>
        <span className="bg-white text-gray-800 cursor-pointer hover:underline py-2 px-4 border-b border-gray-300">
          Privacy Policy
        </span>
      </Link>
    </div>
  );
};

export default MenuReflectionTab;
