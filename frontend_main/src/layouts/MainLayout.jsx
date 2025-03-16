import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import Navbar from '../navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => {
  // const { initialLoading } = useAuth();

  // if (initialLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <Spinner size="large" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 