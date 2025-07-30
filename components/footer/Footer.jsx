import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white py-4 border-t w-full mt-auto z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 order-2 md:order-1 mb-4 md:mb-0 text-sm">
            <Link href="/contact">
              <span className="text-gray-600 hover:text-gray-900">Contact Us</span>
            </Link>
            <Link href="/privacy-policy">
              <span className="text-gray-600 hover:text-gray-900">Privacy Policy</span>
            </Link>
            <Link href="/terms-of-service">
              <span className="text-gray-600 hover:text-gray-900">Terms of Service</span>
            </Link>
          </div>
          <div className="flex space-x-4 order-3 md:order-2 mb-4 md:mb-0">
            <span href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-facebook-f"></i>
            </span>
            <span href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-twitter"></i>
            </span>
            <span href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
              <i className="fab fa-linkedin-in"></i>
            </span>
          </div>
          <div className="text-right order-1 md:order-3 mb-4 md:mb-0">
            <h3 className="text-xl font-bold">SchoolheadOffice(PTY) LTD</h3>
            <p className="text-gray-600">Comprehensive CRM for Student, Family, and School Administration</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
