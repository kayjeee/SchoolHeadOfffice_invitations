import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white py-4 border-t w-full mt-auto z-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center flex-wrap">
          
          {/* Internal Links */}
          <div className="flex space-x-4 order-2 md:order-1 mb-4 md:mb-0 text-sm">
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact Us
            </Link>
            <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4 order-3 md:order-2 mb-4 md:mb-0">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>

          {/* Company Info */}
          <div className="text-right order-1 md:order-3 mb-4 md:mb-0">
            <h3 className="text-xl font-bold">SchoolheadOffice (PTY) LTD</h3>
            <p className="text-gray-600">
              Comprehensive CRM for Student, Family, and School Administration
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
