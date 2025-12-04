import { useState } from 'react';
import UserNavbar from './Components/Navbars/UserNavbar';

function Layout({ children }) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Navbar */}
      <UserNavbar isOpen={isNavbarOpen} onToggle={toggleNavbar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default Layout;
