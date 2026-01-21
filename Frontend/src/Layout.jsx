import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from './Components/Navbars/UserNavbar';

function Layout({ children }) {
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

  const handleToggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Navbar */}
      <UserNavbar isOpen={isNavbarOpen} onToggle={handleToggleNavbar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children ? children : <Outlet />}
      </div>
    </div>
  );
}

export default Layout;
