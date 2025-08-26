import Navbar from '../Nav/Navbar';
import MobileNavbar from '../Mobile/Nav/MobileNavbar';
import Footer from '../footer/Footer';
import useWindowSize from '../hooks/useWindowSize'; // Import the custom hook

interface LayoutProps {
  children: React.ReactNode;
  school?: {
    logo?: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, school }) => {
  const size = useWindowSize(); // Get window size
  const isMobile = size.width <= 768; // Set a breakpoint (768px for mobile)

  return (
    <>
      {isMobile ? (
        <MobileNavbar schoolImage={school?.logo} />
      ) : (
        <Navbar schoolImage={school?.logo} />
      )}
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
