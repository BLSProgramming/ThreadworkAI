import UserNavbar from './Components/Navbars/UserNavbar';

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-white">
      {/* Navbar */}
      <UserNavbar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default Layout;
