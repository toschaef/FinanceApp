import { Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Context from '../Context';
import SideBar from '../components/SideBar'

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
    <div className='flex min-h-screen overscroll-none'>
      {/* sidebar */}
      <div
        className={`sticky top-0 h-screen bg-green-600 transition-all duration-300 ${
          fullSideBar ? 'w-48' : 'w-16'
        }`}
      >
        <SideBar />
      </div>

      <main className={'flex-1 bg-gray-100 transition-all duration-300'}>

        {/* page header */}
        <div className='flex flex-col sticky top-0 z-10 bg-white shadow-md py-3 pl-4'>
          <h1 className='text-md font-bold text-gray-700'>
            {urlmap[pathname] || 'Unknown Page'}
          </h1>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
};


export default LinLayout;