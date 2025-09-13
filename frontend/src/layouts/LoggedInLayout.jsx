import { Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Context from '../Context';
import SideBar from '../components/SideBar'
import NavBar from '../components/NavBar';

const LinLayout = () => {
  const { fullSideBar } = useContext(Context);
  const { pathname } = useLocation();

  const urlmap = {
    '/': 'Dashboard',
    '/accounts': 'Accounts',
    '/transactions': 'Transactions',
    '/investments': 'Investments',
    '/assets': 'Assets',
  }

  return (
    <div className='flex flex-1 flex-col sm:flex-row h-screen w-screen'>
      {/* sidebar */}
      <div
        className={`hidden sm:flex sticky top-0 h-screen bg-green-600 transition-all duration-300 ${
          fullSideBar ? 'w-48' : 'w-16'
        }`}
      >
        <SideBar />
      </div>

      <main className='flex flex-col flex-1 bg-gray-100 transition-all duration-300'>

        {/* page header */}
        <div className='flex flex-col sticky top-0 z-10 bg-white shadow-md py-3 pl-4'>
          <h1 className='text-md font-bold text-gray-700'>
            {urlmap[pathname] || 'Unknown Page'}
          </h1>
        </div>
        
        <div className='flex-1 min-h-0 p-auto'>
          <Outlet />
        </div>

        {/* nav bar */}
        <div
          className='sm:hidden flex h-auto w-screen sticky bottom-0 bg-green-600 transition-all duration-200'
        >
          <NavBar />
        </div>
      </main>
    </div>
  );
};

export default LinLayout;