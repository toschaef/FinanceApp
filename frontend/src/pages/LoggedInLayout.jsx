import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import Context from '../Context';
import SideBar from '../components/SideBar'

const LinLayout = () => {
  const { fullSideBar } = useContext(Context);

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-green-600 transition-all duration-300 ${
          fullSideBar ? "w-60" : "w-16"
        }`}
      >
        <SideBar />
      </div>

      {/* Main content that shifts */}
      <div
        className={`flex-1 bg-gray-100 transition-all duration-300 ${
          fullSideBar ? "ml-60" : "ml-16"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};


export default LinLayout;