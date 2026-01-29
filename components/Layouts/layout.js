import Navbar from '../Nav/Navbar';
import Footer from '../footer/Footer';

interface LayoutProps {
  children: React.ReactNode;
  school?: {
    logo?: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, school }) => {
  return (
    <>
      <Navbar schoolImage={school?.logo} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
